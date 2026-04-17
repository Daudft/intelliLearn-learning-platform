const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// CORS Configuration for Local + Render + Vercel
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ],
    credentials: true
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 10000; // IMPORTANT for Render
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
