const test = require('ava');
const { stringifyJson } = require('../../src/util/json.js');

test('stringifies json', (t) => {
	t.is(stringifyJson({ hello: 'there' }), '{\n\t"hello": "there"\n}');
});

test('stringifies circular json', (t) => {
	const circular = { hello: 'there' };
	circular.oops = circular;

	const expected = '{\n\t"hello": "there",\n\t"oops": "[Circular]"\n}';
	t.is(stringifyJson(circular), expected);
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
				set templateContent(content) {
					this._templateContent = content;
				},
				get templateContent() {
					throw new Error('How dare you!');
				}
			}
		]
	};

	const expected = JSON.stringify({
		title: 'My page',
		otherPages: [
			'[FILTERED]'
		],
	}, null, '\t');

	t.is(stringifyJson(hugeObjects), expected);
});
