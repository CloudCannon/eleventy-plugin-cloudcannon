const { readdirSync } = require('fs');
const { dirname, join } = require('path');
const { bold } = require('ansi-colors');
const { log } = require('../util/logger.js');
const { stringifyJson } = require('../util/json.js');
const { getSourcePath, isTopPath } = require('../util/paths.js');
const { isStaticPage, isPage, hasPages, processItem } = require('../util/items.js');

// Tests stringify individually to avoid one item breaking it
async function processCollectionItem(item, collectionKey, config) {
	const processed = await processItem(item, collectionKey, config.source);
	const stringified = stringifyJson(processed);

	if (stringified !== undefined) {
		return JSON.parse(stringified);
	}

	log(`⚠️ ${bold(item?.inputPath || 'unknown file')} skipped due to JSON stringify failing`);
}

function hasDataFiles(dataPath) {
	try {
		// TODO check for editable files rather than anything here
		return readdirSync(dataPath)?.length > 0;
	} catch {
		return false;
	}
}

function getCollectionKey(item, collectionsConfig, config) {
	const sourcePath = getSourcePath(item?.inputPath, config.source) || '';
	const parts = sourcePath.split('/');

	// Find collection from config based on explicit path
	for (let i = parts.length - 1; i >= 0; i--) {
		const collectionPath = parts.slice(0, i).join('/');

		const configKey = Object.keys(collectionsConfig || {}).find((key) => {
			return collectionsConfig[key]?.path === collectionPath;
		});

		if (configKey) {
			return configKey;
		}
	}

	if (isPage(item) || isStaticPage(item)) {
		return 'pages';
	}
}

async function getCollections(collectionsConfig, context, config) {
	return await context.collections.all.reduce(async (memo, item) => {
		const collectionKey = getCollectionKey(item, collectionsConfig, config);

		if (!collectionKey) {
			log(`⚠️ No collection for ${bold(item?.inputPath || 'unknown file')}`);
			return memo;
		}

		const processed = await processCollectionItem(item, collectionKey, config);

		memo = await memo;
		memo[collectionKey] = memo[collectionKey] || [];
		memo[collectionKey].push(processed);

		return memo;
	}, {});
}

function discoverCollectionsConfig(context, config) {
	const discovered = context.collections.all.reduce((memo, item) => {
		const tag = item.data?.tags?.[0];

		if (tag && item.inputPath) {
			memo[tag] = memo[tag] ?? { basePaths: new Set(), outputOffset: 0 };
			// Map tags to basePaths, items with same tags can exist in separate folders
			const sourcePath = getSourcePath(item.inputPath, config.source);
			memo[tag].basePaths.add(dirname(sourcePath));
			// Tracks how many collection items are output
			memo[tag].outputOffset += item.url === false ? -1 : 1;
		}

		return memo;
	}, {});

	return Object.keys(discovered).reduce((memo, tag) => {
		// Finds the top-most common basePaths to prevent sub-folders becoming separate entries
		const topBasePaths = Array.from(discovered[tag].basePaths).filter(isTopPath);

		// Consider a collection output unless more items are not output
		const isOutput = discovered[tag].outputOffset >= 0;

		topBasePaths.forEach((basePath) => {
			// Finds the existing key for this base path, or creates one
			// If multiple discovered collections use the same base path, the first one processed is used
			const collectionKey = Object.keys(memo).find((k) => memo[k].path === basePath)
				// Use the tag as the collection key if the files are all in one base path
				|| (topBasePaths.length === 1 ? tag : basePath);

			const existingPath = memo[collectionKey]?.path;
			const autoDiscovered = !existingPath && existingPath !== '';

			if (autoDiscovered) {
				log(`🔍 Discovered ${bold(collectionKey)} collection`);
			}

			memo[collectionKey] = {
				path: basePath,
				output: isOutput,
				auto_discovered: autoDiscovered,
				...memo[collectionKey]
			};
		});

		return memo;
	}, { ...config.collections_config });
}

function getCollectionsConfig(context, config) {
	if (config.collections_config_override) {
		return config.collections_config || {};
	}

	const collectionsConfig = discoverCollectionsConfig(context, config);

	if (hasDataFiles(join(config.source, config.paths.data))) {
		collectionsConfig.data = {
			path: config.paths.data,
			output: false,
			auto_discovered: false, // Ensures this stays in collections_config
			...collectionsConfig?.data
		};
	}

	if (hasPages(context.collections.all)) {
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

module.exports = {
	getCollections,
	getCollectionsConfig
};
