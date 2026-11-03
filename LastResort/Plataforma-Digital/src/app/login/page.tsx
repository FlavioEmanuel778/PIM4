import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentSession, HOME_BY_ROLE, type AppRole } from "@/lib/auth-guard";

export const metadata = { title: "Entrar • EduDigital" };
export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session && !session.user.banned) redirect(HOME_BY_ROLE[session.user.role as AppRole] ?? "/");
  return <AuthShell eyebrow="Tecnologia para todos" title="O próximo passo começa com você." lead="Aprenda no seu ritmo, ganhe confiança e descubra novas possibilidades no mundo digital."><LoginForm /></AuthShell>;
}
