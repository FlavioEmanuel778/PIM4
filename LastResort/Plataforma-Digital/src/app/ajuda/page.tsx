import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Ajuda • EduDigital" };
export default function Page() {
  return (
    <main className="container" style={{ maxWidth: 720, padding: "40px 24px" }}>
      <Logo />
      <h1 style={{ fontSize: 30, margin: "32px 0 12px" }}>Ajuda</h1>
      <p style={{ lineHeight: 1.7 }}>Dúvidas sobre acesso, cursos ou notas? Escreva para suporte@edudigital.com.br e nossa equipe responde o mais rápido possível.</p>
      <p style={{ marginTop: 24 }}><Link className="link" href="/">Voltar ao início</Link></p>
    </main>
  );
}
