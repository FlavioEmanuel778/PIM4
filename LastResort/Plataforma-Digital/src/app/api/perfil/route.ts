import { requireUser } from "@/lib/auth-guard";
import { exec, queryOne } from "@/lib/db";
import { compact, normalizeEmail, validateEmail, validateName } from "@/lib/validation";

// Atualiza nome e e-mail do próprio usuário logado.
export async function PUT(request: Request) {
  const guard = await requireUser(); if ("error" in guard) return guard.error;
  const body = await request.json().catch(() => null);
  const errors = compact({ name: validateName(body?.name) ?? undefined, email: validateEmail(body?.email) ?? undefined });
  if (Object.keys(errors).length) return Response.json({ message: "Revise os campos indicados.", errors }, { status: 400 });
  const email = normalizeEmail(body.email); const userId = guard.session.user.id;
  if (await queryOne("SELECT id FROM user WHERE email = ? AND id <> ?", [email, userId])) {
    return Response.json({ message: "Este e-mail já está cadastrado.", errors: { email: "E-mail já cadastrado" } }, { status: 409 });
  }
  await exec("UPDATE user SET name = ?, email = ? WHERE id = ?", [String(body.name).trim(), email, userId]);
  return Response.json({ message: "Dados atualizados." });
}
