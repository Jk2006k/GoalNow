const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const runCodeRoutes = require('./routes/runcode');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Expose uploaded proctoring videos for playback/download.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api", runCodeRoutes)

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  console.error('❌ Missing required environment variable: MONGODB_URI');
  console.error('Create server/.env from server/.env.example and set MONGODB_URI.');
  process.exit(1);
}

console.log('Connection string:', mongodbUri.substring(0, 50) + '...');

mongoose.connect(mongodbUri, {
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
const questionRoutes = require('./routes/question');
const submitRoutes = require('./routes/submit');
app.use('/api/auth', authRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api', submitRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
