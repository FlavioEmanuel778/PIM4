import { requireProfessor } from "@/lib/auth-guard";
import { canManageCourse, ContentError, saveGrades } from "@/lib/professor";

// Lança as notas do questionário avaliativo de toda a turma. Corpo: { courseId, grades: { [alunoId]: "7,5" } }
export async function POST(request: Request) {
  const guard = await requireProfessor(); if ("error" in guard) return guard.error;
  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId);
  if (!Number.isInteger(courseId) || !body?.grades || typeof body.grades !== "object") return Response.json({ message: "Dados inválidos." }, { status: 400 });
  if (!(await canManageCourse(guard.session.user.id, courseId))) return Response.json({ message: "Você não tem acesso a esta disciplina." }, { status: 403 });
  try { const saved = await saveGrades(courseId, guard.session.user.id, body.grades); return Response.json({ message: "Notas salvas.", saved }); }
  catch (error) {
    if (error instanceof ContentError) return Response.json({ message: error.message, errors: error.errors }, { status: error.status });
    console.error(error); return Response.json({ message: "Não foi possível salvar as notas." }, { status: 500 });
  }
}
