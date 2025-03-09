const winston = require('winston');
const path = require('path');
const config = require('./index');

// Define the log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create a logger instance
const logger = winston.createLogger({
  level: config.server.env === 'development' ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'github-api' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`
        )
      ),
    }),
    // Write logs to file
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'exceptions.log') 
    })
  ],
});

// Create a stream object for Morgan integration
logger.stream = {
  write: message => {
    logger.info(message.trim());
  },
};

module.exports = logger; 