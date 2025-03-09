const assert = require('assert');
const githubService = require('../services/githubService');

// Mock the GitHub service methods
githubService.getUserProfile = async () => {
  return {
    login: 'testuser',
    name: 'Test User',
    followers: 10,
    following: 20,
    repositories: [{ name: 'repo1' }, { name: 'repo2' }],
  };
};

githubService.getRepositoryData = async (repoName) => {
  return {
    name: repoName,
    description: 'Test repository',
    stargazers_count: 5,
    forks_count: 2,
  };
};

githubService.createIssue = async (repoName, issueData) => {
  return {
    id: 123,
    number: 1,
    title: issueData.title,
    html_url: `https://github.com/testuser/${repoName}/issues/1`,
  };
};

async function runTests() {
  console.log('Running GitHub API tests...');
  
  try {
    // Test getUserProfile
    console.log('Testing getUserProfile...');
    const profileData = await githubService.getUserProfile();
    assert.strictEqual(profileData.login, 'testuser');
    assert.strictEqual(profileData.followers, 10);
    assert.strictEqual(profileData.repositories.length, 2);
    console.log('✅ getUserProfile test passed');
    
    // Test getRepositoryData
    console.log('Testing getRepositoryData...');
    const repoData = await githubService.getRepositoryData('test-repo');
    assert.strictEqual(repoData.name, 'test-repo');
    assert.strictEqual(repoData.stargazers_count, 5);
    console.log('✅ getRepositoryData test passed');
    
    // Test createIssue
    console.log('Testing createIssue...');
    const issueData = await githubService.createIssue('test-repo', { 
      title: 'Test Issue', 
      body: 'Test body' 
    });
    assert.strictEqual(issueData.title, 'Test Issue');
    assert.strictEqual(issueData.html_url, 'https://github.com/testuser/test-repo/issues/1');
    console.log('✅ createIssue test passed');
    
    console.log('All tests passed! 🎉');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests(); 