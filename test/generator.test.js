const pkginfo = require('pkginfo')(module, 'version');
const generator = require('../src/generator.js');

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
	expect(generator.isStaticPage(staticPage)).toEqual(true);
	expect(generator.isStaticPage(page)).toBeFalsy();
	expect(generator.isStaticPage(collectionItem)).toBeFalsy();
});

test('is page', () => {
	expect(generator.isPage(page)).toEqual(true);
	expect(generator.isPage(staticPage)).toBeFalsy();
	expect(generator.isPage(collectionItem)).toBeFalsy();
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

	expect(generator.getCollections(collectionsConfig, context, config)).toEqual({
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

	expect(generator.getData(context)).toEqual({
		things: ['a', 'b', 'c'],
		stuff: {}
	});
});

test('get no data', () => {
	expect(generator.getData({})).toEqual({});
});

test('processes item', () => {
	expect(generator.processItem(page, 'pages', '.')).toEqual(processedPage);
});

test('processes item in custom source', () => {
	const customPage = {
		...page,
		inputPath: './src/page.html'
	};

	expect(generator.processItem(customPage, 'pages', 'src')).toEqual(processedPage);
});

test('processes invalid item', () => {
	expect(generator.processItem({}, 'pages', '.')).toBeUndefined();
});

test('processes unlisted item', () => {
	expect(generator.processItem(unlistedPage, 'pages', '.')).toEqual({
		...processedPage,
		_unlisted: true
	});
});

test('processes non output item', () => {
	expect(generator.processItem(nonOutputPage, 'pages', '.')).toEqual({
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

	expect(generator.getGenerator(context, config)).toEqual(processedGenerator);

	const contextDev = {
		pkg: { devDependencies: { '@11ty/eleventy': '2' } }
	};

	expect(generator.getGenerator(contextDev, config)).toEqual({
		...processedGenerator,
		version: '2'
	});

	expect(generator.getGenerator({}, config)).toEqual({
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

	expect(generator.getPaths({}, config)).toEqual(processedPaths);
	expect(generator.getPaths(context, config)).toEqual({
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

	expect(generator.getCollectionsConfig(context, config)).toEqual({
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

	expect(generator.getCollectionsConfig(context, config)).toEqual({
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

	expect(generator.getCollectionsConfig(context, config)).toEqual({
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
	time: null,
	version: '0.0.2'
};

test('gets info', () => {
	const context = {
		pkg: {
			dependencies: { '@11ty/eleventy': '1' }
		},
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

	const result = generator.getInfo(context, config);
	expect({ ...result, time: null }).toEqual(processedInfo);

	const time = result.time.substring(0, 10);
	expect(time).toEqual(new Date().toISOString().substring(0, 10));
});
