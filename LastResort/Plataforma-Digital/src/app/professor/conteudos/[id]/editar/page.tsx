import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ContentForm } from "@/components/ContentForm";
import { requirePageUser } from "@/lib/auth-guard";
import { getCourse } from "@/lib/courses";
import { canManageCourse, getManagedContent } from "@/lib/professor";
import { toId } from "@/lib/params";

export const metadata = { title: "Editar conteúdo • EduDigital" };
export const dynamic = "force-dynamic";

export default async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser("professor");
  const id = toId((await params).id); if (!id) notFound();
  const content = await getManagedContent(id);
  if (!content || !(await canManageCourse(user.id, content.courseId))) notFound();
  const course = await getCourse(content.courseId); if (!course) notFound();
  return (
    <AppShell area="professor" nav="/professor/conteudos" crumbs={["Professor", "Conteúdos › Editar conteúdo"]} user={user}>
      <div className="page">
        <Link className="back-link" href={`/professor/conteudos?curso=${course.id}`}><ArrowLeft aria-hidden />Voltar para Conteúdos</Link>
        <div className="page-head"><div><h1>Editar conteúdo</h1><p>Atualize as informações e o material de apoio do conteúdo {content.title}.</p></div></div>
        <ContentForm courseId={course.id} courseName={course.name} content={content} />
      </div>
    </AppShell>
  );
}
