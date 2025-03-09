const config = require('../config');

/**
 * Middleware to check if GitHub token is configured
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkGitHubToken = (req, res, next) => {
  if (!config.github.token) {
    return res.status(500).json({
      success: false,
      message: 'GitHub token is not configured. Please set GITHUB_TOKEN environment variable.',
    });
  }

  if (!config.github.username) {
    return res.status(500).json({
      success: false,
      message: 'GitHub username is not configured. Please set GITHUB_USERNAME environment variable.',
    });
  }

  next();
};

module.exports = checkGitHubToken; 