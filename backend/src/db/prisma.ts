import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = global.pgPool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") global.pgPool = pool;

const adapter = new PrismaPg(pool);

const prisma = global.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
