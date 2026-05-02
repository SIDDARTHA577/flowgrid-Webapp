import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';

// Load env vars
dotenv.config();

import { connectDB } from './config/db';

// Validate essential env vars
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️ WARNING: ${varName} is not defined. This may cause issues in production.`);
  }
});

if (!process.env.MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI is missing. App cannot connect to database.');
  process.exit(1);
}

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Security headers
app.use(helmet());

// Prevent XSS attacks (custom middleware can be used or rely on helmet/validation)

// Prevent NoSQL injections (causing getter TypeError in current Node/Express environment)
// app.use(mongoSanitize());

// Enable CORS with robust origin handling
// Enable CORS with robust origin handling
let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
if (frontendUrl && !frontendUrl.startsWith('http')) {
  frontendUrl = `https://${frontendUrl}`;
}
frontendUrl = frontendUrl.replace(/\/$/, '');

app.use(cors({
  origin: [frontendUrl, 'http://localhost:3000'],
  credentials: true
}));

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { notFound, errorHandler } from './middlewares/errorMiddleware';

// Basic route
app.get('/', (req, res) => {
  res.send('TaskFlow API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
