import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Termos de uso • EduDigital" };
export default function Page() {
  return (
    <main className="container" style={{ maxWidth: 720, padding: "40px 24px" }}>
      <Logo />
      <h1 style={{ fontSize: 30, margin: "32px 0 12px" }}>Termos de uso</h1>
      <p style={{ lineHeight: 1.7 }}>Ao usar a EduDigital você concorda em manter seus dados corretos, não compartilhar sua senha e respeitar os demais participantes. Este texto é um modelo: substitua pelos termos oficiais da instituição.</p>
      <p style={{ marginTop: 24 }}><Link className="link" href="/">Voltar ao início</Link></p>
    </main>
  );
}
