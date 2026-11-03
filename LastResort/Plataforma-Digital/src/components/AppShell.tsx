import Link from "next/link";
import { BookOpen, ChevronRight, CircleCheck, CircleHelp, ArrowUpRight, ClipboardList, FolderOpen, GraduationCap, LayoutGrid, PenLine, User, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { initials, roleLabel } from "@/lib/format";

type Area = "admin" | "aluno" | "professor";
const NAV: Record<Area, { href: string; label: string; icon: ReactNode }[]> = {
  admin: [
    { href: "/admin", label: "Painel", icon: <LayoutGrid /> },
    { href: "/admin/alunos", label: "Alunos", icon: <Users /> },
    { href: "/admin/professores", label: "Professores", icon: <GraduationCap /> },
    { href: "/admin/cursos", label: "Cursos", icon: <BookOpen /> }
  ],
  aluno: [
    { href: "/aluno", label: "Meus Cursos", icon: <BookOpen /> },
    { href: "/aluno/notas", label: "Notas", icon: <ClipboardList /> },
    { href: "/aluno/perfil", label: "Perfil", icon: <User /> }
  ],
  professor: [
    { href: "/professor", label: "Disciplinas", icon: <BookOpen /> },
    { href: "/professor/turma", label: "Turma", icon: <Users /> },
    { href: "/professor/conteudos", label: "Conteúdos", icon: <FolderOpen /> },
    { href: "/professor/notas", label: "Notas", icon: <PenLine /> },
    { href: "/professor/perfil", label: "Perfil", icon: <User /> }
  ]
};
const AREA_LABEL: Record<Area, string> = { admin: "Área administrativa", aluno: "Área do aluno", professor: "Área do professor" };
const FOOT: Record<Area, string> = { admin: "Sistema operacional", aluno: "Aprenda no seu ritmo.", professor: "Sistema operacional" };
export const SUPPORT_MAIL = "mailto:suporte@edudigital.com.br?subject=Preciso%20de%20ajuda";

// `nav` marca o item ativo do menu lateral; `crumbs` monta o caminho no topo (o último item é a página atual).
export function AppShell({ area, nav, crumbs, user, children }: {
  area: Area; nav: string; crumbs: string[]; user: { name: string; role: string }; children: ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo href={NAV[area][0].href} />
        <span className="area">{AREA_LABEL[area]}</span>
        <nav className="side-nav" aria-label="Menu principal">
          {NAV[area].map((item) => (
            <Link key={item.href} href={item.href} className="side-link" aria-current={item.href === nav ? "page" : undefined}>{item.icon}{item.label}</Link>
          ))}
        </nav>
        <div className="help-box">
          <CircleHelp aria-hidden /><strong>Precisa de ajuda?</strong>
          <p>Conte com a nossa equipe de suporte.</p>
          <a href={SUPPORT_MAIL}>Falar com o suporte <ArrowUpRight aria-hidden /></a>
        </div>
        <LogoutButton />
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="crumbs">
            {crumbs.map((c, i) => i === crumbs.length - 1
              ? <strong key={i}>{c}</strong>
              : <span key={i} style={{ display: "contents" }}><span>{c}</span><ChevronRight aria-hidden /></span>)}
          </div>
          <div className="userchip"><span className="avatar">{initials(user.name)}</span><div><b>{user.name}</b><small>{roleLabel(user.role)}</small></div></div>
        </header>
        {children}
        <footer className="app-footer"><span>© 2026 EduDigital</span><span>{area === "aluno" ? FOOT[area] : <><CircleCheck aria-hidden />{FOOT[area]}</>}</span></footer>
      </div>
    </div>
  );
}
