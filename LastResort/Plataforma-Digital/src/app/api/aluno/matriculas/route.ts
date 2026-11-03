import { requireStudent } from "@/lib/auth-guard";
import { enroll } from "@/lib/courses";

export async function POST(request: Request) {
  const guard = await requireStudent(); if ("error" in guard) return guard.error;
  const body = await request.json().catch(() => null);
  const courseId = Number(body?.courseId);
  if (!Number.isInteger(courseId) || courseId < 1) return Response.json({ message: "Curso inválido." }, { status: 400 });
  if (!(await enroll(guard.session.user.id, courseId))) return Response.json({ message: "Curso não encontrado." }, { status: 404 });
  return Response.json({ message: "Matrícula feita.", courseId }, { status: 201 });
}
