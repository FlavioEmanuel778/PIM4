const MESES = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

// "2026-10-30 14:00:00" -> "30 out. 2026"
export function formatDate(value: string | null | undefined): string {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return m ? `${Number(m[3])} ${MESES[Number(m[2]) - 1]} ${m[1]}` : "—";
}
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
export function firstName(name: string): string { return name.trim().split(/\s+/)[0] ?? name; }
// 8 -> "8,0"
export function formatGrade(value: number): string { return value.toFixed(1).replace(".", ","); }
// 120 -> "2 horas", 90 -> "1h30", 360 -> "6 horas"
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60); const m = minutes % 60;
  if (!m) return `${h} ${h === 1 ? "hora" : "horas"}`;
  return h ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
}
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const roleLabel = (role: string) => role === "admin" ? "Administração" : role === "professor" ? "Professor" : "Aluno";
