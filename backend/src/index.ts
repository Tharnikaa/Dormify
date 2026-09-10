import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Middleware - Dynamic institutional & cloud CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser callers (curl, server-to-server, health checks)
    if (!origin) return callback(null, true);

    // Allow localhost, 127.0.0.1 on any port, all Render domains, and deployed frontends
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('onrender.com') ||
      origin.includes('vercel.app') ||
      origin.includes('netlify.app')
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// Locate frontend build directory if present (production deployment)
const potentialDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
];
const frontendDistPath = potentialDistPaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`[DORMIFY Backend] Serving frontend static files from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for client-side routing (React Router)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Fallback root endpoint when running backend independently without frontend build
  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'DORMIFY Backend API',
      documentation: '/api',
      health: '/api/health',
      timestamp: new Date(),
    });
  });
}

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
