import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/auth-guard";
import { compact, validatePassword } from "@/lib/validation";

// Troca a senha do próprio usuário. Exige a senha atual e mantém esta sessão aberta.
export async function POST(request: Request) {
  const guard = await requireUser(); if ("error" in guard) return guard.error;
  const body = await request.json().catch(() => null);
  const errors = compact({
    current: typeof body?.current === "string" && body.current ? undefined : "Informe a senha atual",
    password: validatePassword(body?.password, { min: 12 }) ?? undefined,
    confirm: body?.password === body?.confirm ? undefined : "As senhas não coincidem"
  });
  if (Object.keys(errors).length) return Response.json({ message: "Revise os campos indicados.", errors }, { status: 400 });
  const res = await auth.api.changePassword({
    headers: request.headers, asResponse: true,
    body: { currentPassword: body.current, newPassword: body.password, revokeOtherSessions: true }
  });
  if (!res.ok) return Response.json({ message: "A senha atual está incorreta.", errors: { current: "Senha atual incorreta" } }, { status: 400 });
  const out = Response.json({ message: "Senha atualizada." });
  for (const cookie of res.headers.getSetCookie()) out.headers.append("set-cookie", cookie); // mantém a sessão atual
  return out;
}
