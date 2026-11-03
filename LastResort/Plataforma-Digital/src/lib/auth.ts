import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";

// Better Auth cuida de senha, sessão, contas e bloqueio de usuários.
// Papéis da plataforma: "admin", "professor" e "aluno" (padrão).
export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  plugins: [admin({ defaultRole: "aluno", adminRoles: ["admin"] })],
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"]
});
