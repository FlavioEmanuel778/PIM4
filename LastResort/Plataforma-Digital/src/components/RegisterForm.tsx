"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Field } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import type { FieldErrors } from "@/lib/validation";

export function RegisterForm({ role }: { role: "aluno" | "professor" }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({}); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const json = { "Content-Type": "application/json" };

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setErrors({});
    if (f.password !== f.confirm) { setErrors({ confirm: "As senhas não coincidem" }); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/register", { method: "POST", headers: json, body: JSON.stringify({ ...f, role }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrors(data.errors ?? {}); if (!data.errors || !Object.keys(data.errors).length) setError(data.message ?? "Não foi possível criar a conta."); return; }
      const login = await fetch("/api/auth/sign-in/email", { method: "POST", headers: json, body: JSON.stringify({ email: f.email.trim(), password: f.password }) });
      router.replace(login.ok ? (role === "aluno" ? "/aluno" : "/professor") : "/login"); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); }
    finally { setBusy(false); }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1>{role === "aluno" ? "Crie sua conta de aluno" : "Crie sua conta de professor"}</h1>
      <p className="sub">{role === "aluno" ? "Seu primeiro passo para ir mais longe." : "Conecte seu conhecimento a novas histórias."}</p>
      {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
      <Field id="name" label="Nome completo" error={errors.name}><input id="name" className={`input${errors.name ? " error" : ""}`} autoComplete="name" placeholder="Como você se chama?" value={f.name} onChange={(e) => set("name")(e.target.value)} /></Field>
      <Field id="email" label="E-mail" error={errors.email}><input id="email" className={`input${errors.email ? " error" : ""}`} type="email" autoComplete="email" placeholder="seunome@exemplo.com" value={f.email} onChange={(e) => set("email")(e.target.value)} /></Field>
      <Field id="password" label="Senha" error={errors.password} hint="Use pelo menos 8 caracteres, com letras e números."><PasswordInput id="password" placeholder="Crie uma senha segura" value={f.password} onChange={set("password")} error={!!errors.password} /></Field>
      <Field id="confirm" label="Confirmar senha" error={errors.confirm}><PasswordInput id="confirm" placeholder="Digite sua senha novamente" value={f.confirm} onChange={set("confirm")} error={!!errors.confirm} /></Field>
      <p className="legal">Ao criar sua conta, você concorda com os <Link className="link" href="/termos">Termos de uso</Link> e a <Link className="link" href="/privacidade">Política de privacidade</Link> da EduDigital.</p>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Criando conta…" : "Criar conta"}</button>
      <p className="switch-line">Já tem uma conta? <Link className="link" href="/login">Entrar</Link></p>
    </form>
  );
}
