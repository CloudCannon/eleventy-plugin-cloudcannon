const pkginfo = require('pkginfo')(module, 'version');
const safeStringify = require('fast-safe-stringify');
const { dirname, basename, extname, join } = require('path');
const isEqual = require('lodash.isequal');
const { normalisePath, stripTopPath, stringifyJson } = require('./utility.js');

const environment = process.env.ELEVENTY_ENV || '';
const version = module.exports.version || '';

function isTopPath(basePath, index, basePaths) {
	return !basePaths.some((other) => other !== basePath && basePath.startsWith(`${other}/`));
}

function getSourcePath(inputPath, source) {
	return stripTopPath(normalisePath(inputPath), source).replace(/^\/+/, '');
}

function isStaticPage(item) {
	return item.template
		&& !item.template?._layoutKey
		&& !item.data?.tags?.length
		&& extname(item.inputPath || '') === '.html';
}

function isPage(item) {
	return item.template?._layoutKey && !item.data?.tags?.length;
}

function isUnlisted(item, source) {
	if (item.data?._unlisted === true || !item.inputPath) {
		return true;
	}

	const inputPath = getSourcePath(item.inputPath, source);
	const parentFolder = basename(dirname(inputPath));
	const filename = basename(inputPath);
	return filename.startsWith(`${parentFolder}.`);
}

const IGNORED_ITEM_KEYS = {
	pagination: true,
	collections: true,
	page: true
};

function isIgnoredItemKey(item, key) {
	return IGNORED_ITEM_KEYS[key]
		|| isEqual(item.template?.templateData?.globalData?.[key], item.data?.[key]);
}

function processItem(item, tag, source) {
	if (!item.inputPath) {
		return;
	}

	const data = item.data || {};

	const combinedData = Object.keys(data).reduce((memo, key) => {
		if (!isIgnoredItemKey(item, key)) {
			memo[key] = data[key];
		}

		return memo;
	}, {});

	const processed = {
		...combinedData,
		path: getSourcePath(item.inputPath, source),
		url: item.url || '',
		output: item.url !== false
	};

	if (tag) {
		processed.collection = tag;
	}

	if (item.template?._layoutKey) {
		processed.layout = item.template?._layoutKey;
	}

	if (isUnlisted(item, source)) {
		processed._unlisted = true;
	}

	return processed;
}

// Stringified individually to avoid one item breaking it
function jsonifyItems(items, tag, config) {
	const processedItems = items?.reduce?.((memo, item) => {
		const processed = processItem(item, tag, config.dir.input);
		const stringified = stringifyJson(processed);

		if (stringified !== undefined) {
			memo.push(stringified);
		}

		return memo;
	}, []) || [];

	return JSON.parse(`[${processedItems.join(',\n')}]`);
}

function getData(context) {
	const data = context.cloudcannon?.data || {};

	return Object.keys(data).reduce((memo, key) => {
		if (data[key] === true) {
			memo[key] = context[key] ?? {};
		}

		return memo;
	}, {});
}

function guessCollections(all, config) {
	return all.reduce((memo, item) => {
		const tag = item.data?.tags?.[0];

		if (tag && item.inputPath) {
			memo[tag] = memo[tag] ?? { basePaths: new Set(), outputOffset: 0 };
			// Map tags to basePaths, items with same tags can exist in separate folders
			const inputPath = getSourcePath(item.inputPath, config.dir.input);
			memo[tag].basePaths.add(dirname(inputPath));
			// Tracks how collection items are output
			memo[tag].outputOffset += item.url === false ? -1 : 1;
		}

		return memo;
	}, {});
}

function getCollections(collectionsConfig, context, config) {
	const { all, ...otherCollections } = context.collections;

	if (!otherCollections.pages) {
		const pages = all.filter((item) => isPage(item) || isStaticPage(item));

		if (pages.length) {
			otherCollections.pages = pages;
		}
	}

	return Object.keys(otherCollections).reduce((memo, tag) => {
		memo[tag] = jsonifyItems(otherCollections[tag], tag, config);
		return memo;
	}, {});
}

function getCollectionsConfig(context, config) {
	if (context.cloudcannon?.collections) {
		return context.cloudcannon.collections; // User-defined collections
	}

	const { all, ...otherCollections } = context.collections;
	const guessedCollections = guessCollections(all, config);
	const collectionsConfig = {
		data: {
			path: config.dir.data,
			output: false
		}
	};

	// Creates a collection config entry for each top level basePath defined for a tag
	Object.keys(guessedCollections).forEach((key) => {
		if (!otherCollections[key]) {
			return;
		}

		// Finds the top-most common basePaths to prevent sub-folders becoming separate entries
		const topBasePaths = Array.from(guessedCollections[key].basePaths).filter(isTopPath);

		// Consider a collection output unless more items are not output
		const isOutput = guessedCollections[key].outputOffset >= 0;

		topBasePaths.forEach((basePath) => {
			// Multiple collections can share this basePath, but this should cover common use-cases
			collectionsConfig[topBasePaths.length === 1 ? key : basePath] = {
				path: basePath,
				output: isOutput
			};
		});
	});

	const needsPages = !collectionsConfig.pages
		&& all.some((item) => isPage(item) || isStaticPage(item));

	if (needsPages) {
		// Add collection for pages without collection
		collectionsConfig.pages = {
			path: config.dir.pages || '',
			output: true,
			filter: 'strict'
		};
	}

	return collectionsConfig;
}

function getGenerator(context, config) {
	const eleventyVersion = context.pkg?.dependencies?.['@11ty/eleventy']
		|| context.pkg?.devDependencies?.['@11ty/eleventy']
		|| '';

	return {
		name: 'eleventy',
		version: eleventyVersion,
		environment: environment || '',
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': config.markdownItOptions || { html: true }
		}
	};
}

function getPaths(context, config) {
	return {
		uploads: join(config.dir.input, context.cloudcannon?.uploads_dir ?? 'uploads'),
		data: config.dir.data,
		collections: '',
		layouts: config.dir.layouts
	};
}

function getInfo(context, config) {
	const collectionsConfig = getCollectionsConfig(context, config);
	const collections = getCollections(collectionsConfig, context, config);

	return {
		...context.cloudcannon,
		'base-url': (config.pathPrefix === '/' ? '' : config.pathPrefix) || '',
		cloudcannon: {
			name: 'eleventy-plugin-cloudcannon',
			version: version
		},
		collections: collections,
		'collections-config': collectionsConfig,
		data: getData(context),
		generator: getGenerator(context, config),
		paths: getPaths(context, config),
		source: config.dir.input,
		time: new Date().toISOString(),
		version: '0.0.2' // schema version
	};
}

module.exports = {
	isTopPath,
	isStaticPage,
	isPage,
	isUnlisted,
	isIgnoredItemKey,
	processItem,
	jsonifyItems,
	getData,
	guessCollections,
	getCollections,
	getCollectionsConfig,
	getGenerator,
	getPaths,
	getInfo
};
