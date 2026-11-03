import Link from "next/link";
import { ArrowLeft, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { SUPPORT_MAIL } from "@/components/AppShell";

export function AuthShell({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo />
        <div className="body">
          <span className="eyebrow" style={{ alignSelf: "flex-start" }}>{eyebrow}</span>
          <h2>{title}</h2>
          <p className="lead">{lead}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/auth.jpg" alt="Duas mulheres aprendendo juntas em frente a um notebook" />
          <div className="safe"><CircleCheck aria-hidden />Um ambiente seguro para aprender e ensinar.</div>
        </div>
        <small>© 2026 EduDigital. Educação que aproxima.</small>
      </aside>
      <main className="auth-main">
        <div className="auth-top">
          <Link href="/"><ArrowLeft aria-hidden />Voltar ao início</Link>
          <a className="muted" href={SUPPORT_MAIL}>Precisa de ajuda?</a>
        </div>
        <div className="auth-center">{children}</div>
        <div className="auth-bottom"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link></div>
      </main>
    </div>
  );
}
