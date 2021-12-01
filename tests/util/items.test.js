const test = require('ava');
const { isStaticPage, isPage, processItem } = require('../../src/util/items.js');

const collectionItem = {
	inputPath: './staff/pete.html',
	url: '/staff/pete/',
	data: {
		tags: ['staff', 'another'],
		seo: { should: 'not be output' }
	},
	template: {
		_layoutKey: 'abc',
		templateData: {
			globalData: {
				cloudcannon: {},
				seo: {}
			}
		}
	}
};

const staticPage = {
	inputPath: './static.html',
	url: '/static/',
	template: { _layoutKey: null },
	data: {}
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
				seo: {}
			}
		}
	}
};

const unlistedPage = {
	...page,
	data: { ...page.data, _unlisted: true }
};

const nonOutputPage = {
	...page,
	url: false
};

const processedPage = {
	title: 'Hi there',
	path: 'page.html',
	url: '/page/',
	layout: 'abc',
	output: true,
	collection: 'pages'
};

test('is static page', (t) => {
	t.truthy(isStaticPage(staticPage));
	t.falsy(isStaticPage(page));
	t.falsy(isStaticPage(collectionItem));
});

test('is page', (t) => {
	t.truthy(isPage(page));
	t.falsy(isPage(staticPage));
	t.falsy(isPage(collectionItem));
});

test('processes item', (t) => {
	t.deepEqual(processItem(page, 'pages', '.'), processedPage);
});

test('processes item in custom source', (t) => {
	const customPage = {
		...page,
		inputPath: './src/page.html'
	};

	t.deepEqual(processItem(customPage, 'pages', 'src'), processedPage);
});

test('processes invalid item', (t) => {
	t.is(processItem({}, 'pages', '.'), undefined);
});

test('processes unlisted item', (t) => {
	t.deepEqual(processItem(unlistedPage, 'pages', '.'), {
		...processedPage,
		_unlisted: true
	});
});

test('processes non output item', (t) => {
	t.deepEqual(processItem(nonOutputPage, 'pages', '.'), {
		...processedPage,
		url: '',
		output: false
	});
});
