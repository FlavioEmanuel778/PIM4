import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import mysql from "mysql2/promise";

// Lê database/schema.sql (fonte única do schema) e executa cada comando no banco indicado em .env.
async function main() {
  const dbName = process.env.DB_NAME ?? "plataforma_produtos";
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error("DB_NAME deve conter apenas letras, números e _.");
  const connection = await mysql.createConnection({ host: process.env.DB_HOST ?? "127.0.0.1", port: Number(process.env.DB_PORT ?? 3306), user: process.env.DB_USER ?? "root", password: process.env.DB_PASSWORD ?? "" });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.changeUser({ database: dbName });
  const sql = readFileSync(join(process.cwd(), "database", "schema.sql"), "utf8");
  const statements = sql
    .split("\n").filter((line) => !line.trim().startsWith("--")).join("\n")
    .split(";").map((s) => s.trim())
    .filter((s) => s && !/^(CREATE DATABASE|USE)\b/i.test(s));
  for (const statement of statements) await connection.query(statement);

  // Atualiza bancos criados por versões anteriores (CREATE TABLE IF NOT EXISTS não altera tabelas existentes).
  const addColumn = async (table: string, column: string, ddl: string) => {
    const [rows] = await connection.query("SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?", [dbName, table, column]);
    if (!(rows as unknown[]).length) { await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`); console.log(`  + ${table}.${column}`); }
  };
  await addColumn("user", "registration", "registration varchar(20) NULL, ADD UNIQUE KEY user_registration_uq (registration)");
  await addColumn("contents", "published", "published boolean NOT NULL DEFAULT true");
  await addColumn("contents", "material_kind", "material_kind varchar(10) NULL");
  await addColumn("contents", "material_name", "material_name varchar(255) NULL");
  await addColumn("contents", "material_size", "material_size int NULL");
  await addColumn("contents", "material_mime", "material_mime varchar(100) NULL");
  await addColumn("contents", "material_file", "material_file varchar(80) NULL");
  await addColumn("contents", "material_url", "material_url varchar(500) NULL");

  // Número de matrícula (ED + ano + sequência) para alunos que ainda não têm.
  const [last] = await connection.query("SELECT MAX(CAST(SUBSTRING(registration, 7) AS UNSIGNED)) AS m FROM user WHERE registration LIKE 'ED____%'");
  let seq = Number((last as { m: number | null }[])[0]?.m ?? 0);
  const [pending] = await connection.query("SELECT id FROM user WHERE role = 'aluno' AND registration IS NULL ORDER BY createdAt, id");
  for (const row of pending as { id: string }[]) {
    seq += 1;
    await connection.query("UPDATE user SET registration = ? WHERE id = ?", [`ED${new Date().getFullYear()}${String(seq).padStart(3, "0")}`, row.id]);
  }
  console.log(`Banco ${dbName} e ${statements.length} tabelas conferidos.`);
  await connection.end();
}
main().catch((error) => { console.error("Falha ao preparar MySQL. Confira serviço, credenciais e .env.", error); process.exit(1); });
