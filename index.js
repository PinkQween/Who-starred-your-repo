require('dotenv').config();
const https = require('https');

const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;

// Function to fetch repositories for a given user
function fetchRepositories(username, page = 1) {
    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: `/users/${username}/repos?page=${page}&per_page=100`,
        method: 'GET',
        headers: {
            'User-Agent': 'Node.js',
            'Authorization': `token ${token}`,
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(`Failed to fetch repositories: ${res.statusCode} ${res.statusMessage}`);
                }
            });
        });

        req.on('error', (error) => {
            reject(`Error fetching repositories: ${error}`);
        });

        req.end();
    });
}

// Function to fetch all repositories for a given user
async function fetchAllRepositories(username) {
    let page = 1;
    let repositories = [];
    let repos;

    do {
        repos = await fetchRepositories(username, page);
        repositories = repositories.concat(repos);
        page++;
    } while (repos.length > 0);

    return repositories;
}

// Function to fetch stargazers for a given repository
function fetchStargazers(owner, repo) {
    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${owner}/${repo}/stargazers`,
        method: 'GET',
        headers: {
            'User-Agent': 'Node.js',
            'Authorization': `token ${token}`,
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(`Failed to fetch stargazers: ${res.statusCode} ${res.statusMessage}`);
                }
            });
        });

        req.on('error', (error) => {
            reject(`Error fetching stargazers: ${error}`);
        });

        req.end();
    });
}

// Main function to fetch and display unique starrers
async function main() {
    try {
        const repositories = await fetchAllRepositories(username);

        const starrersSet = new Set();

        for (const repo of repositories) {
            const stargazers = await fetchStargazers(username, repo.name);
            stargazers.forEach(stargazer => {
                starrersSet.add(stargazer.login);
            });
        }

        const uniqueStarrers = Array.from(starrersSet);
        console.log('Unique starrers:', uniqueStarrers);
    } catch (error) {
        console.error(error);
    }
}

// Run the main function
main();
