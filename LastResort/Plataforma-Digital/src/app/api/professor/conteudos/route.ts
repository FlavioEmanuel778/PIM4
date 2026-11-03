import { requireProfessor } from "@/lib/auth-guard";
import { contentErrorResponse, readContentForm } from "@/lib/content-http";
import { canManageCourse, createContent } from "@/lib/professor";

// C: adiciona conteúdo (multipart/form-data, com anexo ou link) a uma disciplina do professor.
export async function POST(request: Request) {
  const guard = await requireProfessor(); if ("error" in guard) return guard.error;
  const parsed = await readContentForm(request);
  if (!parsed) return Response.json({ message: "Dados inválidos." }, { status: 400 });
  const courseId = Number(parsed.form.get("courseId"));
  if (!Number.isInteger(courseId) || !(await canManageCourse(guard.session.user.id, courseId))) return Response.json({ message: "Você não tem acesso a esta disciplina." }, { status: 403 });
  try { const id = await createContent(courseId, parsed.input); return Response.json({ message: "Conteúdo criado.", id }, { status: 201 }); }
  catch (error) { return contentErrorResponse(error); }
}
