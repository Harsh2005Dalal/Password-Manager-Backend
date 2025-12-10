import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js';

dotenv.config();

const app = express();

let isConnected = false;

app.use((req,res,next) => {
  if(!isConnected)
  {
    connectDB();
  }
  else
  {
    next();
  }
});


app.use(cors({
  origin: ['http://localhost:3000', 'https://password-manager-frontend-mu.vercel.app/'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Password Manager API is running' });
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

export default app;