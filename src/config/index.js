require('dotenv').config();

module.exports = {
  github: {
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL) || 3600 // Default TTL: 1 hour
  }
}; 