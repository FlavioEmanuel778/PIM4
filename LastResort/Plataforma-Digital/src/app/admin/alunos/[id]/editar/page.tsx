import { AdminUserEdit } from "@/components/admin-pages";
export const metadata = { title: "Editar • EduDigital" };
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <AdminUserEdit role="aluno" id={(await params).id} />; }
