import fs from 'fs';
import path from 'path';
import app from './app';
import { checkDatabaseConnection, prisma } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

async function bootstrap() {
  // 1. Ensure uploads directory exists
  const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.info(`Created upload directory at ${uploadsPath}`);
  }

  // 2. Verify Database Connection
  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    logger.info('✅ Database connected successfully');
  } else {
    logger.warn('⚠️ Database connection check failed on startup. Will retry on request.');
  }

  // 3. Start HTTP Server
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 MedCentre Backend Server listening on http://localhost:${env.PORT}`);
    logger.info(`🩺 Health Check endpoint: http://localhost:${env.PORT}/api/health`);
    logger.info(`🛡️ Environment: ${env.NODE_ENV}`);
  });

  // Graceful Shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down MedCentre server...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
