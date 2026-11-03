"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { Field } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import type { FieldErrors } from "@/lib/validation";

// Formulário de criar/editar aluno ou professor. Em edição, a senha é opcional.
export function UserForm({ role, user }: { role: "aluno" | "professor"; user?: { id: string; name: string; email: string } }) {
  const router = useRouter(); const editing = !!user;
  const base = role === "aluno" ? "/admin/alunos" : "/admin/professores"; const label = role === "aluno" ? "aluno" : "professor";
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({}); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setErrors({}); setBusy(true);
    try {
      const res = await fetch(editing ? `/api/admin/usuarios/${user!.id}` : "/api/admin/usuarios", {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, role })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrors(data.errors ?? {}); setError(data.message ?? "Não foi possível salvar."); return; }
      router.push(`${base}?salvo=${editing ? user!.id : data.id}`); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }

  const hasErrors = Object.keys(errors).length > 0;
  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <h2>Dados do {label}</h2><p className="sub">Todos os campos com * são obrigatórios.</p>
      {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{hasErrors ? "Revise os campos indicados antes de salvar." : error}</div>}
      <Field id="name" label="Nome *" error={errors.name}><input id="name" className={`input${errors.name ? " error" : ""}`} placeholder="Digite o nome completo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field id="email" label="E-mail *" error={errors.email}><input id="email" className={`input${errors.email ? " error" : ""}`} type="email" placeholder="Digite o e-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
      <Field id="password" label={editing ? "Senha" : "Senha *"} error={errors.password} hint={editing ? "A senha atual está protegida. Preencha apenas se desejar alterá-la." : "Use pelo menos 8 caracteres para proteger o acesso."}>
        <PasswordInput id="password" placeholder={editing ? "Deixe em branco para manter" : "Crie uma senha segura"} value={f.password} onChange={(v) => setF({ ...f, password: v })} error={!!errors.password} />
      </Field>
      <div className="form-actions">
        <Link className="btn btn-neutral" href={base}>Cancelar</Link>
        <button className="btn btn-primary" disabled={busy}><Check aria-hidden />{busy ? "Salvando…" : "Salvar"}</button>
      </div>
    </form>
  );
}
