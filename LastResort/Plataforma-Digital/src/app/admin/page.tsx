import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, GraduationCap, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth-guard";
import { getAdminOverview } from "@/lib/courses";
import { firstName, formatDate, initials } from "@/lib/format";

export const metadata = { title: "Painel • EduDigital" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const user = await requirePageUser("admin");
  const o = await getAdminOverview();
  const noTeacher = o.courses.filter((c) => c.active && !c.teacherId).length;
  return (
    <AppShell area="admin" nav="/admin" crumbs={["Administração", "Painel"]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Olá, {firstName(user.name)}!</h1><p>Aqui está um panorama da sua comunidade de aprendizagem.</p></div></div>
        <div className="stats">
          <div className="card stat"><div className="top">Total de alunos<span className="ico"><Users aria-hidden /></span></div><div className="num">{o.students}</div><div className="foot"><CircleCheck aria-hidden />{o.enrollments} matrículas nos cursos</div></div>
          <div className="card stat"><div className="top">Total de professores<span className="ico"><GraduationCap aria-hidden /></span></div><div className="num">{o.teachers}</div><div className="foot"><CircleCheck aria-hidden />Educadores com curso ativo</div></div>
          <div className="card stat"><div className="top">Total de cursos<span className="ico"><BookOpen aria-hidden /></span></div><div className="num">{o.courses.length}</div><div className="foot"><CircleCheck aria-hidden />Disponíveis para aprender</div></div>
        </div>
        <div className="two-col">
          <section className="card panel">
            <h2>Alunos por curso</h2><p className="sub">{o.enrollments} alunos aprendendo e ganhando autonomia.</p>
            {o.courses.map((c) => (
              <div className="bar-row" key={c.id}>
                <div className="line"><strong>{c.name}</strong><span>{c.students} {c.students === 1 ? "aluno" : "alunos"}</span></div>
                <div className="bar" role="img" aria-label={`${c.students} de ${o.enrollments} matrículas`}><i style={{ width: `${o.enrollments ? (c.students / o.enrollments) * 100 : 0}%` }} /></div>
                <small>{c.teacherName ?? "Sem professor responsável"}</small>
              </div>
            ))}
            <Link className="panel-foot" href="/admin/cursos">Gerenciar cursos <ArrowRight aria-hidden /></Link>
          </section>
          <section className="card" style={{ overflow: "hidden" }}>
            <div className="panel-head"><h2 style={{ fontSize: 18 }}>Cadastros recentes</h2><Link className="link-inline" href="/admin/alunos">Ver alunos <ArrowRight aria-hidden /></Link></div>
            {o.recent.length === 0 && <div className="empty">Nenhum aluno cadastrado ainda.</div>}
            {o.recent.map((r) => (
              <Link href={`/admin/alunos/${r.id}`} className="recent-row" key={r.id}><span className="avatar">{initials(r.name)}</span><div><strong>{r.name}</strong><small>{r.course ?? "Sem curso"}</small></div><time>{formatDate(r.createdAt)}</time></Link>
            ))}
          </section>
        </div>
        {noTeacher === 0
          ? <div className="callout"><CircleCheck aria-hidden /><div><strong>Tudo pronto para aprender</strong><p>Os {o.courses.length} cursos estão ativos e com professores responsáveis definidos.</p></div></div>
          : <div className="callout warn"><TriangleAlert aria-hidden /><div><strong>Atenção aos cursos sem professor</strong><p>{noTeacher} {noTeacher === 1 ? "curso está" : "cursos estão"} sem professor responsável.</p></div></div>}
      </div>
    </AppShell>
  );
}
