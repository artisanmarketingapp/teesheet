// Prisma client — requires `npx prisma generate` after cloning
// Run: npx prisma generate && npx prisma db push
// The actual PrismaClient import works once generated locally or on Railway

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any;

if (typeof window === "undefined") {
  // Server-side only
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = globalThis as unknown as { _prisma: typeof PrismaClient };
    prisma = globalForPrisma._prisma ?? new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error"] : [] });
    if (process.env.NODE_ENV !== "production") globalForPrisma._prisma = prisma;
  } catch {
    console.warn("[prisma] Client not generated yet. Run: npx prisma generate");
    prisma = null;
  }
}

export { prisma };
