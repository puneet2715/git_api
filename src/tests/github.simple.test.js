const assert = require('assert');
const request = require('supertest');
const app = require('../app');

// Create a mock implementation of the GitHub service
const originalModule = require('../services/githubService');

// Mock the GitHub service methods
originalModule.getUserProfile = async () => {
  return {
    login: 'testuser',
    name: 'Test User',
    followers: 10,
    following: 20,
    repositories: [{ name: 'repo1' }, { name: 'repo2' }],
  };
};

originalModule.getRepositoryData = async (repoName) => {
  return {
    name: repoName,
    description: 'Test repository',
    stargazers_count: 5,
    forks_count: 2,
  };
};

originalModule.createIssue = async (repoName, issueData) => {
  return {
    id: 123,
    number: 1,
    title: issueData.title,
    html_url: `https://github.com/testuser/${repoName}/issues/1`,
  };
};

// Define the test suite
async function runTests() {
  let passedTests = 0;
  let failedTests = 0;
  
  console.log('Running GitHub API tests...\n');
  
  // Test: GET /github
  try {
    console.log('TEST: GET /github - should return user profile data');
    const response = await request(app).get('/github');
    
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, {
      login: 'testuser',
      name: 'Test User',
      followers: 10,
      following: 20,
      repositories: [{ name: 'repo1' }, { name: 'repo2' }],
    });
    
    console.log('✅ PASS: GET /github returns correct profile data\n');
    passedTests++;
  } catch (error) {
    console.error('❌ FAIL: GET /github test failed:', error.message);
    failedTests++;
  }
  
  // Test: GET /github - error handling
  try {
    console.log('TEST: GET /github - should handle errors');
    
    // Override the mock to simulate an error
    const originalGetProfile = originalModule.getUserProfile;
    originalModule.getUserProfile = async () => {
      throw new Error('API error');
    };
    
    const response = await request(app).get('/github');
    
    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.message, 'API error');
    
    // Restore the original mock
    originalModule.getUserProfile = originalGetProfile;
    
    console.log('✅ PASS: GET /github handles errors correctly\n');
    passedTests++;
  } catch (error) {
    console.error('❌ FAIL: GET /github error handling test failed:', error.message);
    failedTests++;
    
    // Make sure to restore the original mock
    originalModule.getUserProfile = async () => {
      return {
        login: 'testuser',
        name: 'Test User',
        followers: 10,
        following: 20,
        repositories: [{ name: 'repo1' }, { name: 'repo2' }],
      };
    };
  }
  
  // Test: GET /github/:repoName
  try {
    console.log('TEST: GET /github/:repoName - should return repository data');
    const response = await request(app).get('/github/repo1');
    
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, {
      name: 'repo1',
      description: 'Test repository',
      stargazers_count: 5,
      forks_count: 2,
    });
    
    console.log('✅ PASS: GET /github/:repoName returns correct repository data\n');
    passedTests++;
  } catch (error) {
    console.error('❌ FAIL: GET /github/:repoName test failed:', error.message);
    failedTests++;
  }
  
  // Test: POST /github/:repoName/issues
  try {
    console.log('TEST: POST /github/:repoName/issues - should create an issue');
    const response = await request(app)
      .post('/github/repo1/issues')
      .send({ title: 'Test Issue', body: 'This is a test issue' });
    
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.success, true);
    assert.deepStrictEqual(response.body.issue, {
      id: 123,
      number: 1,
      title: 'Test Issue',
      html_url: 'https://github.com/testuser/repo1/issues/1',
    });
    
    console.log('✅ PASS: POST /github/:repoName/issues creates an issue correctly\n');
    passedTests++;
  } catch (error) {
    console.error('❌ FAIL: POST /github/:repoName/issues test failed:', error.message);
    failedTests++;
  }
  
  // Test: POST /github/:repoName/issues - validation
  try {
    console.log('TEST: POST /github/:repoName/issues - should validate required fields');
    const response = await request(app)
      .post('/github/repo1/issues')
      .send({ body: 'This is a test issue' });
    
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.message, 'Title and body are required');
    
    console.log('✅ PASS: POST /github/:repoName/issues validates required fields\n');
    passedTests++;
  } catch (error) {
    console.error('❌ FAIL: POST /github/:repoName/issues validation test failed:', error.message);
    failedTests++;
  }
  
  // Summary
  console.log('====================');
  console.log(`TESTS SUMMARY: Passed: ${passedTests}, Failed: ${failedTests}`);
  
  if (failedTests > 0) {
    console.log('❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
}); 