import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { UserForm } from "@/components/UserForm";
import { UsersTable } from "@/components/UsersTable";
import { requirePageUser } from "@/lib/auth-guard";
import { formatDate, initials } from "@/lib/format";
import { getUser, listUsers, type ManagedRole } from "@/lib/users";

const T = {
  aluno: { base: "/admin/alunos", nav: "/admin/alunos", plural: "Alunos", singular: "aluno", Singular: "Aluno", sub: "Acompanhe e gerencie os alunos da EduDigital.", count: "alunos cadastrados", tail: "alunos", profile: "Aluno da EduDigital", profileName: "Aluno", linked: "Curso vinculado", help: "Use o olho para visualizar, o lápis para editar os dados ou a lixeira para excluir um cadastro." },
  professor: { base: "/admin/professores", nav: "/admin/professores", plural: "Professores", singular: "professor", Singular: "Professor", sub: "Gerencie quem compartilha conhecimento na plataforma.", count: "professores cadastrados", tail: "professores", profile: "Professor da EduDigital", profileName: "Professor", linked: "Curso vinculado", help: "Cada curso tem um professor responsável. Consulte a área Cursos para conferir os vínculos." }
} as const;
type SP = Promise<{ q?: string; page?: string; salvo?: string }>;

export async function AdminUserList({ role, searchParams }: { role: ManagedRole; searchParams: SP }) {
  const user = await requirePageUser("admin"); const t = T[role];
  const sp = await searchParams; const q = (sp.q ?? "").slice(0, 100);
  const data = await listUsers(role, q, Number(sp.page ?? 1));
  const saved = sp.salvo ? await getUser(sp.salvo, role) : null;
  return (
    <AppShell area="admin" nav={t.nav} crumbs={["Administração", t.plural]} user={user}>
      <div className="page">
        <div className="page-head">
          <div><h1>{t.plural}</h1><p>{t.sub}</p></div>
          <Link className="btn btn-primary" href={`${t.base}/novo`}><Plus aria-hidden />Novo {t.singular}</Link>
        </div>
        <div className="card table-card">
          <div className="toolbar"><SearchBox initial={q} /><span className="pill pill-blue">{data.total} {t.count}</span></div>
          <UsersTable key={`${q}-${data.page}-${data.total}-${sp.salvo ?? ""}`} role={role} items={data.items} savedName={saved?.name} />
          <div className="table-foot">
            <span>{data.total ? `Mostrando ${data.from}–${data.to} de ${data.total} ${t.tail}` : `Nenhum ${t.singular} encontrado`}</span>
            {data.pages > 1 && <Pagination basePath={t.base} q={q} page={data.page} pages={data.pages} />}
          </div>
        </div>
        <p className="note">{t.help}</p>
      </div>
    </AppShell>
  );
}

export async function AdminUserNew({ role }: { role: ManagedRole }) {
  const user = await requirePageUser("admin"); const t = T[role];
  return (
    <AppShell area="admin" nav={t.nav} crumbs={["Administração", t.plural, `Novo ${t.singular}`]} user={user}>
      <div className="page page-narrow">
        <Link className="back-link" href={t.base}><ArrowLeft aria-hidden />Voltar para {t.tail}</Link>
        <div className="page-head"><div><h1>Novo {t.singular}</h1><p>Preencha os dados abaixo para criar um novo cadastro.</p></div></div>
        <UserForm role={role} />
      </div>
    </AppShell>
  );
}

export async function AdminUserEdit({ role, id }: { role: ManagedRole; id: string }) {
  const user = await requirePageUser("admin"); const t = T[role];
  const target = await getUser(id, role); if (!target) notFound();
  return (
    <AppShell area="admin" nav={t.nav} crumbs={["Administração", t.plural, `Editar ${t.singular}`]} user={user}>
      <div className="page page-narrow">
        <Link className="back-link" href={t.base}><ArrowLeft aria-hidden />Voltar para {t.tail}</Link>
        <div className="page-head"><div><h1>Editar {t.singular}</h1><p>Atualize os dados do cadastro e salve as alterações.</p></div></div>
        <UserForm role={role} user={{ id: target.id, name: target.name, email: target.email }} />
      </div>
    </AppShell>
  );
}

export async function AdminUserDetail({ role, id }: { role: ManagedRole; id: string }) {
  const user = await requirePageUser("admin"); const t = T[role];
  const u = await getUser(id, role); if (!u) notFound();
  return (
    <AppShell area="admin" nav={t.nav} crumbs={["Administração", t.plural, `Detalhes do ${t.singular}`]} user={user}>
      <div className="page page-narrow">
        <Link className="back-link" href={t.base}><ArrowLeft aria-hidden />Voltar para {t.tail}</Link>
        <div className="page-head"><div><h1>Detalhes do {t.singular}</h1><p>Consulte as informações do cadastro de {u.name}.</p></div></div>
        <div className="card">
          <div className="detail-head">
            <span className="avatar avatar-lg">{initials(u.name)}</span>
            <div><h2>{u.name}</h2><small>{t.profile}</small></div>
            <span className={`pill ${u.banned ? "pill-red" : "pill-green"}`}>{u.banned ? "Bloqueado" : "Ativo"}</span>
          </div>
          <dl className="dl">
            <div><dt>Nome</dt><dd>{u.name}</dd></div>
            <div><dt>E-mail</dt><dd>{u.email}</dd></div>
            <div><dt>Senha</dt><dd>••••••••••••</dd></div>
            <div><dt>Perfil</dt><dd>{t.profileName}</dd></div>
            {role === "aluno" && <div><dt>Matrícula</dt><dd>{u.registration ?? "—"}</dd></div>}
            <div><dt>{role === "aluno" ? "Cursos matriculados" : t.linked}</dt><dd>{u.courses ?? (role === "aluno" ? "Nenhuma matrícula" : "Sem curso vinculado")}</dd></div>
            <div><dt>Data de cadastro</dt><dd>{formatDate(u.createdAt)}</dd></div>
          </dl>
          <div className="detail-note"><Info aria-hidden />Por segurança, a senha nunca é exibida.</div>
          <div className="detail-foot"><Link className="btn btn-primary" href={`${t.base}/${u.id}/editar`}>Editar</Link></div>
        </div>
      </div>
    </AppShell>
  );
}
