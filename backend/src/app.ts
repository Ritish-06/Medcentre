import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import apiRouter from './routes';

const app: Application = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// Request logging telemetry
app.use(requestLogger);

// Mount API routes
app.use('/api', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
