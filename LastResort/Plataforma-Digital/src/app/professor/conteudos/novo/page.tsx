import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ContentForm } from "@/components/ContentForm";
import { requirePageUser } from "@/lib/auth-guard";
import { pickCourse } from "@/lib/professor";
import { redirect } from "next/navigation";

export const metadata = { title: "Adicionar conteúdo • EduDigital" };
export const dynamic = "force-dynamic";

export default async function NewContent({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const user = await requirePageUser("professor");
  const { course } = await pickCourse(user.id, (await searchParams).curso);
  if (!course) redirect("/professor/conteudos");
  return (
    <AppShell area="professor" nav="/professor/conteudos" crumbs={["Professor", "Conteúdos › Adicionar conteúdo"]} user={user}>
      <div className="page">
        <Link className="back-link" href={`/professor/conteudos?curso=${course.id}`}><ArrowLeft aria-hidden />Voltar para Conteúdos</Link>
        <div className="page-head"><div><h1>Adicionar conteúdo</h1><p>Prepare um novo material de aprendizagem para sua disciplina.</p></div></div>
        <ContentForm courseId={course.id} courseName={course.name} />
      </div>
    </AppShell>
  );
}
