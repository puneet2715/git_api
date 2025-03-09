const request = require('supertest');
const app = require('../app');

// Mock the GitHub service
jest.mock('../services/githubService', () => {
  // Create a mock implementation of the service
  return {
    // Mock the initialization method
    initializeOctokit: jest.fn(),
    
    // Mock the getUserProfile method
    getUserProfile: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        login: 'testuser',
        name: 'Test User',
        followers: 10,
        following: 20,
        repositories: [{ name: 'repo1' }, { name: 'repo2' }],
      });
    }),
    
    // Mock the getRepositoryData method
    getRepositoryData: jest.fn().mockImplementation((repoName) => {
      return Promise.resolve({
        name: repoName,
        description: 'Test repository',
        stargazers_count: 5,
        forks_count: 2,
      });
    }),
    
    // Mock the createIssue method
    createIssue: jest.fn().mockImplementation((repoName, issueData) => {
      return Promise.resolve({
        id: 123,
        number: 1,
        title: issueData.title,
        html_url: `https://github.com/testuser/${repoName}/issues/1`,
      });
    }),
  };
});

// Import the mocked service
const githubService = require('../services/githubService');

describe('GitHub API endpoints', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /github', () => {
    it('should return user profile data', async () => {
      // Make request
      const response = await request(app).get('/github');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        login: 'testuser',
        name: 'Test User',
        followers: 10,
        following: 20,
        repositories: [{ name: 'repo1' }, { name: 'repo2' }],
      });
      expect(githubService.getUserProfile).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors', async () => {
      // Override the mock to simulate an error
      githubService.getUserProfile.mockRejectedValueOnce(new Error('API error'));
      
      // Make request
      const response = await request(app).get('/github');
      
      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'API error');
    });
  });
  
  describe('GET /github/:repoName', () => {
    it('should return repository data', async () => {
      // Make request
      const response = await request(app).get('/github/repo1');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        name: 'repo1',
        description: 'Test repository',
        stargazers_count: 5,
        forks_count: 2,
      });
      expect(githubService.getRepositoryData).toHaveBeenCalledTimes(1);
      expect(githubService.getRepositoryData).toHaveBeenCalledWith('repo1');
    });
    
    it('should handle errors', async () => {
      // Override the mock to simulate an error
      githubService.getRepositoryData.mockRejectedValueOnce(new Error('Repository not found'));
      
      // Make request
      const response = await request(app).get('/github/nonexistent-repo');
      
      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Repository not found');
    });
  });
  
  describe('POST /github/:repoName/issues', () => {
    it('should create an issue and return issue data', async () => {
      // Make request
      const response = await request(app)
        .post('/github/repo1/issues')
        .send({ title: 'Test Issue', body: 'This is a test issue' });
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('issue', {
        id: 123,
        number: 1,
        title: 'Test Issue',
        html_url: 'https://github.com/testuser/repo1/issues/1',
      });
      expect(githubService.createIssue).toHaveBeenCalledTimes(1);
      expect(githubService.createIssue).toHaveBeenCalledWith('repo1', {
        title: 'Test Issue',
        body: 'This is a test issue',
      });
    });
    
    it('should validate required fields', async () => {
      // Make request without title
      const response = await request(app)
        .post('/github/repo1/issues')
        .send({ body: 'This is a test issue' });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Title and body are required');
      expect(githubService.createIssue).not.toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Override the mock to simulate an error
      githubService.createIssue.mockRejectedValueOnce(new Error('Failed to create issue'));
      
      // Make request
      const response = await request(app)
        .post('/github/repo1/issues')
        .send({ title: 'Test Issue', body: 'This is a test issue' });
      
      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Failed to create issue');
    });
  });
}); 