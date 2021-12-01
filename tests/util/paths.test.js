const test = require('ava');
const { normalisePath, stripTopPath } = require('../../src/util/paths.js');

test('normalises path', (t) => {
	t.is(normalisePath('./hello.txt'), 'hello.txt');
	t.is(normalisePath('.'), '');
	t.is(normalisePath('./'), '');
	t.is(normalisePath('src/'), 'src/');
	t.is(normalisePath('/abc//def'), '/abc/def');
});

test('strips top path', (t) => {
	t.is(stripTopPath('hello/hello.txt', 'hello/'), 'hello.txt');
	t.is(stripTopPath('hello/hello.txt', 'hello'), '/hello.txt');
	t.is(stripTopPath('hello/hello.txt', '/hello'), 'hello/hello.txt');
	t.is(stripTopPath('/hello/hello.txt', 'hello'), '/hello/hello.txt');
	t.is(stripTopPath('hello/hello.txt', 'goodbye'), 'hello/hello.txt');
});
