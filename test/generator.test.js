const pkginfo = require('pkginfo')(module, 'version');
const info = require('../src/generator.js');

const version = module.exports.version || '';

const config = {
	dir: {
		input: '.',
		data: '_data',
		layouts: '_includes'
	}
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

test('is static page', () => {
	expect(info.isStaticPage(staticPage)).toEqual(true);
	expect(info.isStaticPage(page)).toBeFalsy();
	expect(info.isStaticPage(collectionItem)).toBeFalsy();
});

test('is page', () => {
	expect(info.isPage(page)).toEqual(true);
	expect(info.isPage(staticPage)).toBeFalsy();
	expect(info.isPage(collectionItem)).toBeFalsy();
});

test('gets collections', () => {
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

	expect(info.getCollections(collectionsConfig, context, config)).toEqual({
		pages: [processedPage, processedStaticPage],
		staff: [processedCollectionItem]
	});
});

test('gets data', () => {
	const context = {
		things: ['a', 'b', 'c'],
		nope: { hello: 'there' },
		cloudcannon: {
			data: {
				things: true,
				stuff: true,
				nope: false
			}
		}
	};

	expect(info.getData(context)).toEqual({
		things: ['a', 'b', 'c'],
		stuff: {}
	});
});

test('get no data', () => {
	expect(info.getData({})).toEqual({});
});

test('processes item', () => {
	expect(info.processItem(page, 'pages', '.')).toEqual(processedPage);
});

test('processes invalid item', () => {
	expect(info.processItem({}, 'pages', '.')).toBeUndefined();
});

test('processes unlisted item', () => {
	expect(info.processItem(unlistedPage, 'pages', '.')).toEqual({
		...processedPage,
		_unlisted: true
	});
});

test('processes non output item', () => {
	expect(info.processItem(nonOutputPage, 'pages', '.')).toEqual({
		...processedPage,
		url: '',
		output: false
	});
});


function getGenerator(context, config) {
	const eleventyVersion = context.pkg.dependencies['@11ty/eleventy']
		|| context.pkg.devDependencies['@11ty/eleventy']
		|| '';

	return {
		name: 'eleventy',
		version: eleventyVersion,
		environment: environment || '',
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': config.markdownItOptions || {}
		}
	};
}

const processedGenerator = {
	name: 'eleventy',
	version: '1',
	environment: '',
	metadata: {
		markdown: 'markdown-it',
		'markdown-it': { html: true }
	}
};

test('gets generator', () => {
	const config = {
		markdownItOptions: { html: true }
	};

	const context = {
		pkg: { dependencies: { '@11ty/eleventy': '1' } }
	};

	expect(info.getGenerator(context, config)).toEqual(processedGenerator);

	const contextDev = {
		pkg: { devDependencies: { '@11ty/eleventy': '2' } }
	};

	expect(info.getGenerator(contextDev, config)).toEqual({
		...processedGenerator,
		version: '2'
	});

	expect(info.getGenerator({}, config)).toEqual({
		...processedGenerator,
		version: ''
	});
});

const processedPaths = {
	uploads: 'uploads',
	data: '_data',
	collections: '',
	layouts: '_includes'
};

test('gets paths', () => {
	const context = {
		cloudcannon: { uploads_dir: 'assets/raw' }
	};

	expect(info.getPaths({}, config)).toEqual(processedPaths);
	expect(info.getPaths(context, config)).toEqual({
		...processedPaths,
		uploads: 'assets/raw'
	});
});

test('gets collections config', () => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		}
	};

	expect(info.getCollectionsConfig(context, config)).toEqual({
		pages: {
			path: '',
			output: true,
			filter: 'strict'
		},
		staff: {
			output: true,
			path: 'staff'
		},
		data: {
			output: false,
			path: '_data',
		}
	});
});

test('gets complex collections config', () => {
	const context = {
		collections: {
			all: [page, collectionItem, nonOutputCollectionItem, outsideCollectionItem, staticPage],
			another: [collectionItem],
			staff: [collectionItem, nonOutputCollectionItem, outsideCollectionItem]
		}
	};

	expect(info.getCollectionsConfig(context, config)).toEqual({
		'nested/authors': {
			output: true,
			path: 'nested/authors'
		},
		pages: {
			path: '',
			output: true,
			filter: 'strict'
		},
		staff: {
			output: true,
			path: 'staff'
		},
		data: {
			output: false,
			path: '_data'
		}
	});
});

test('gets custom collections config', () => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		},
		cloudcannon: {
			collections: {
				anything: 'here'
			}
		}
	};

	expect(info.getCollectionsConfig(context, config)).toEqual({
		anything: 'here'
	});
});

const processedInfo = {
	_select_data: {
		shrutes: ['Dwight', 'Mose']
	},
	'base-url': '',
	cloudcannon: {
		name: 'eleventy-plugin-cloudcannon',
		version: version
	},
	collections: {
		pages: [processedPage, processedStaticPage],
		staff: [processedCollectionItem]
	},
	'collections-config': {
		pages: {
			path: '',
			output: true,
			filter: 'strict'
		},
		staff: {
			output: true,
			path: 'staff'
		},
		data: {
			output: false,
			path: '_data',
		}
	},
	data: {},
	generator: processedGenerator,
	paths: processedPaths,
	source: '.',
	time: new Date().toISOString(),
	version: '0.0.2'
};

test('gets info', () => {
	const context = {
		collections: {
			all: [page, collectionItem, staticPage],
			staff: [collectionItem]
		},
		cloudcannon: {
			_select_data: {
				shrutes: ['Dwight', 'Mose']
			}
		}
	};

	expect(info.getInfo(context, config)).toEqual(processedInfo);
});
