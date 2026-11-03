import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const { id } = await context.params;
  if (id === guard.session.user.id) return Response.json({ message: "Admin não pode bloquear a própria conta." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  try {
    await auth.api.banUser({ headers: request.headers, body: { userId: id, banReason: typeof body.reason === "string" ? body.reason : "Bloqueio administrativo" } });
    return Response.json({ message: "Usuário bloqueado." });
  } catch { return Response.json({ message: "Não foi possível bloquear. Confira o ID e a sessão do admin." }, { status: 400 }); }
}
