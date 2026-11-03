import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { requirePageUser } from "@/lib/auth-guard";
import { getExerciseForStudent } from "@/lib/courses";
import { toId } from "@/lib/params";

export const dynamic = "force-dynamic";
export default async function ExercisePage({ params }: { params: Promise<{ id: string; eid: string }> }) {
  const user = await requirePageUser("aluno");
  const p = await params; const courseId = toId(p.id); const exId = toId(p.eid); if (!courseId || !exId) notFound();
  const data = await getExerciseForStudent(user.id, courseId, exId); if (!data) notFound();
  const { exercise, course, reviewed } = data;
  return (
    <AppShell area="aluno" nav="/aluno" crumbs={["Aluno", `${course.name} › Exercício`]} user={user}>
      <div className="page page-narrow">
        <Link className="back-link" href={`/aluno/cursos/${courseId}`}><ArrowLeft aria-hidden />Voltar ao curso</Link>
        <div className="page-head"><div><h1>Exercício de prática</h1><p>{course.name} • {exercise.title}</p></div></div>
        {/* key reinicia o estado ao navegar para outro exercício */}
        <ExerciseRunner key={exercise.id} exercise={exercise} courseId={courseId} courseName={course.name} reviewed={reviewed} />
      </div>
    </AppShell>
  );
}
