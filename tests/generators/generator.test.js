const test = require('ava');
const { getGenerator } = require('../../src/generators/generator.js');

const config = {
	generator: {
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': {
				html: true,
				linkify: true
			}
		}
	}
};

const processedGenerator = {
	name: 'eleventy',
	version: '1',
	environment: '',
	metadata: {
		markdown: 'markdown-it',
		'markdown-it': {
			html: true,
			linkify: true
		}
	}
};

test('gets generator', (t) => {
	const context = {
		pkg: { dependencies: { '@11ty/eleventy': '1' } }
	};

	t.deepEqual(getGenerator(context, config), processedGenerator);

	const contextDev = {
		pkg: { devDependencies: { '@11ty/eleventy': '2' } }
	};

	t.deepEqual(getGenerator(contextDev, config), {
		...processedGenerator,
		version: '2'
	});

	t.deepEqual(getGenerator({}, config), {
		...processedGenerator,
		version: ''
	});
});
