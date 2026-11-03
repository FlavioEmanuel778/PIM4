import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

// Anexos dos conteúdos ficam em disco (fora de /public), e só saem por rota autenticada.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), "storage", "uploads");
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const TYPES: Record<string, { mime: string; matches: (b: Buffer) => boolean }> = {
  pdf: { mime: "application/pdf", matches: (b) => b.subarray(0, 4).toString("latin1") === "%PDF" },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", matches: (b) => b[0] === 0x50 && b[1] === 0x4b },
  mp4: { mime: "video/mp4", matches: (b) => b.subarray(4, 8).toString("latin1") === "ftyp" }
};
export const ALLOWED_EXTENSIONS = Object.keys(TYPES);

export class UploadError extends Error { constructor(message: string) { super(message); } }
const STORED_NAME = /^[a-f0-9-]{36}\.(pdf|docx|mp4)$/;

export type StoredFile = { file: string; name: string; size: number; mime: string };

// Valida extensão, tamanho e assinatura do arquivo (não confia só no nome) e grava com nome aleatório.
export async function storeBuffer(buffer: Buffer, originalName: string): Promise<StoredFile> {
  const ext = extname(originalName).slice(1).toLowerCase();
  const type = TYPES[ext];
  if (!type) throw new UploadError("Use um arquivo PDF, DOCX ou MP4.");
  if (buffer.length === 0) throw new UploadError("O arquivo está vazio.");
  if (buffer.length > MAX_UPLOAD_BYTES) throw new UploadError("O arquivo deve ter no máximo 20 MB.");
  if (!type.matches(buffer)) throw new UploadError("O conteúdo do arquivo não corresponde ao formato informado.");
  const file = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, file), buffer);
  const name = basename(originalName).replace(/[\u0000-\u001f"\\/]/g, "").slice(0, 120) || `arquivo.${ext}`;
  return { file, name, size: buffer.length, mime: type.mime };
}
export async function storeUpload(file: File): Promise<StoredFile> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("O arquivo deve ter no máximo 20 MB.");
  return storeBuffer(Buffer.from(await file.arrayBuffer()), file.name);
}
export async function readStored(file: string): Promise<Buffer | null> {
  if (!STORED_NAME.test(file)) return null;
  try { return await readFile(join(UPLOAD_DIR, file)); } catch { return null; }
}
export async function removeStored(file: string | null | undefined) {
  if (!file || !STORED_NAME.test(file)) return;
  await unlink(join(UPLOAD_DIR, file)).catch(() => {});
}
// 1258291 -> "1,2 MB"
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
