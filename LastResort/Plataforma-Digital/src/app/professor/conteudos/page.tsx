import Link from "next/link";
import { ArrowLeft, Info, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ContentsList } from "@/components/ContentsList";
import { CourseSelect } from "@/components/CourseSelect";
import { requirePageUser } from "@/lib/auth-guard";
import { listManagedContents, pickCourse } from "@/lib/professor";

export const metadata = { title: "Conteúdos • EduDigital" };
export const dynamic = "force-dynamic";

export default async function ContentsPage({ searchParams }: { searchParams: Promise<{ curso?: string; salvo?: string }> }) {
  const user = await requirePageUser("professor");
  const sp = await searchParams; const { courses, course } = await pickCourse(user.id, sp.curso);
  const items = course ? await listManagedContents(course.id) : [];
  const published = items.filter((i) => i.published).length;
  return (
    <AppShell area="professor" nav="/professor/conteudos" crumbs={["Professor", "Disciplinas › Conteúdos"]} user={user}>
      <div className="page">
        <Link className="back-link" href="/professor"><ArrowLeft aria-hidden />Voltar para Minhas Disciplinas</Link>
        <div className="page-head"><div><h1>Conteúdos</h1><p>Organize os materiais de aprendizagem e mantenha sua disciplina atualizada.</p></div></div>
        {!course ? <div className="callout info"><div><strong>Nenhuma disciplina vinculada</strong><p>Quando a administração vincular uma disciplina a você, os conteúdos aparecerão aqui.</p></div></div> : (<>
          <p className="label">Disciplina</p>
          <div className="select-row"><CourseSelect basePath="/professor/conteudos" courses={courses} value={course.id} /><span className="caption">{course.students} {course.students === 1 ? "aluno" : "alunos"} • {course.teacherName}</span></div>
          <div className="card table-card">
            <div className="grades-head"><div><h2>{course.name}</h2><small>{published} {published === 1 ? "conteúdo publicado" : "conteúdos publicados"}</small></div><Link className="btn btn-primary" href={`/professor/conteudos/novo?curso=${course.id}`}><Plus aria-hidden />Adicionar conteúdo</Link></div>
            <ContentsList key={`${course.id}-${items.length}-${sp.salvo ?? ""}`} courseId={course.id} items={items} saved={sp.salvo === "criado" || sp.salvo === "editado" ? sp.salvo : null} />
            <div className="table-foot"><span>Mostrando {items.length} de {items.length} {items.length === 1 ? "conteúdo" : "conteúdos"}</span></div>
          </div>
          <div className="callout info" style={{ marginTop: 20 }}><Info aria-hidden /><div><strong>Materiais disponíveis para os alunos</strong><p>Os conteúdos publicados aparecem na disciplina. Revise os títulos, as descrições e os materiais antes de salvar alterações.</p></div></div>
        </>)}
      </div>
    </AppShell>
  );
}
