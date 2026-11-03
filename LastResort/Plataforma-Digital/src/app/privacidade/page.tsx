import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Política de privacidade • EduDigital" };
export default function Page() {
  return (
    <main className="container" style={{ maxWidth: 720, padding: "40px 24px" }}>
      <Logo />
      <h1 style={{ fontSize: 30, margin: "32px 0 12px" }}>Política de privacidade</h1>
      <p style={{ lineHeight: 1.7 }}>A EduDigital guarda apenas os dados necessários para o seu aprendizado: nome, e-mail e seu progresso nos cursos. Você pode pedir a correção ou a exclusão dos seus dados à equipe de suporte. Este texto é um modelo: substitua pela política oficial da instituição.</p>
      <p style={{ marginTop: 24 }}><Link className="link" href="/">Voltar ao início</Link></p>
    </main>
  );
}
