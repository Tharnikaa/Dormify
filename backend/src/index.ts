import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Middleware
const allowedOrigins = env.FRONTEND_URL ? [env.FRONTEND_URL, 'http://localhost:5173'] : true;
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (receipts)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root and Healthcheck endpoints
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'DORMIFY Backend API',
    documentation: '/api',
    health: '/api/health',
    timestamp: new Date(),
  });
});

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
