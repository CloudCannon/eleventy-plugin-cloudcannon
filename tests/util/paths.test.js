const { test } = require('node:test');
const assert = require('node:assert');
const { normalisePath, stripTopPath } = require('../../src/util/paths.js');

test('normalises path', () => {
	assert.strictEqual(normalisePath('./hello.txt'), 'hello.txt');
	assert.strictEqual(normalisePath('.'), '');
	assert.strictEqual(normalisePath('./'), '');
	assert.strictEqual(normalisePath('src/'), 'src/');
	assert.strictEqual(normalisePath('/abc//def'), '/abc/def');
});

test('strips top path', () => {
	assert.strictEqual(stripTopPath('hello/hello.txt', 'hello/'), 'hello.txt');
	assert.strictEqual(stripTopPath('hello/hello.txt', 'hello'), '/hello.txt');
	assert.strictEqual(stripTopPath('hello/hello.txt', '/hello'), 'hello/hello.txt');
	assert.strictEqual(stripTopPath('/hello/hello.txt', 'hello'), '/hello/hello.txt');
	assert.strictEqual(stripTopPath('hello/hello.txt', 'goodbye'), 'hello/hello.txt');
});
