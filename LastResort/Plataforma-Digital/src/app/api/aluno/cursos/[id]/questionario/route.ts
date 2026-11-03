import { requireStudent } from "@/lib/auth-guard";
import { QuizError, submitQuiz } from "@/lib/courses";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  const guard = await requireStudent(); if ("error" in guard) return guard.error;
  const courseId = Number((await context.params).id);
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(courseId) || courseId < 1 || !body?.answers || typeof body.answers !== "object") return Response.json({ message: "Dados inválidos." }, { status: 400 });
  try {
    const result = await submitQuiz(guard.session.user.id, courseId, body.answers);
    return Response.json({ message: "Questionário enviado.", ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof QuizError) return Response.json({ message: error.message }, { status: error.status });
    console.error(error); return Response.json({ message: "Não foi possível enviar o questionário." }, { status: 500 });
  }
}
