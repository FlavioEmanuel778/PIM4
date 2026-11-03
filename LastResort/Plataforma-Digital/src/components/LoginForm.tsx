"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Field } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";

type Mode = "aluno" | "professor" | "admin";
const HOME: Record<Mode, string> = { aluno: "/aluno", professor: "/professor", admin: "/admin" };
const WHO: Record<Mode, string> = { aluno: "aluno", professor: "professor", admin: "administrador" };

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("aluno");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const json = { "Content-Type": "application/json" };

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!email.trim() || !password) { setError("Informe seu e-mail e sua senha."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/sign-in/email", { method: "POST", headers: json, body: JSON.stringify({ email: email.trim(), password }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) { setError("Muitas tentativas seguidas. Aguarde alguns segundos e tente de novo."); return; }
        setError(res.status === 403 && /ban/i.test(`${data.code} ${data.message}`) ? "Esta conta está bloqueada. Fale com o suporte." : "E-mail ou senha incorretos.");
        return;
      }
      const session = await (await fetch("/api/auth/get-session")).json().catch(() => null);
      const role = session?.user?.role as Mode | undefined;
      if (role !== mode) {
        await fetch("/api/auth/sign-out", { method: "POST", headers: json, body: "{}" });
        setError(role ? `Esta conta não é de ${WHO[mode]}. Escolha o tipo de acesso correto.` : "Não foi possível entrar. Tente novamente.");
        return;
      }
      router.replace(HOME[mode]); router.refresh();
    } catch { setError("Não foi possível conectar. Verifique sua internet e tente de novo."); }
    finally { setBusy(false); }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1>{mode === "admin" ? "Acesso administrativo" : "Que bom ter você aqui!"}</h1>
      <p className="sub">{mode === "admin" ? "Entre com a conta de administrador." : "Entre na sua conta para continuar sua jornada."}</p>
      {mode !== "admin" && (<>
        <p className="label">Como você quer entrar?</p>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" className="tab" aria-selected={mode === "aluno"} onClick={() => setMode("aluno")}>Aluno</button>
          <button type="button" role="tab" className="tab" aria-selected={mode === "professor"} onClick={() => setMode("professor")}>Professor</button>
        </div>
      </>)}
      {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
      <Field id="email" label="E-mail"><input id="email" className="input" type="email" autoComplete="email" placeholder="seunome@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field id="password" label="Senha"><PasswordInput id="password" autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={setPassword} /></Field>
      <div className="row-between">
        {mode === "admin"
          ? <button type="button" className="link" style={{ background: "none", border: 0, padding: 0 }} onClick={() => setMode("aluno")}>Voltar ao acesso de aluno</button>
          : <button type="button" className="link" style={{ background: "none", border: 0, padding: 0 }} onClick={() => setMode("admin")}>Administrador</button>}
        <a className="link" href="mailto:suporte@edudigital.com.br?subject=Esqueci%20minha%20senha">Esqueci minha senha</a>
      </div>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
      <p className="switch-line">Ainda não tem conta? <Link className="link" href="/cadastro">Cadastre-se</Link></p>
    </form>
  );
}
