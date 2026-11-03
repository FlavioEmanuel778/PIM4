"use client";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Troca a disciplina da página (?curso=). O resto da tela é renderizado de novo no servidor.
export function CourseSelect({ basePath, courses, value }: { basePath: string; courses: { id: number; name: string }[]; value: number }) {
  const router = useRouter();
  return (
    <div className="select-wrap">
      <select id="curso" className="input select" value={value} onChange={(e) => router.push(`${basePath}?curso=${e.target.value}`)} aria-label="Disciplina">
        {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <ChevronDown aria-hidden />
    </div>
  );
}
