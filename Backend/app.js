const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const sensorRoutes = require('./routes/sensorRoutes');
const actuatorRoutes = require('./routes/actuatorRoutes');
const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/actuators', actuatorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

// IoT device routes for ESP32 HTTP communication
const iotRoutes = require('./routes/iotRoutes');
app.use('/iot', iotRoutes);

// Serve React frontend for any other route (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;