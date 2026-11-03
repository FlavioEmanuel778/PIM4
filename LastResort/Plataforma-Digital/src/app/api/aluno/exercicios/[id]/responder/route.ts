import { requireStudent } from "@/lib/auth-guard";
import { answerExercise, isChoice } from "@/lib/courses";

type Context = { params: Promise<{ id: string }> };
// Corrige no servidor e só então revela a alternativa certa e a explicação.
export async function POST(request: Request, context: Context) {
  const guard = await requireStudent(); if ("error" in guard) return guard.error;
  const id = Number((await context.params).id);
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(id) || id < 1) return Response.json({ message: "Exercício inválido." }, { status: 400 });
  if (!isChoice(body?.choice)) return Response.json({ message: "Escolha uma alternativa." }, { status: 400 });
  const result = await answerExercise(guard.session.user.id, id, body.choice);
  return result ? Response.json(result) : Response.json({ message: "Exercício não encontrado." }, { status: 404 });
}
