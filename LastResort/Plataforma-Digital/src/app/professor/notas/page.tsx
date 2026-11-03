import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CourseSelect } from "@/components/CourseSelect";
import { GradesForm } from "@/components/GradesForm";
import { requirePageUser } from "@/lib/auth-guard";
import { getGradeSheet, pickCourse } from "@/lib/professor";

export const metadata = { title: "Lançar notas • EduDigital" };
export const dynamic = "force-dynamic";

export default async function GradesPage({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const user = await requirePageUser("professor");
  const { courses, course } = await pickCourse(user.id, (await searchParams).curso);
  const rows = course ? await getGradeSheet(course.id) : [];
  return (
    <AppShell area="professor" nav="/professor/notas" crumbs={["Professor", "Notas › Lançar notas"]} user={user}>
      <div className="page">
        <Link className="back-link" href={course ? `/professor/turma?curso=${course.id}` : "/professor"}><ArrowLeft aria-hidden />Voltar para Turma</Link>
        <div className="page-head"><div><h1>Lançar notas</h1><p>Preencha as notas da atividade e salve o lançamento da turma.</p></div></div>
        {!course ? <div className="callout info"><div><strong>Nenhuma disciplina vinculada</strong><p>Quando a administração vincular uma disciplina a você, poderá lançar notas aqui.</p></div></div> : (<>
          <div className="two-fields">
            <div><label className="label" htmlFor="curso">Disciplina</label><CourseSelect basePath="/professor/notas" courses={courses} value={course.id} /></div>
            <div><label className="label" htmlFor="atividade">Atividade avaliativa</label><input id="atividade" className="input" value="Questionário avaliativo" readOnly /></div>
          </div>
          <p className="note" style={{ margin: "0 0 16px" }}>Informe uma nota de 0 a 10 para cada aluno. Use vírgula para casas decimais, como 7,5. A nota lançada substitui a correção automática do questionário; deixe em branco para voltar a usá-la.</p>
          <GradesForm key={course.id} courseId={course.id} courseName={course.name} rows={rows} />
        </>)}
      </div>
    </AppShell>
  );
}
