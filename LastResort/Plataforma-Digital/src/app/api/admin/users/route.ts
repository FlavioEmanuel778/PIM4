import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

// Lista de usuários para administração. Não retorna hashes/sessões.
export async function GET() {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const [rows] = await db.query("SELECT id, name, email, role, banned, banReason, banExpires, createdAt FROM user ORDER BY createdAt DESC");
  return Response.json({ data: rows });
}
