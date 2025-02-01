//lib/prismaClients.ts
import { PrismaClient } from '@prisma/client';

// Ensure only one instance of PrismaClient is created in development to avoid issues with hot-reloading
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const mongoPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.MONGO_DATABASE_URL, // Set MongoDB URL in .env file
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = mongoPrisma;
}

