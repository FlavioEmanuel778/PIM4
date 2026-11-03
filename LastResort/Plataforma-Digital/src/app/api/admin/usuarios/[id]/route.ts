import { requireAdmin } from "@/lib/auth-guard";
import { deleteUser, getUser, updateUser, userErrorResponse } from "@/lib/users";

type Context = { params: Promise<{ id: string }> };

// R: detalhes de um aluno ou professor (nunca expõe senha).
export async function GET(_request: Request, context: Context) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const user = await getUser((await context.params).id);
  return user ? Response.json({ data: user }) : Response.json({ message: "Cadastro não encontrado." }, { status: 404 });
}

// U: atualiza nome, e-mail e, opcionalmente, a senha.
export async function PUT(request: Request, context: Context) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const current = await getUser(id);
  if (!current) return Response.json({ message: "Cadastro não encontrado." }, { status: 404 });
  if (!body) return Response.json({ message: "Dados inválidos." }, { status: 400 });
  try { await updateUser(id, current.role, body); return Response.json({ message: "Cadastro atualizado." }); }
  catch (error) { return userErrorResponse(error); }
}

// D: exclui o cadastro (matrículas e progresso saem junto; cursos ficam sem professor).
export async function DELETE(_request: Request, context: Context) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const { id } = await context.params;
  const current = await getUser(id);
  if (!current) return Response.json({ message: "Cadastro não encontrado." }, { status: 404 });
  try { await deleteUser(id, current.role); return Response.json({ message: "Cadastro excluído." }); }
  catch (error) { return userErrorResponse(error); }
}
