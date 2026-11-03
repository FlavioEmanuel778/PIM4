import { requireStudent } from "@/lib/auth-guard";
import { completeContent } from "@/lib/courses";

type Context = { params: Promise<{ id: string }> };
export async function POST(_request: Request, context: Context) {
  const guard = await requireStudent(); if ("error" in guard) return guard.error;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1 || !(await completeContent(guard.session.user.id, id))) return Response.json({ message: "Conteúdo não encontrado." }, { status: 404 });
  return Response.json({ message: "Conteúdo concluído." });
}
