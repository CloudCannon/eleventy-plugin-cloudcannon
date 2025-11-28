const { test } = require('node:test');
const assert = require('node:assert');
const { getGenerator } = require('../../src/generators/generator.js');

const config = {
	generator: {
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': {
				html: true,
				linkify: true,
			},
		},
	},
};

const processedGenerator = {
	name: 'eleventy',
	version: '1',
	environment: '',
	metadata: {
		markdown: 'markdown-it',
		'markdown-it': {
			html: true,
			linkify: true,
		},
	},
};

test('gets generator', () => {
	const context = {
		pkg: { dependencies: { '@11ty/eleventy': '1' } },
	};

	assert.deepStrictEqual(getGenerator(context, config), processedGenerator);

	const contextDev = {
		pkg: { devDependencies: { '@11ty/eleventy': '2' } },
	};

	assert.deepStrictEqual(getGenerator(contextDev, config), {
		...processedGenerator,
		version: '2',
	});

	assert.deepStrictEqual(getGenerator({}, config), {
		...processedGenerator,
		version: '',
	});
});
