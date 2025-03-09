const githubService = require('../services/githubService');

/**
 * Get GitHub user profile and repositories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getGitHubProfile = async (req, res) => {
  try {
    const profileData = await githubService.getUserProfile();
    res.json(profileData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch GitHub profile',
    });
  }
};

/**
 * Get data for a specific repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRepositoryData = async (req, res) => {
  try {
    const { repoName } = req.params;
    
    if (!repoName) {
      return res.status(400).json({
        success: false,
        message: 'Repository name is required',
      });
    }
    
    const repoData = await githubService.getRepositoryData(repoName);
    res.json(repoData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch repository data',
    });
  }
};

/**
 * Create an issue in a repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createIssue = async (req, res) => {
  try {
    const { repoName } = req.params;
    const { title, body } = req.body;
    
    // Validate request
    if (!repoName) {
      return res.status(400).json({
        success: false,
        message: 'Repository name is required',
      });
    }
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }
    
    const issueData = await githubService.createIssue(repoName, { title, body });
    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue: issueData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create issue',
    });
  }
}; 