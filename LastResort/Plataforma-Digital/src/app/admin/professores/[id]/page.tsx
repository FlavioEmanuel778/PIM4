import { AdminUserDetail } from "@/components/admin-pages";
export const metadata = { title: "Detalhes • EduDigital" };
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <AdminUserDetail role="professor" id={(await params).id} />; }
