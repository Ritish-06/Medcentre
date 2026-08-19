import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // 1. If using cloud PostgreSQL / MySQL / Supabase, use direct connection string
  if (envUrl && !envUrl.startsWith('file:') && (envUrl.startsWith('postgres') || envUrl.startsWith('mysql'))) {
    return envUrl;
  }

  // 2. If running on Vercel Serverless / AWS Lambda
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';
    const sourceDbPaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
    ];

    if (!fs.existsSync(tmpDbPath)) {
      for (const src of sourceDbPaths) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (err) {
            console.error('Error copying dev.db to /tmp:', err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // 3. Local development fallback
  const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDb}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
