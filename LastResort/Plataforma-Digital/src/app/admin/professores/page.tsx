import { AdminUserList } from "@/components/admin-pages";
export const metadata = { title: "Professores • EduDigital" };
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; salvo?: string }> }) { return <AdminUserList role="professor" searchParams={searchParams} />; }
