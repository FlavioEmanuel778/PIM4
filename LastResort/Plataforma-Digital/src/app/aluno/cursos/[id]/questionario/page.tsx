import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { QuizRunner } from "@/components/QuizRunner";
import { requirePageUser } from "@/lib/auth-guard";
import { getQuizForStudent } from "@/lib/courses";
import { toId } from "@/lib/params";

export const dynamic = "force-dynamic";
export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser("aluno");
  const courseId = toId((await params).id); if (!courseId) notFound();
  const quiz = await getQuizForStudent(user.id, courseId); if (!quiz || !quiz.questions.length) notFound();
  if (quiz.alreadyDone) redirect(`/aluno/cursos/${courseId}/resultado`);
  return (
    <AppShell area="aluno" nav="/aluno" crumbs={["Aluno", `${quiz.course.name} › Questionário`]} user={user}>
      <div className="page page-narrow">
        <div className="page-head"><div><h1>Questionário avaliativo</h1><p>{quiz.course.name} • Confira suas respostas antes de enviar.</p></div></div>
        <QuizRunner courseId={courseId} questions={quiz.questions} />
      </div>
    </AppShell>
  );
}
