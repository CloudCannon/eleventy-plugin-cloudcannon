const test = require('ava');
const { readFile } = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const testDir = 'integration-tests/1.0.0-beta.8';
const cwd = 'integration-tests/1.0.0-beta.8/site';

test('beta', async (t) => {
	t.timeout(60000);
	await exec('npm install', { cwd, env: process.env });

	const { stdout } = await exec('npm start', { cwd, env: process.env });

	t.true(stdout.includes('Wrote 7 files'));

	const contents = await readFile(`${cwd}/_site/_cloudcannon/info.json`);
	const expected = await readFile(`${testDir}/expected.json`);

	const parsed = JSON.parse(contents);
	const parsedExpected = JSON.parse(expected);

	t.like(parsed, parsedExpected);
	t.truthy(parsed.time.match(/^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i));
});
