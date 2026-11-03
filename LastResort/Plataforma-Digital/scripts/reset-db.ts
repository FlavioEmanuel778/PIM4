import "dotenv/config";
import mysql from "mysql2/promise";

// APAGA o banco indicado em .env e recria tudo. Use só em desenvolvimento: npm run db:reset && npm run db:init && npm run db:seed
async function main() {
  const dbName = process.env.DB_NAME ?? "plataforma_produtos";
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error("DB_NAME deve conter apenas letras, números e _.");
  if (process.env.NODE_ENV === "production") throw new Error("db:reset é bloqueado em produção.");
  const c = await mysql.createConnection({ host: process.env.DB_HOST ?? "127.0.0.1", port: Number(process.env.DB_PORT ?? 3306), user: process.env.DB_USER ?? "root", password: process.env.DB_PASSWORD ?? "" });
  await c.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  console.log(`Banco ${dbName} apagado.`); await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
