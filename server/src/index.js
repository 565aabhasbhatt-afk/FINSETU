import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import DB and Socket initializers
import { testDbConnection } from './services/db.js';
import { initSocket } from './socket/socketHandler.js';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import loginHistoryRoutes from './routes/loginHistoryRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://172.20.10.2:5173';

const allowedOrigins = [
  CLIENT_URL,
  'http://172.20.10.2:5173',
  'http://LAPTOP-AN71BR3U:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('172.20.10.2') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});

initSocket(io);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false // Disabled for local dev flexibility
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('172.20.10.2') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this client. Please retry later.' }
});
app.use('/api/', generalLimiter);

// Specific Auth Endpoint Limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many authentication attempts. Please pause and retry.' }
});
app.use('/api/auth/login', authLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/login-history', loginHistoryRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/simulations', simulatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/guardian', guardianRoutes);

// Root Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FINSETU Backend Core',
    time: new Date()
  });
});

// Central 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[FINSETU Error Handler]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start HTTP Server and test Database connection
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`🚀 FINSETU Server listening on http://172.20.10.2:${PORT}`);
  console.log(`📡 WebSocket Gateway ready for live security telemetry`);
  console.log(`=======================================================`);
  await testDbConnection();
});
