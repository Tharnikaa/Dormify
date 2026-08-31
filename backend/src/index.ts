import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (receipts)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Healthcheck endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DORMIFY Hostel Administration API', timestamp: new Date() });
});

// API Routes
app.use('/api', apiRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  await checkDatabaseConnection();

  app.listen(env.PORT, () => {
    console.log(`[DORMIFY Backend] Server listening at http://localhost:${env.PORT}`);
    console.log(`[DORMIFY Backend] Environment: ${env.NODE_ENV}`);
  });
}

startServer().catch((err) => {
  console.error('[DORMIFY Backend] Server startup error:', err);
});
