import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const { id } = await context.params;
  try { await auth.api.unbanUser({ headers: request.headers, body: { userId: id } }); return Response.json({ message: "Usuário desbloqueado." }); }
  catch { return Response.json({ message: "Não foi possível desbloquear. Confira o ID e a sessão do admin." }, { status: 400 }); }
}
