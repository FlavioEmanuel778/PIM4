// PDF mínimo (uma ou mais páginas de texto) para os materiais de exemplo do seed.
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
function wrap(text: string, width = 88): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    if (!raw.trim()) { out.push(""); continue; }
    let line = "";
    for (const word of raw.split(/\s+/)) {
      if ((line + " " + word).trim().length > width) { out.push(line); line = word; } else line = (line + " " + word).trim();
    }
    out.push(line);
  }
  return out;
}
export function makePdf(title: string, body: string): Buffer {
  const lines = wrap(body.replace(/^## /gm, "").replace(/^- /gm, "• "));
  const perPage = 44; const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
  const objs: string[] = []; // índice 0 = objeto 1
  objs.push("<< /Type /Catalog /Pages 2 0 R >>");
  const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
  objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  pages.forEach((p, i) => {
    const content = ["BT"];
    if (i === 0) content.push("/F2 18 Tf 72 790 Td 22 TL", `(${esc(title)}) Tj`, "0 -30 Td /F1 11 Tf 15 TL");
    else content.push("/F1 11 Tf 72 790 Td 15 TL");
    for (const l of p) content.push(`(${esc(l)}) Tj T*`);
    content.push("ET");
    const stream = content.join("\n");
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    objs.push(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
  });
  let pdf = "%PDF-1.4\n"; const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(pdf, "latin1")); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
