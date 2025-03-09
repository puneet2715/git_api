require('dotenv').config();

module.exports = {
  github: {
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
}; 