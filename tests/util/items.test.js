const { test } = require('node:test');
const assert = require('node:assert');
const { isStaticPage, isPage, processItem } = require('../../src/util/items.js');

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
	get fileSlug() {
		return 'page';
	},
	get filePathStem() {
		return '';
	},
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

const unlistedPage = {
	...page,
	data: { ...page.data, _unlisted: true },
};

const nonOutputPage = {
	...page,
	url: false,
};

const processedPage = {
	title: 'Hi there',
	path: 'page.html',
	url: '/page/',
	layout: 'abc',
	output: true,
	fileSlug: 'page',
	filePathStem: '',
	collection: 'pages',
};

test('is static page', () => {
	assert.ok(isStaticPage(staticPage));
	assert.ok(!isStaticPage(page));
	assert.ok(!isStaticPage(collectionItem));
});

test('is page', () => {
	assert.ok(isPage(page));
	assert.ok(!isPage(staticPage));
	assert.ok(!isPage(collectionItem));
});

test('processes item', async () => {
	assert.deepStrictEqual(await processItem(page, 'pages', '.'), processedPage);
});

test('processes item in custom source', async () => {
	const customPage = {
		...page,
		inputPath: './src/page.html',
	};

	assert.deepStrictEqual(await processItem(customPage, 'pages', 'src'), processedPage);
});

test('processes item with custom source formatted differently', async () => {
	const customPage = {
		...page,
		inputPath: './src/page.html',
	};

	assert.deepStrictEqual(await processItem(customPage, 'pages', '/src'), processedPage);
});

test('processes invalid item', async () => {
	assert.strictEqual(await processItem({}, 'pages', '.'), undefined);
});

test('processes unlisted item', async () => {
	assert.deepStrictEqual(await processItem(unlistedPage, 'pages', '.'), {
		...processedPage,
		_unlisted: true,
	});
});

test('processes non output item', async () => {
	assert.deepStrictEqual(await processItem(nonOutputPage, 'pages', '.'), {
		...processedPage,
		url: '',
		output: false,
	});
});
