import { requireAdmin } from "@/lib/auth-guard";
import { createUser, listUsers, userErrorResponse, type ManagedRole } from "@/lib/users";

const parseRole = (v: unknown): ManagedRole | null => (v === "aluno" || v === "professor" ? v : null);

// L: lista paginada, com busca por nome ou e-mail. GET /api/admin/usuarios?role=aluno&q=ana&page=2
export async function GET(request: Request) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const url = new URL(request.url);
  const role = parseRole(url.searchParams.get("role"));
  if (!role) return Response.json({ message: "Informe role=aluno ou role=professor." }, { status: 400 });
  return Response.json(await listUsers(role, url.searchParams.get("q") ?? "", Number(url.searchParams.get("page") ?? 1)));
}

// C: cria aluno ou professor.
export async function POST(request: Request) {
  const guard = await requireAdmin(); if ("error" in guard) return guard.error;
  const body = await request.json().catch(() => null);
  const role = parseRole(body?.role);
  if (!body || !role) return Response.json({ message: "Informe role=aluno ou role=professor." }, { status: 400 });
  try { const user = await createUser(role, body, "create"); return Response.json({ message: "Cadastro criado.", ...user }, { status: 201 }); }
  catch (error) { return userErrorResponse(error); }
}
