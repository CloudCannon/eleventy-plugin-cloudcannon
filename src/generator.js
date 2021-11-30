const { dirname, basename, extname } = require('path');
const isEqual = require('lodash.isequal');
const { getSourcePath, stringifyJson } = require('./utility.js');
require('pkginfo')(module, 'name', 'version');

const environment = process.env.ELEVENTY_ENV || '';

const cloudcannon = {
	name: module.exports.name,
	version: module.exports.version
};

function isTopPath(basePath, index, basePaths) {
	return !basePaths.some((other) => other !== basePath && basePath.startsWith(`${other}/`));
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

// Tests stringify individually to avoid one item breaking it
function processItems(items, tag, config) {
	return items?.reduce?.((memo, item) => {
		const processed = processItem(item, tag, config.source);
		const stringified = stringifyJson(processed);

		if (stringified !== undefined) {
			memo.push(JSON.parse(stringified));
		}

		return memo;
	}, []) || [];
}

function getData(context, config) {
	const dataConfig = config.data_config || {};

	return Object.keys(dataConfig).reduce((memo, key) => {
		if (dataConfig[key] === true) {
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
			const inputPath = getSourcePath(item.inputPath, config.source);
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
		otherCollections.pages = all.filter((item) => isPage(item) || isStaticPage(item));
	}

	return Object.keys(collectionsConfig).reduce((memo, collectionKey) => {
		const items = otherCollections[collectionKey];

		if (items?.length) {
			memo[collectionKey] = processItems(items, collectionKey, config);
		} else {
			console.log('Ignoring collection', collectionKey);
			delete collectionsConfig[collectionKey];
		}

		return memo;
	}, {});
}

function getCollectionsConfig(context, config) {
	if (config.collections_config_override) {
		return config.collections_config || {}; // User-defined collections
	}

	const { all, ...otherCollections } = context.collections;
	const guessedCollections = guessCollections(all, config);

	const collectionsConfig = {
		data: {
			path: config.paths.data,
			output: false,
			auto_discovered: !config.collections_config?.data,
			...config.collections_config?.data
		},
		...config.collections_config
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
			const collectionKey = topBasePaths.length === 1 ? key : basePath;
			const customPath = collectionsConfig[collectionKey]?.path;

			collectionsConfig[collectionKey] = {
				path: basePath,
				output: isOutput,
				auto_discovered: !customPath && customPath !== '',
				...collectionsConfig[collectionKey]
			};
		});
	});

	const hasPages = all.some((item) => isPage(item) || isStaticPage(item));
	if (hasPages) {
		const pagesPath = collectionsConfig.pages?.path;
		// Add collection for pages without collection
		collectionsConfig.pages = {
			path: pagesPath || config.paths.pages || '',
			output: true,
			filter: 'strict',
			auto_discovered: !pagesPath && pagesPath !== '',
			...collectionsConfig.pages
		};
	}

	return collectionsConfig;
}

function getGenerator(context, config, options) {
	const eleventyVersion = context.pkg?.dependencies?.['@11ty/eleventy']
		|| context.pkg?.devDependencies?.['@11ty/eleventy']
		|| '';

	return {
		name: 'eleventy',
		version: eleventyVersion,
		environment: environment || '',
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': options?.markdownItOptions || { html: true }
		}
	};
}

function getInfo(context, config, options) {
	const collectionsConfig = getCollectionsConfig(context, config);
	const collections = getCollections(collectionsConfig, context, config);

	return {
		...config,
		cloudcannon: cloudcannon,
		collections: collections,
		collections_config: collectionsConfig,
		data: getData(context, config),
		generator: getGenerator(context, config, options),
		time: new Date().toISOString(),
		version: '0.0.3' // schema version
	};
}

module.exports = {
	isStaticPage,
	isPage,
	processItem,
	getData,
	getCollections,
	getCollectionsConfig,
	getGenerator,
	getInfo
};
