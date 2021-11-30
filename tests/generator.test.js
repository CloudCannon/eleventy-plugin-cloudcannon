const test = require('ava');
const generator = require('../src/generator.js');
require('pkginfo')(module, 'version');

const version = module.exports.version || '';

const options = {
	dir: {
		input: '.',
		data: '_data',
		layouts: '_includes'
	},
	markdownItOptions: {
		html: true,
		linkify: true
	}
};

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

// -----
// Tests

test('is static page', (t) => {
	t.truthy(generator.isStaticPage(staticPage));
	t.falsy(generator.isStaticPage(page));
	t.falsy(generator.isStaticPage(collectionItem));
});

test('is page', (t) => {
	t.truthy(generator.isPage(page));
	t.falsy(generator.isPage(staticPage));
	t.falsy(generator.isPage(collectionItem));
});

test('gets collections', (t) => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		}
	};

	const collectionsConfig = {
		pages: { path: '', output: true },
		staff: { path: 'staff' }
	}

	t.deepEqual(generator.getCollections(collectionsConfig, context, config), {
		pages: [processedPage, processedStaticPage],
		staff: [processedCollectionItem]
	});
});

test('gets data', (t) => {
	const context = {
		things: ['a', 'b', 'c'],
		nope: { hello: 'there' },
	};

	const customConfig = {
		data_config: {
			things: true,
			stuff: true,
			nope: false
		}
	};

	t.deepEqual(generator.getData(context, customConfig), {
		things: ['a', 'b', 'c'],
		stuff: {}
	});
});

test('get no data', (t) => {
	t.deepEqual(generator.getData({}, {}), {});
});

test('processes item', (t) => {
	t.deepEqual(generator.processItem(page, 'pages', '.'), processedPage);
});

test('processes item in custom source', (t) => {
	const customPage = {
		...page,
		inputPath: './src/page.html'
	};

	t.deepEqual(generator.processItem(customPage, 'pages', 'src'), processedPage);
});

test('processes invalid item', (t) => {
	t.is(generator.processItem({}, 'pages', '.'), undefined);
});

test('processes unlisted item', (t) => {
	t.deepEqual(generator.processItem(unlistedPage, 'pages', '.'), {
		...processedPage,
		_unlisted: true
	});
});

test('processes non output item', (t) => {
	t.deepEqual(generator.processItem(nonOutputPage, 'pages', '.'), {
		...processedPage,
		url: '',
		output: false
	});
});

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

	t.deepEqual(generator.getGenerator(context, config, options), processedGenerator);

	const contextDev = {
		pkg: { devDependencies: { '@11ty/eleventy': '2' } }
	};

	t.deepEqual(generator.getGenerator(contextDev, config, options), {
		...processedGenerator,
		version: '2'
	});

	t.deepEqual(generator.getGenerator({}, config, options), {
		...processedGenerator,
		version: ''
	});
});

const processedPaths = {
	...config.paths
};

test('gets collections config', (t) => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		}
	};

	t.deepEqual(generator.getCollectionsConfig(context, config), {
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
		},
		data: { // would be removed later since there is no data the context
			output: false,
			path: '_data',
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

	t.deepEqual(generator.getCollectionsConfig(context, config), {
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
		},
		data: {
			output: false,
			path: '_data',
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



	t.deepEqual(generator.getCollectionsConfig(null, customConfig), {
		anything: 'here'
	});
});

const processedInfo = {
	_select_data: {
		shrutes: ['Dwight', 'Mose']
	},
	base_url: '',
	cloudcannon: {
		name: 'eleventy-plugin-cloudcannon',
		version: version
	},
	collections: {
		pages: [processedPage, processedStaticPage],
		staff: [processedCollectionItem]
	},
	collections_config: {
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
	},
	data: {},
	generator: processedGenerator,
	paths: processedPaths,
	source: '',
	time: null,
	version: '0.0.3'
};

test('gets info', (t) => {
	const context = {
		pkg: {
			dependencies: { '@11ty/eleventy': '1' }
		},
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		}
	};

	const result = generator.getInfo(context, config, options);
	t.deepEqual({ ...result, time: null }, processedInfo);

	const time = result.time.substring(0, 10);
	t.is(time, new Date().toISOString().substring(0, 10));
});
