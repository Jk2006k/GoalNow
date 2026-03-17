const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', process.env.MONGODB_URI.substring(0, 50) + '...');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    if (err.reason) {
      console.error('Reason:', err.reason);
    }
  });

// Routes
const authRoutes = require('./routes/auth');
const evaluationRoutes = require('./routes/evaluation');
app.use('/api/auth', authRoutes);
app.use('/api/evaluation', evaluationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
