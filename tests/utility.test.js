const test = require('ava');
const utility = require('../src/utility.js');

test('normalises path', (t) => {
	t.is(utility.normalisePath('./hello.txt'), 'hello.txt');
	t.is(utility.normalisePath('.'), '');
	t.is(utility.normalisePath('./'), '');
	t.is(utility.normalisePath('src/'), 'src/');
	t.is(utility.normalisePath('/abc//def'), '/abc/def');
});

test('strips top path', (t) => {
	t.is(utility.stripTopPath('hello/hello.txt', 'hello/'), 'hello.txt');
	t.is(utility.stripTopPath('hello/hello.txt', 'hello'), '/hello.txt');
	t.is(utility.stripTopPath('hello/hello.txt', '/hello'), 'hello/hello.txt');
	t.is(utility.stripTopPath('/hello/hello.txt', 'hello'), '/hello/hello.txt');
	t.is(utility.stripTopPath('hello/hello.txt', 'goodbye'), 'hello/hello.txt');
});


test('stringifies json', (t) => {
	t.is(utility.stringifyJson({ hello: 'there' }), '{\n\t"hello": "there"\n}');
});

test('stringifies circular json', (t) => {
	const circular = { hello: 'there' };
	circular.oops = circular;

	const expected = '{\n\t"hello": "there",\n\t"oops": "[Circular]"\n}';
	t.is(utility.stringifyJson(circular), expected);
});

test('stringifies pages in json', (t) => {
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
	t.is(utility.stringifyJson(hugeObjects), expected);
});
