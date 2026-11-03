import { requireUser } from "@/lib/auth-guard";
import { queryOne } from "@/lib/db";
import { isEnrolled } from "@/lib/courses";
import { canManageCourse } from "@/lib/professor";
import { readStored } from "@/lib/uploads";

type Context = { params: Promise<{ id: string }> };

// Entrega o anexo só para quem pode ver o conteúdo: admin, professor da disciplina ou aluno matriculado (conteúdo publicado).
export async function GET(_request: Request, context: Context) {
  const guard = await requireUser(); if ("error" in guard) return guard.error;
  const id = Number((await context.params).id);
  const row = Number.isInteger(id) ? await queryOne<{ course_id: number; published: number; material_file: string | null; material_name: string | null; material_mime: string | null }>(
    "SELECT course_id, published, material_file, material_name, material_mime FROM contents WHERE id = ? AND material_kind = 'arquivo'", [id]) : null;
  if (!row?.material_file) return Response.json({ message: "Arquivo não encontrado." }, { status: 404 });
  const user = guard.session.user;
  const allowed = user.role === "admin" || (user.role === "professor" && (await canManageCourse(user.id, row.course_id)))
    || (user.role === "aluno" && !!row.published && (await isEnrolled(user.id, row.course_id)));
  if (!allowed) return Response.json({ message: "Acesso negado." }, { status: 403 });
  const data = await readStored(row.material_file);
  if (!data) return Response.json({ message: "O arquivo não está mais disponível." }, { status: 404 });
  const inline = row.material_mime === "application/pdf" || row.material_mime === "video/mp4";
  const name = encodeURIComponent(row.material_name ?? "material");
  return new Response(new Uint8Array(data), { headers: {
    "Content-Type": row.material_mime ?? "application/octet-stream", "Content-Length": String(data.length),
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${name}`,
    "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"
  } });
}
