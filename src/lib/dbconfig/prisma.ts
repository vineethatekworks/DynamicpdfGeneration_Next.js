import { PrismaClient } from '@prisma/client'
import process from "node:process";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // optional: logs all queries (helpful in dev)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
