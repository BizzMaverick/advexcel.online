const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const excelRoutes = require('./routes/excel');
const referralRoutes = require('./routes/referral');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel_ai_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/referral', referralRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Excel Pro AI API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));