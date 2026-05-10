require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MOCK AUTH MIDDLEWARE (Remove this when you build real auth.js)
// This is just a placeholder to simulate an authenticated user. In production, replace this with your actual authentication middleware that sets req.user based on the incoming request's auth token.
app.use((req, res, next) => {
  // ID placeholder to replace with real user ID from auth system. Change role to 'volunteer' or 'recipient' to test different flows.
  req.user = { id: '64f1a2b3c4d5e6f7a8b9c0d1', role: 'business' }; 
  next();
});

// Mount Routes
app.use('/api/listings', require('./routes/listings'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/notifications', require('./routes/notifications'));

// 404 / Fallback Route
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FeedForward server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });