import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentSession, HOME_BY_ROLE, type AppRole } from "@/lib/auth-guard";

export const metadata = { title: "Cadastro de professor • EduDigital" };
export default async function CadastroProfessor() {
  const session = await getCurrentSession();
  if (session && !session.user.banned) redirect(HOME_BY_ROLE[session.user.role as AppRole] ?? "/");
  return (
    <AuthShell eyebrow="Ensine com propósito" title="Compartilhe o que sabe. Transforme realidades." lead="Leve conhecimento a quem precisa e ajude mais pessoas a participar do mundo digital.">
      <RegisterForm role="professor" />
    </AuthShell>
  );
}
