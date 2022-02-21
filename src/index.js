const axios = require('axios');
const shell = require('shelljs');
const args = ['FelixArcelin', 'token'];

if (
	args.length != 2 &&
	typeof args[0] != 'string' &&
	typeof args[1] != 'string'
) {
	process.exit(0);
}

async function checkPackageJSON(username, repo, token) {
	return await axios({
		method: 'GET',
		url: `https://api.github.com/repos/${username}/${repo}/contents/package.json`,
		headers: { Authorization: 'token ' + token },
	}).then((value) => {
		if (value) {
			return value;
		}
	}).catch((error) => {
		throw new Error('Cant find package.json')
	})
}

async function getRepoName(username, token) {
	const repos = [];
	await axios({
		method: 'GET',
		url: `https://api.github.com/search/repositories?q=user:${username}`,
		headers: { Authorization: 'token ' + token },
	}).then((value) => console.log(value));

	return repos;
}

async function cloneRepo(username, token) {
	if (!shell.which('git')) {
		shell.echo('Sorry, this script requires git');
		shell.exit(1);
	}

	const repoList = await getRepoName(username, token);
	if (!repoList) {
		throw Error('There is no repository');
	}
	repoList.forEach((repo) => {
		await checkPackageJSON(username,repo,token)
	})
	

	shell.mkdir('projects');
	shell.cd('projects');

	repoList.forEach((value) => {
		shell.exec(`git clone ${token}@github.com/${username}/${value}`);
	});
}

cloneRepo(args[0], args[1])
	.then(console.log('Repos have benn cloned to directory'))
	.catch(console.log('something went wrong'))
	.finally(process.exit(0));
