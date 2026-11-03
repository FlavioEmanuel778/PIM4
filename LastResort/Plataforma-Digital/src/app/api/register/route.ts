import { createUser, userErrorResponse, UserError, type ManagedRole } from "@/lib/users";

// Cadastro público de aluno ou professor. O papel é definido aqui, no servidor.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ message: "Dados inválidos." }, { status: 400 });
  const role: ManagedRole | null = body.role === "aluno" || body.role === "professor" ? body.role : null;
  if (!role) return Response.json({ message: "Escolha entre conta de aluno ou de professor." }, { status: 400 });
  try {
    if (typeof body.confirm === "string" && body.confirm !== body.password) throw new UserError("Revise os campos indicados.", 400, { confirm: "As senhas não coincidem" });
    const user = await createUser(role, body, "register");
    return Response.json({ message: "Conta criada.", id: user.id }, { status: 201 });
  } catch (error) { return userErrorResponse(error); }
}
