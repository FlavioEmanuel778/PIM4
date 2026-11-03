import { requireProfessor } from "@/lib/auth-guard";
import { canManageCourse, deleteContent, getManagedContent, updateContent } from "@/lib/professor";
import { contentErrorResponse, readContentForm } from "@/lib/content-http";

type Context = { params: Promise<{ id: string }> };
async function authorize(context: Context) {
  const guard = await requireProfessor(); if ("error" in guard) return { error: guard.error } as const;
  const id = Number((await context.params).id);
  const content = Number.isInteger(id) ? await getManagedContent(id) : null;
  if (!content) return { error: Response.json({ message: "Conteúdo não encontrado." }, { status: 404 }) } as const;
  if (!(await canManageCourse(guard.session.user.id, content.courseId))) return { error: Response.json({ message: "Você não tem acesso a esta disciplina." }, { status: 403 }) } as const;
  return { id } as const;
}

// U: atualiza título, descrição, publicação e anexo/link (sem novo arquivo, o anexo atual é mantido).
export async function PUT(request: Request, context: Context) {
  const auth = await authorize(context); if ("error" in auth) return auth.error;
  const parsed = await readContentForm(request);
  if (!parsed) return Response.json({ message: "Dados inválidos." }, { status: 400 });
  try { await updateContent(auth.id, parsed.input); return Response.json({ message: "Conteúdo atualizado." }); }
  catch (error) { return contentErrorResponse(error); }
}

// D: exclui o conteúdo e o arquivo anexado.
export async function DELETE(_request: Request, context: Context) {
  const auth = await authorize(context); if ("error" in auth) return auth.error;
  try { await deleteContent(auth.id); return Response.json({ message: "Conteúdo excluído." }); }
  catch (error) { return contentErrorResponse(error); }
}
