import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://track-application.vercel.app',
  'https://track-application-weld.vercel.app',
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsOptions: cors.CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!requestOrigin) {
      return callback(null, true);
    }

    const normalizedOrigin = requestOrigin.replace(/\/+$/, '');

    let isVercelDomain = false;
    try {
      const parsedUrl = new URL(requestOrigin);
      isVercelDomain = parsedUrl.hostname.endsWith('.vercel.app');
    } catch {
      isVercelDomain = false;
    }

    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      isVercelDomain ||
      process.env.CLIENT_URL === '*';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Ensure Database is connected for every request (Serverless & Dedicated)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Root & Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Job Application Tracker API is active',
    docs: '/api/applications',
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Job Application Tracker API',
  });
});

// Routes (supports both /api and root paths for frontend flexibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/applications', jobApplicationRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server locally (avoid app.listen in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Job Application Tracker Backend running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
