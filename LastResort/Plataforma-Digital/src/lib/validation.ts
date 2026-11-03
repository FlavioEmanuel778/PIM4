export type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirm" | "current", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value: unknown): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return "Nome obrigatório";
  if (v.length < 3) return "Informe o nome completo";
  if (v.length > 120) return "Use no máximo 120 caracteres";
  return null;
}
export function validateEmail(value: unknown): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return "E-mail obrigatório";
  if (v.length > 200 || !EMAIL_RE.test(v)) return "E-mail inválido";
  return null;
}
// strong = exige letras e números (cadastro público). Cadastro feito pelo admin exige só o mínimo.
export function validatePassword(value: unknown, opts: { required?: boolean; strong?: boolean; min?: number } = {}): string | null {
  const { required = true, strong = false, min = 8 } = opts;
  const v = typeof value === "string" ? value : "";
  if (!v) return required ? "Senha obrigatória" : null;
  if (v.length < min) return `Use pelo menos ${min} caracteres`;
  if (v.length > 128) return "Use no máximo 128 caracteres";
  if (strong && !(/[A-Za-z]/.test(v) && /\d/.test(v))) return "Combine letras e números";
  return null;
}
export const normalizeEmail = (v: string) => v.trim().toLowerCase();
export const compact = (errors: FieldErrors): FieldErrors => Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as FieldErrors;
