# GitHub API Integration

A Node.js Express API that connects to the GitHub API to show GitHub user activity logs and repository data.

## Features

- Get GitHub user profile and repository data
- Get detailed information about a specific repository
- Create issues in a repository

## API Endpoints

- `GET /github` - Get user profile data, like number of followers, number of following, list of repositories, etc.
- `GET /github/{repo-name}` - Show data about a particular project
- `POST /github/{repo-name}/issues` - Create an issue in the repo and return the GitHub issue URL

## Requirements

- Node.js (v14 or higher)
- GitHub Personal Access Token

## Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file in the root directory with the following variables:
```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username
PORT=3000
NODE_ENV=development
```

## Usage

### Start the server

```
npm start
```

### Development mode with auto-reload

```
npm run dev
```

### Running Tests

```
npm test
```

For continuous testing:
```
npm run test:watch
```

For test coverage:
```
npm run test:coverage
```

## Example Requests

### Get GitHub Profile

```
GET /github
```

Response:
```json
{
  "login": "username",
  "name": "User Name",
  "bio": "Developer",
  "public_repos": 20,
  "followers": 50,
  "following": 30,
  "repositories": [
    {
      "id": 12345,
      "name": "repo-name",
      "description": "Description",
      "html_url": "https://github.com/username/repo-name",
      "language": "JavaScript",
      "stargazers_count": 10,
      "forks_count": 5
    }
  ]
}
```

### Get Repository Data

```
GET /github/repo-name
```

Response:
```json
{
  "id": 12345,
  "name": "repo-name",
  "description": "Description",
  "language": "JavaScript",
  "stargazers_count": 10,
  "forks_count": 5,
  "issues": [
    {
      "id": 67890,
      "title": "Issue Title",
      "html_url": "https://github.com/username/repo-name/issues/1"
    }
  ]
}
```

### Create an Issue

```
POST /github/repo-name/issues
```

Request body:
```json
{
  "title": "Issue Title",
  "body": "Issue description and details"
}
```

Response:
```json
{
  "success": true,
  "message": "Issue created successfully",
  "issue": {
    "id": 67890,
    "number": 1,
    "title": "Issue Title",
    "html_url": "https://github.com/username/repo-name/issues/1"
  }
}
```

## License

MIT 