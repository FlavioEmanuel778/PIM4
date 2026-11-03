import mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Pool compartilhado para as rotas da API, as páginas e o Better Auth.
export const db = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "plataforma_produtos",
  waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  dateStrings: true
});

// Atalhos tipados. Sempre com parâmetros (?) para evitar SQL injection.
export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await db.query<RowDataPacket[]>(sql, params as never[]);
  return rows as unknown as T[];
}
export async function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}
export async function exec(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await db.query<ResultSetHeader>(sql, params as never[]);
  return result;
}
