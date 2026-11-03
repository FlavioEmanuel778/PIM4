import type { ReactNode } from "react";

// Renderiza o texto do conteúdo: "## Título", listas com "- " e parágrafos. Nunca interpreta HTML.
export function StudyBody({ body }: { body: string }) {
  const out: ReactNode[] = []; let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>); list = []; } };
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) { list.push(line.slice(2)); continue; }
    flush();
    if (line.startsWith("## ")) out.push(<h2 key={out.length}>{line.slice(3)}</h2>);
    else if (line) out.push(<p key={out.length}>{line}</p>);
  }
  flush();
  return <>{out}</>;
}
