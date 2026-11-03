import { Info, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { requirePageUser } from "@/lib/auth-guard";

// Perfil do aluno e do professor (mesmo layout do Design PIM).
export async function ProfilePage({ area }: { area: "aluno" | "professor" }) {
  const user = await requirePageUser(area);
  const label = area === "aluno" ? "Aluno" : "Professor";
  return (
    <AppShell area={area} nav={`/${area}/perfil`} crumbs={[label, "Perfil"]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Perfil do {label.toLowerCase()}</h1><p>Mantenha seus dados atualizados e sua conta protegida.</p></div></div>
        <div className="profile">
          <ProfileForm name={user.name} email={user.email} roleText={`${label} • EduDigital`} />
          <aside className="stack">
            <div className="callout info" style={{ margin: 0 }}><Info aria-hidden /><div><strong>Seus dados, seu controle</strong><p>Seu nome e e-mail são usados para identificar sua conta e {area === "aluno" ? "acompanhar seu aprendizado" : "suas atividades como professor"}.</p></div></div>
            <div className="card side-card"><ShieldCheck aria-hidden /><h3>Cuide da sua conta</h3><p>Nunca compartilhe sua senha. A equipe EduDigital não solicita sua senha por mensagem ou e-mail.</p><p>Por segurança, as senhas permanecem ocultas nesta tela.</p></div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
