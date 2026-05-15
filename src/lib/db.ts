import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSQLite } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

function createPrismaClient() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./prisma/dev.db";
  const resolvedPath = path.resolve(dbPath);
  const sqlite = new Database(resolvedPath);
  const adapter = new PrismaBetterSQLite(sqlite);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
