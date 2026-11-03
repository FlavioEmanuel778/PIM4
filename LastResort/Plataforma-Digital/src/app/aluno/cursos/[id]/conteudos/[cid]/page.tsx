import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, FileText, Link2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CompleteContentButton } from "@/components/StudentActions";
import { StudyBody } from "@/components/StudyBody";
import { requirePageUser } from "@/lib/auth-guard";
import { getContentForStudent, getCourse } from "@/lib/courses";
import { formatDuration } from "@/lib/format";
import { formatBytes } from "@/lib/uploads";
import { toId } from "@/lib/params";

export const dynamic = "force-dynamic";
export default async function ContentPage({ params }: { params: Promise<{ id: string; cid: string }> }) {
  const user = await requirePageUser("aluno");
  const p = await params; const courseId = toId(p.id); const contentId = toId(p.cid); if (!courseId || !contentId) notFound();
  const data = await getContentForStudent(user.id, courseId, contentId); const course = await getCourse(courseId); if (!data || !course) notFound();
  const { content, done, next } = data; const base = `/aluno/cursos/${courseId}`; const m = content.material;
  return (
    <AppShell area="aluno" nav="/aluno" crumbs={["Aluno", `Meus Cursos › ${course.name}`]} user={user}>
      <div className="page page-narrow">
        <Link className="back-link" href={base}><ArrowLeft aria-hidden />Voltar ao curso</Link>
        <div className="page-head"><div><span className="eyebrow-plain">{course.name} / Conteúdo</span><h1>{content.title}</h1><p>{content.description}</p></div></div>
        <article className="card">
          {m && (
            <div className="material">
              <span className="state">{m.kind === "link" ? <Link2 aria-hidden /> : <FileText aria-hidden />}</span>
              <div><strong>{m.kind === "link" ? "Material on-line" : m.name}</strong><small>{m.kind === "link" ? m.url : `${(m.name?.split(".").pop() ?? "").toUpperCase()} • ${formatBytes(m.size ?? 0)}`}</small></div>
              {m.kind === "link"
                ? <a className="btn btn-outline btn-sm" href={m.url ?? "#"} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden />Abrir material</a>
                : <a className="btn btn-outline btn-sm" href={`/api/conteudos/${content.id}/arquivo`} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden />Abrir material</a>}
            </div>
          )}
          {content.body && <div className="study-body"><StudyBody body={content.body} /></div>}
          {!m && !content.body && <div className="empty">Este conteúdo não tem material anexado.</div>}
          <div className="study-foot">
            <span className="meta-line" style={{ margin: 0 }}>{content.lessons > 0 ? <><Clock aria-hidden />{content.lessons} aulas • {formatDuration(content.minutes)}</> : null}</span>
            <CompleteContentButton contentId={content.id} done={done} courseHref={base} nextHref={next ? `${base}/conteudos/${next.id}` : null} />
          </div>
        </article>
      </div>
    </AppShell>
  );
}
