"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput({ id, value, onChange, placeholder, error, autoComplete = "new-password" }: {
  id: string; value: string; onChange: (v: string) => void; placeholder: string; error?: boolean; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <input id={id} className={`input has-icon${error ? " error" : ""}`} type={show ? "text" : "password"} value={value} placeholder={placeholder}
        autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} aria-invalid={error || undefined} />
      <button type="button" className="input-icon" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>{show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}</button>
    </div>
  );
}
