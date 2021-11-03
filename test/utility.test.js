const utility = require('../src/utility.js');

test('normalises path', () => {
	expect(utility.normalisePath('./hello.txt')).toEqual('hello.txt');
	expect(utility.normalisePath('.')).toEqual('');
	expect(utility.normalisePath('./')).toEqual('');
	expect(utility.normalisePath('src/')).toEqual('src/');
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

test('stringifies pages in json', () => {
	const hugeObjects = {
		title: 'My page',
		otherPages: [
			{
				template: {},
				inputPath: '',
				fileSlug: '',
				filePathStem: '',
				data: {},
				date: new Date(),
				outputPath: '',
				url: '',
				templateContent: {},
				_templateContent: {}
			}
		]
	};

	const expected = '{\n\t"title": "My page",\n\t"otherPages": [\n\t\t"[FILTERED]"\n\t]\n}';
	expect(utility.stringifyJson(hugeObjects)).toEqual(expected);
});
