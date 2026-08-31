import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Global singleton instance of PrismaClient
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DB] PostgreSQL Database connected successfully via Prisma');
    return true;
  } catch (error) {
    console.error('[DB] PostgreSQL connection error:', error);
    return false;
  }
}
