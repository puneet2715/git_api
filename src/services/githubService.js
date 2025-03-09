const config = require('../config');
const redisService = require('./redisService');
const logger = require('../config/logger');

// Create a class that will be properly initialized after Octokit is loaded
class GitHubService {
  constructor() {
    this.octokit = null;
    this.username = config.github.username;
    this.initializeOctokit();
  }

  async initializeOctokit() {
    try {
      // Dynamically import Octokit
      const { Octokit } = await import('@octokit/rest');
      this.octokit = new Octokit({
        auth: config.github.token
      });
    } catch (error) {
      logger.error('Failed to initialize Octokit:', error);
      throw error;
    }
  }

  /**
   * Get user profile data including followers, following, and repositories
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const cacheKey = `github:user:${this.username}`;
      
      // Try to get from cache first
      const cachedData = await redisService.get(cacheKey);
      if (cachedData) {
        logger.info(`Retrieved user profile from cache for ${this.username}`);
        return cachedData;
      }

      // Ensure Octokit is initialized
      if (!this.octokit) await this.initializeOctokit();

      // Get user data
      const { data: userData } = await this.octokit.users.getByUsername({
        username: this.username,
      });

      // Get user's repositories
      const { data: repos } = await this.octokit.repos.listForUser({
        username: this.username,
        per_page: 100, // Fetch up to 100 repos
        sort: 'updated',
      });

      // Format the response
      const profileData = {
        login: userData.login,
        name: userData.name,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        repositories: repos.map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          updated_at: repo.updated_at,
        })),
      };

      // Store in cache
      await redisService.set(cacheKey, profileData);
      logger.info(`Stored user profile in cache for ${this.username}`);

      return profileData;
    } catch (error) {
      logger.error(`Failed to fetch GitHub profile: ${error.message}`);
      throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
    }
  }

  /**
   * Get data for a specific repository
   * @param {string} repoName - Name of the repository
   * @returns {Promise<Object>} Repository data
   */
  async getRepositoryData(repoName) {
    try {
      const cacheKey = `github:repo:${this.username}:${repoName}`;
      
      // Try to get from cache first
      const cachedData = await redisService.get(cacheKey);
      if (cachedData) {
        logger.info(`Retrieved repository data from cache for ${repoName}`);
        return cachedData;
      }

      // Ensure Octokit is initialized
      if (!this.octokit) await this.initializeOctokit();

      // Get repository data
      const { data: repoData } = await this.octokit.repos.get({
        owner: this.username,
        repo: repoName,
      });

      // Get repository languages
      const { data: languages } = await this.octokit.repos.listLanguages({
        owner: this.username,
        repo: repoName,
      });

      // Get repository issues
      const { data: issues } = await this.octokit.issues.listForRepo({
        owner: this.username,
        repo: repoName,
        state: 'open',
        per_page: 10,
      });

      // Get repository contributors
      const { data: contributors } = await this.octokit.repos.listContributors({
        owner: this.username,
        repo: repoName,
        per_page: 10,
      });

      // Format the repository data
      const formattedRepoData = {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        html_url: repoData.html_url,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
        language: repoData.language,
        default_branch: repoData.default_branch,
        size: repoData.size,
        stargazers_count: repoData.stargazers_count,
        watchers_count: repoData.watchers_count,
        forks_count: repoData.forks_count,
        open_issues_count: repoData.open_issues_count,
        languages,
        issues: issues.map(issue => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          html_url: issue.html_url,
          state: issue.state,
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          user: {
            login: issue.user.login,
            avatar_url: issue.user.avatar_url,
            html_url: issue.user.html_url,
          },
        })),
        contributors: contributors.map(contributor => ({
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          contributions: contributor.contributions,
        })),
      };

      // Store in cache
      await redisService.set(cacheKey, formattedRepoData);
      logger.info(`Stored repository data in cache for ${repoName}`);

      return formattedRepoData;
    } catch (error) {
      logger.error(`Failed to fetch repository data: ${error.message}`);
      throw new Error(`Failed to fetch repository data: ${error.message}`);
    }
  }

  /**
   * Create an issue in a repository
   * @param {string} repoName - Name of the repository
   * @param {Object} issueData - Issue data containing title and body
   * @returns {Promise<Object>} Created issue data
   */
  async createIssue(repoName, issueData) {
    try {
      // Ensure Octokit is initialized
      if (!this.octokit) await this.initializeOctokit();

      const { data } = await this.octokit.issues.create({
        owner: this.username,
        repo: repoName,
        title: issueData.title,
        body: issueData.body,
      });

      // Invalidate repo cache since we've added an issue
      const cacheKey = `github:repo:${this.username}:${repoName}`;
      await redisService.del(cacheKey);
      logger.info(`Invalidated cache for ${repoName} after creating a new issue`);

      return {
        id: data.id,
        number: data.number,
        title: data.title,
        html_url: data.html_url,
        created_at: data.created_at,
      };
    } catch (error) {
      logger.error(`Failed to create issue: ${error.message}`);
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }
}

module.exports = new GitHubService(); 