const utility = require('../src/utility.js');

test('normalises path', () => {
	expect(utility.normalisePath('./hello.txt')).toEqual('hello.txt');
	expect(utility.normalisePath('.')).toEqual('');
	expect(utility.normalisePath('./')).toEqual('');
	expect(utility.normalisePath('/abc//def')).toEqual('/abc/def');
});

test('strips top path', () => {
	expect(utility.stripTopPath('hello/hello.txt', 'hello/')).toEqual('hello.txt');
	expect(utility.stripTopPath('hello/hello.txt', 'hello')).toEqual('/hello.txt');
	expect(utility.stripTopPath('hello/hello.txt', '/hello')).toEqual('hello/hello.txt');
	expect(utility.stripTopPath('/hello/hello.txt', 'hello')).toEqual('/hello/hello.txt');
	expect(utility.stripTopPath('hello/hello.txt', 'goodbye')).toEqual('hello/hello.txt');
});


test('stringifies json', () => {
	expect(utility.stringifyJson({ hello: 'there' })).toEqual('{\n\t"hello": "there"\n}')
});

test('stringifies circular json', () => {
	const circular = { hello: 'there' };
	circular.oops = circular;

	const expected = '{\n\t"hello": "there",\n\t"oops": "[Circular]"\n}';
	expect(utility.stringifyJson(circular)).toEqual(expected);
});
