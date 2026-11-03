import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="field-error" role="alert"><CircleAlert aria-hidden />{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}
