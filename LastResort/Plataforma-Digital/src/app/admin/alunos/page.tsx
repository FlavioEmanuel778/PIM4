import { AdminUserList } from "@/components/admin-pages";
export const metadata = { title: "Alunos • EduDigital" };
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; salvo?: string }> }) { return <AdminUserList role="aluno" searchParams={searchParams} />; }
