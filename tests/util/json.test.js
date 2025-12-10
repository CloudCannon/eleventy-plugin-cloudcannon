const assert = require('node:assert');
const { test } = require('node:test');
const { stringifyJson } = require('../../src/util/json.js');

test('stringifies json', () => {
	assert.equal(stringifyJson({ hello: 'there' }), '{\n\t"hello": "there"\n}');
});

test('stringifies circular json', () => {
	const circular = { hello: 'there' };
	circular.oops = circular;

	const expected = '{\n\t"hello": "there",\n\t"oops": "[Circular]"\n}';
	assert.equal(stringifyJson(circular), expected);
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

	assert.equal(stringifyJson(hugeObjects), expected);
});
