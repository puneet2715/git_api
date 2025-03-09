const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');

// Start the server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.server.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  
  server.close(() => {
    logger.info('Process terminated!');
  });
}); 