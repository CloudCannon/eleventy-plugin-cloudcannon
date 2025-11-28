const test = require('ava');
const { getCollections, getCollectionsConfig } = require('../../src/generators/collections.js');

const config = {
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

const post = {
	...collectionItem,
	inputPath: './content/blog/base.html',
	url: '/blog/base/',
	data: { tags: ['posts', 'another'] },
};

const newsPost = {
	...collectionItem,
	inputPath: './content/blog/news-event.md',
	url: '/blog/news-event/',
	data: { tags: ['posts', 'news'] },
};

const companyPost = {
	...collectionItem,
	inputPath: './company-blog/company-update.liquid',
	url: '/blog/company-update/',
	data: { tags: ['posts', 'company'] },
};

const nonOutputCollectionItem = {
	...collectionItem,
	inputPath: './staff/accounting/angela.html',
	url: false,
};

const outsideCollectionItem = {
	...collectionItem,
	inputPath: './nested/authors/jane.html',
	url: '/staff/jane/',
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

const unlistedPage = {
	...page,
	data: { ...page.data, _unlisted: true },
};

const nonOutputPage = {
	...page,
	url: false,
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

const processedPost = {
	path: 'content/blog/base.html',
	url: '/blog/base/',
	collection: 'blog',
	output: true,
	layout: 'abc',
	tags: ['posts', 'another'],
};

const processedNewsPost = {
	path: 'content/blog/news-event.md',
	collection: 'blog',
	url: '/blog/news-event/',
	output: true,
	layout: 'abc',
	tags: ['posts', 'news'],
};

const processedCompanyPost = {
	path: 'company-blog/company-update.liquid',
	collection: 'company-blog',
	url: '/blog/company-update/',
	output: true,
	layout: 'abc',
	tags: ['posts', 'company'],
};

test('gets collections', async (t) => {
	const context = {
		collections: {
			all: [
				page,
				unlistedPage,
				nonOutputPage,
				collectionItem,
				staticPage,
				post,
				newsPost,
				companyPost,
			],
			staff: [collectionItem],
			posts: [post, newsPost, companyPost],
			news: [newsPost],
			company: [companyPost],
		},
	};

	const collectionsConfig = {
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
		'company-blog': {
			auto_discovered: true,
			output: true,
			path: 'company-blog',
		},
		blog: {
			auto_discovered: false,
			output: true,
			path: 'content/blog',
		},
	};

	t.deepEqual(await getCollections(collectionsConfig, context, config), {
		pages: [
			processedPage,
			{ ...processedPage, _unlisted: true },
			{ ...processedPage, output: false, url: '' },
			processedStaticPage,
		],
		staff: [processedCollectionItem],
		'company-blog': [processedCompanyPost],
		blog: [processedPost, processedNewsPost],
	});
});

test('gets collections config', (t) => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage, post, newsPost, companyPost],
			staff: [collectionItem],
			posts: [post, newsPost, companyPost],
			news: [newsPost],
			company: [companyPost],
		},
	};

	t.deepEqual(getCollectionsConfig(context, config), {
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
		'company-blog': {
			auto_discovered: true,
			output: true,
			path: 'company-blog',
		},
		'content/blog': {
			auto_discovered: true,
			output: true,
			path: 'content/blog',
		},
	});

	const specifiedConfig = {
		...config,
		collections_config: {
			blog: {
				path: 'content/blog',
			},
		},
	};

	t.deepEqual(getCollectionsConfig(context, specifiedConfig), {
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
		'company-blog': {
			auto_discovered: true,
			output: true,
			path: 'company-blog',
		},
		blog: {
			auto_discovered: false,
			output: true,
			path: 'content/blog',
		},
	});
});

test('gets complex collections config', (t) => {
	const context = {
		collections: {
			all: [page, collectionItem, nonOutputCollectionItem, outsideCollectionItem, staticPage],
			another: [collectionItem],
			staff: [collectionItem, nonOutputCollectionItem, outsideCollectionItem],
		},
	};

	t.deepEqual(getCollectionsConfig(context, config), {
		'nested/authors': {
			output: true,
			path: 'nested/authors',
			auto_discovered: true,
		},
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
	});
});

test('gets custom collections config', (t) => {
	const customConfig = {
		collections_config_override: true,
		collections_config: {
			anything: 'here',
		},
	};

	t.deepEqual(getCollectionsConfig(null, customConfig), {
		anything: 'here',
	});
});
