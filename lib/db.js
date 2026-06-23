import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

let db;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please add DATABASE_URL to .env.local");
  }
  if (!db) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }
  return db;
}

export function isUniqueViolation(error) {
  return error?.code === "23505";
}

export * from "../db/schema";
