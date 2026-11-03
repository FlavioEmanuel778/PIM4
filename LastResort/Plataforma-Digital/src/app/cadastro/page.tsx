import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentSession, HOME_BY_ROLE, type AppRole } from "@/lib/auth-guard";

export const metadata = { title: "Cadastro de aluno • EduDigital" };
export default async function CadastroAluno() {
  const session = await getCurrentSession();
  if (session && !session.user.banned) redirect(HOME_BY_ROLE[session.user.role as AppRole] ?? "/");
  return (
    <AuthShell eyebrow="Quero aprender" title="O próximo passo começa com você." lead="Aprenda no seu ritmo, ganhe confiança e descubra novas possibilidades no mundo digital.">
      <RegisterForm role="aluno" />
    </AuthShell>
  );
}
