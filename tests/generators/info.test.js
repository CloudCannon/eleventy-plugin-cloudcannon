const assert = require('node:assert');
const { test } = require('node:test');
const { getInfo } = require('../../src/generators/info.js');
require('pkginfo')(module, 'version');

const version = module.exports.version || '';

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
	_select_data: {
		shrutes: ['Dwight', 'Mose'],
	},
	base_url: '',
	paths: {
		collections: '',
		data: '_data',
		layouts: '_includes',
		pages: '',
		static: '',
		uploads: 'uploads',
	},
	source: '',
};

const collectionItem = {
	inputPath: './staff/pete.html',
	url: '/staff/pete/',
	data: {
		tags: ['staff', 'another'],
		seo: { should: 'not be output' },
	},
	template: {
		_layoutKey: 'abc',
		templateData: {
			globalData: {
				cloudcannon: {},
				seo: {},
			},
		},
	},
};

const staticPage = {
	inputPath: './static.html',
	url: '/static/',
	template: { _layoutKey: null },
	data: {},
};

const page = {
	data: { title: 'Hi there' },
	inputPath: './page.html',
	url: '/page/',
	template: {
		_layoutKey: 'abc',
		templateData: {
			globalData: {
				cloudcannon: {},
				seo: {},
			},
		},
	},
};

const processedCollectionItem = {
	tags: ['staff', 'another'],
	seo: { should: 'not be output' },
	path: 'staff/pete.html',
	url: '/staff/pete/',
	output: true,
	collection: 'staff',
	layout: 'abc',
};

const processedPage = {
	title: 'Hi there',
	path: 'page.html',
	url: '/page/',
	layout: 'abc',
	output: true,
	collection: 'pages',
};

const processedStaticPage = {
	path: 'static.html',
	url: '/static/',
	output: true,
	collection: 'pages',
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

const processedPaths = {
	...config.paths,
};

const processedInfo = {
	_select_data: {
		shrutes: ['Dwight', 'Mose'],
	},
	base_url: '',
	cloudcannon: {
		name: 'eleventy-plugin-cloudcannon',
		version: version,
	},
	collections: {
		pages: [processedPage, processedStaticPage],
		staff: [processedCollectionItem],
	},
	collections_config: {
		pages: {
			path: '',
			output: true,
			filter: 'strict',
			auto_discovered: true,
		},
		staff: {
			output: true,
			path: 'staff',
			auto_discovered: true,
		},
	},
	data: {},
	generator: processedGenerator,
	paths: processedPaths,
	source: '',
	time: null,
	version: '0.0.3',
};

test('gets info', async () => {
	const context = {
		pkg: {
			dependencies: { '@11ty/eleventy': '1' },
		},
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem],
		},
	};

	const result = await getInfo(context, config);
	assert.deepStrictEqual({ ...result, time: null }, processedInfo);

	const time = result.time.substring(0, 10);
	assert.equal(time, new Date().toISOString().substring(0, 10));
});
