"use client";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Busca com atraso curto: atualiza ?q= (mantendo `keep`, como ?curso=) e a lista é renderizada de novo no servidor.
export function SearchBox({ initial, keep = {}, withLabel = true }: { initial: string; keep?: Record<string, string>; withLabel?: boolean }) {
  const router = useRouter(); const pathname = usePathname();
  const [value, setValue] = useState(initial); const first = useRef(true);
  const keepKey = JSON.stringify(keep);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ ...(JSON.parse(keepKey) as Record<string, string>), ...(value.trim() ? { q: value.trim() } : {}) }).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(t);
  }, [value, pathname, router, keepKey]);
  return (
    <div style={{ flex: 1, maxWidth: withLabel ? undefined : "none" }}>
      {withLabel ? <label className="label" htmlFor="busca">Buscar por nome ou e-mail</label> : <label className="sr-only" htmlFor="busca">Buscar por nome ou e-mail</label>}
      <div className="search" style={withLabel ? undefined : { width: "100%" }}><Search aria-hidden /><input id="busca" className="input" type="search" placeholder={withLabel ? "Digite um nome ou e-mail" : "Buscar por nome ou e-mail"} value={value} onChange={(e) => setValue(e.target.value)} /></div>
    </div>
  );
}
