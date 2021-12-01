const test = require('ava');
const { getCollections, getCollectionsConfig } = require('../../src/generators/collections.js');

const config = {
	_select_data: {
		shrutes: ['Dwight', 'Mose']
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
	source: ''
};

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

const nonOutputCollectionItem = {
	...collectionItem,
	inputPath: './staff/accounting/angela.html',
	url: false
};

const outsideCollectionItem = {
	...collectionItem,
	inputPath: './nested/authors/jane.html',
	url: '/staff/jane/'
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

const processedCollectionItem = {
	tags: ['staff', 'another'],
	seo: { should: 'not be output' },
	path: 'staff/pete.html',
	url: '/staff/pete/',
	output: true,
	collection: 'staff',
	layout: 'abc'
};

const processedPage = {
	title: 'Hi there',
	path: 'page.html',
	url: '/page/',
	layout: 'abc',
	output: true,
	collection: 'pages'
};

const processedStaticPage = {
	path: 'static.html',
	url: '/static/',
	output: true,
	collection: 'pages'
};

test('gets collections', (t) => {
	const context = {
		collections: {
			all: [
				page,
				unlistedPage,
				nonOutputPage,
				collectionItem,
				staticPage
			],
			staff: [collectionItem]
		}
	};

	const collectionsConfig = {
		pages: { path: '', output: true },
		staff: { path: 'staff' }
	}

	t.deepEqual(getCollections(collectionsConfig, context, config), {
		pages: [
			processedPage,
			{ ...processedPage, _unlisted: true },
			{ ...processedPage, output: false, url: '' },
			processedStaticPage
		],
		staff: [processedCollectionItem]
	});
});

test('gets collections config', (t) => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		}
	};

	t.deepEqual(getCollectionsConfig(context, config), {
		pages: {
			path: '',
			output: true,
			filter: 'strict',
			auto_discovered: true
		},
		staff: {
			output: true,
			path: 'staff',
			auto_discovered: true
		}
	});
});

test('gets complex collections config', (t) => {
	const context = {
		collections: {
			all: [page, collectionItem, nonOutputCollectionItem, outsideCollectionItem, staticPage],
			another: [collectionItem],
			staff: [collectionItem, nonOutputCollectionItem, outsideCollectionItem]
		}
	};

	t.deepEqual(getCollectionsConfig(context, config), {
		'nested/authors': {
			output: true,
			path: 'nested/authors',
			auto_discovered: true
		},
		pages: {
			path: '',
			output: true,
			filter: 'strict',
			auto_discovered: true
		},
		staff: {
			output: true,
			path: 'staff',
			auto_discovered: true
		}
	});
});

test('gets custom collections config', (t) => {
	const customConfig = {
		collections_config_override: true,
		collections_config: {
			anything: 'here'
		}
	}

	t.deepEqual(getCollectionsConfig(null, customConfig), {
		anything: 'here'
	});
});
