import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js';

dotenv.config();

const app = express();

// ==========================================
// 1. CORS Configuration (FIRST - Before any other middleware)
// ==========================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite default
  'https://password-manager-frontend-mu.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// ==========================================
// 2. Body Parser (SECOND)
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. Database Connection (THIRD - Singleton Pattern)
// ==========================================
let isConnected = false;
let connectionPromise = null;

const ensureDBConnection = async () => {
  if (isConnected) return;
  
  // Prevent multiple simultaneous connection attempts
  if (connectionPromise) {
    await connectionPromise;
    return;
  }
  
  try {
    connectionPromise = connectDB();
    await connectionPromise;
    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    connectionPromise = null;
    throw error;
  }
};

app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'Database connection failed. Please try again later.' 
    });
  }
});

// ==========================================
// 4. Request Logging (Optional but useful)
// ==========================================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ==========================================
// 5. Routes
// ==========================================
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Password Manager API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

// ==========================================
// 6. 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ==========================================
// 7. Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==========================================
// 8. Export for Vercel
// ==========================================
export default app;