const express = require('express');
const githubController = require('../controllers/githubController');
const router = express.Router();

/**
 * @route   GET /github
 * @desc    Get GitHub user profile and repositories
 * @access  Public
 */
router.get('/', githubController.getGitHubProfile);

/**
 * @route   GET /github/:repoName
 * @desc    Get repository data
 * @access  Public
 */
router.get('/:repoName', githubController.getRepositoryData);

/**
 * @route   POST /github/:repoName/issues
 * @desc    Create an issue in a repository
 * @access  Public
 */
router.post('/:repoName/issues', githubController.createIssue);

module.exports = router; 