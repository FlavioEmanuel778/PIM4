"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CircleAlert, CircleCheck } from "lucide-react";
import { Field } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { initials } from "@/lib/format";
import type { FieldErrors } from "@/lib/validation";

const json = { "Content-Type": "application/json" };
type Msg = { ok: boolean; text: string } | null;

// Um único formulário: dados pessoais + troca de senha opcional (só envia a senha se algum campo for preenchido).
export function ProfileForm({ name, email, roleText }: { name: string; email: string; roleText: string }) {
  const router = useRouter();
  const [f, setF] = useState({ name, email }); const [p, setP] = useState({ current: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({}); const [msg, setMsg] = useState<Msg>(null); const [busy, setBusy] = useState(false);
  const wantsPassword = !!(p.current || p.password || p.confirm);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null); setErrors({});
    try {
      const r1 = await fetch("/api/perfil", { method: "PUT", headers: json, body: JSON.stringify(f) });
      const d1 = await r1.json().catch(() => ({}));
      if (!r1.ok) { setErrors(d1.errors ?? {}); setMsg({ ok: false, text: d1.message ?? "Não foi possível salvar." }); return; }
      if (wantsPassword) {
        const r2 = await fetch("/api/perfil/senha", { method: "POST", headers: json, body: JSON.stringify(p) });
        const d2 = await r2.json().catch(() => ({}));
        if (!r2.ok) { setErrors(d2.errors ?? {}); setMsg({ ok: false, text: `Dados salvos, mas a senha não foi alterada. ${d2.message ?? ""}`.trim() }); router.refresh(); return; }
        setP({ current: "", password: "", confirm: "" });
      }
      setMsg({ ok: true, text: wantsPassword ? "Dados e senha atualizados." : "Dados atualizados." }); router.refresh();
    } catch { setMsg({ ok: false, text: "Não foi possível conectar. Tente de novo." }); } finally { setBusy(false); }
  }
  const reset = () => { setF({ name, email }); setP({ current: "", password: "", confirm: "" }); setErrors({}); setMsg(null); };

  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <div className="profile-head"><span className="avatar avatar-lg">{initials(name)}</span><div><h2>{name}</h2><small>{roleText}</small></div><span className="pill pill-green">Ativo</span></div>
      {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} role="status">{msg.ok ? <CircleCheck aria-hidden /> : <CircleAlert aria-hidden />}{msg.text}</div>}
      <h3 className="form-section">Dados pessoais</h3>
      <Field id="pname" label="Nome completo" error={errors.name}><input id="pname" className={`input${errors.name ? " error" : ""}`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field id="pemail" label="E-mail" error={errors.email}><input id="pemail" type="email" className={`input${errors.email ? " error" : ""}`} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
      <hr className="divider" />
      <h3 className="form-section">Alterar senha</h3><p className="sub" style={{ marginTop: -14 }}>Preencha os campos abaixo somente se quiser trocar sua senha.</p>
      <Field id="cur" label="Senha atual" error={errors.current}><PasswordInput id="cur" autoComplete="current-password" placeholder="Digite sua senha atual" value={p.current} onChange={(v) => setP({ ...p, current: v })} error={!!errors.current} /></Field>
      <Field id="new" label="Nova senha" error={errors.password}><PasswordInput id="new" placeholder="Crie uma nova senha" value={p.password} onChange={(v) => setP({ ...p, password: v })} error={!!errors.password} /></Field>
      <Field id="conf" label="Confirmar nova senha" error={errors.confirm} hint="Use pelo menos 12 caracteres. Combine letras, números e símbolos e evite informações pessoais."><PasswordInput id="conf" placeholder="Digite a nova senha novamente" value={p.confirm} onChange={(v) => setP({ ...p, confirm: v })} error={!!errors.confirm} /></Field>
      <div className="form-actions"><button type="button" className="btn btn-neutral" onClick={reset}>Cancelar</button><button className="btn btn-primary" disabled={busy}><Check aria-hidden />{busy ? "Salvando…" : "Salvar alterações"}</button></div>
    </form>
  );
}
