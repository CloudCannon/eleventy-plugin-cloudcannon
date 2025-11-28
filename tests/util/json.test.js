const { test } = require('node:test');
const assert = require('node:assert');
const { stringifyJson } = require('../../src/util/json.js');

test('stringifies json', () => {
	assert.strictEqual(stringifyJson({ hello: 'there' }), '{\n\t"hello": "there"\n}');
});

test('stringifies circular json', () => {
	const circular = { hello: 'there' };
	circular.oops = circular;

	const expected = '{\n\t"hello": "there",\n\t"oops": "[Circular]"\n}';
	assert.strictEqual(stringifyJson(circular), expected);
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
				set templateContent(content) {
					this._templateContent = content;
				},
				get templateContent() {
					throw new Error('How dare you!');
				},
			},
		],
	};

	const expected = JSON.stringify(
		{
			title: 'My page',
			otherPages: ['[FILTERED]'],
		},
		null,
		'\t'
	);

	assert.strictEqual(stringifyJson(hugeObjects), expected);
});
