const test = require('ava');
const { bold } = require('chalk');
const { readFile } = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function run(t, folder, buildCmd = 'npx @11ty/eleventy') {
	const testDir = `integration-tests/${folder}`;
	const cwd = `${testDir}/site`;
	const options = { cwd, env: { ...process.env, FORCE_COLOR: true } };

	console.log(bold('$ npm i'));
	await exec('npm i', options);

	console.log(bold(`$ ${buildCmd}`));
	const { stdout, stderr } = await exec(buildCmd, options);

	console.log(stdout);
	console.log(stderr);

	t.true(stdout.includes('Wrote 7 files'));

	const contents = await readFile(`${cwd}/_site/_cloudcannon/info.json`);
	const parsed = JSON.parse(contents);

	const expected = await readFile(`${testDir}/expected.json`);
	const parsedExpected = JSON.parse(expected);

	const ignores = {
		time: null,
		cloudcannon: null
	};

	t.deepEqual({ ...parsed, ...ignores }, { ...parsedExpected, ...ignores });
	t.truthy(parsed.time.match(/^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i));
}

test('0.12.1 with legacy configuration', async (t) => await run(t, '0.12.1-legacy'));

test('0.12.1', async (t) => await run(t, '0.12.1'));

test('1.0.0', async (t) => await run(t, '1.0.0'));

test('1.0.0 with file source', async (t) => await run(t, '1.0.0-file-source'));

test('1.0.0 with source', async (t) => {
	await run(
		t,
		'1.0.0-source',
		'CLOUDCANNON_CONFIG_PATH=src/cloudcannon.config.js CC_ELEVENTY_INPUT=src npx @11ty/eleventy --input=src --config=src/.eleventy.js'
	);
});

test('2.0.0-beta3', async (t) => await run(t, '2.0.0-beta.3'));
