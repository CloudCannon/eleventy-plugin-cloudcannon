const assert = require('node:assert');
const { test } = require('node:test');
const { normalisePath, stripTopPath } = require('../../src/util/paths.js');

test('normalises path', () => {
	assert.equal(normalisePath('./hello.txt'), 'hello.txt');
	assert.equal(normalisePath('.'), '');
	assert.equal(normalisePath('./'), '');
	assert.equal(normalisePath('src/'), 'src/');
	assert.equal(normalisePath('/abc//def'), '/abc/def');
});

test('strips top path', () => {
	assert.equal(stripTopPath('hello/hello.txt', 'hello/'), 'hello.txt');
	assert.equal(stripTopPath('hello/hello.txt', 'hello'), '/hello.txt');
	assert.equal(stripTopPath('hello/hello.txt', '/hello'), 'hello/hello.txt');
	assert.equal(stripTopPath('/hello/hello.txt', 'hello'), '/hello/hello.txt');
	assert.equal(stripTopPath('hello/hello.txt', 'goodbye'), 'hello/hello.txt');
});
