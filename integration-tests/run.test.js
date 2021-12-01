const test = require('ava');
const { bold } = require('chalk');
const { readFile } = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function run(t, folder) {
	const testDir = `integration-tests/${folder}`;
	const cwd = `${testDir}/site`;

	console.log(bold('$ npm install'), cwd);
	await exec('npm install', { cwd, env: { ...process.env, FORCE_COLOR: true } });
	const { stdout, stderr } = await exec('npm start', { cwd, env: { ...process.env, FORCE_COLOR: true } });

	console.log(stdout);
	console.log(stderr);

	t.true(stdout.includes('Wrote 7 files'));

	const contents = await readFile(`${cwd}/_site/_cloudcannon/info.json`);
	const parsed = JSON.parse(contents);

	const expected = await readFile(`${testDir}/expected.json`);
	const parsedExpected = JSON.parse(expected);

	t.deepEqual({ ...parsed, time: null }, { ...parsedExpected, time: null });
	t.truthy(parsed.time.match(/^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i));
}

test('0.12.1 with legacy configuration', async (t) => await run(t, '0.12.1-legacy'));
test('0.12.1', async (t) => await run(t, '0.12.1'));
test('1.0.0-beta.8', async (t) => await run(t, '1.0.0-beta.8'));

