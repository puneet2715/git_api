const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./config/logger');
const githubRoutes = require('./routes/githubRoutes');
const githubTokenMiddleware = require('./middleware/githubTokenMiddleware');

// Create Express app
const app = express();

// Create logs directory
require('fs').mkdirSync('logs', { recursive: true });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/github', githubTokenMiddleware, githubRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: config.server.env === 'development' ? err.stack : undefined,
  });
});

// 404 route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = app; 