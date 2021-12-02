const { readdirSync } = require('fs');
const { dirname, join } = require('path');
const { bold, yellow } = require('chalk');
const { log } = require('../util/logger.js');
const { stringifyJson } = require('../util/json.js');
const { getSourcePath, isTopPath } = require('../util/paths.js');
const { isStaticPage, isPage, hasPages, processItem } = require('../util/items.js');

function cheapPlural(amount, str) {
	const amountStr = amount === 0 ? 'no' : amount;
	return `${amountStr} ${str}${amount === 1 ? '' : 's'}`;
}

// Tests stringify individually to avoid one item breaking it
function processItems(items, tag, config) {
	return items?.reduce?.((memo, item) => {
		const processed = processItem(item, tag, config.source);
		const stringified = stringifyJson(processed);

		if (stringified === undefined) {
			log(`⚠️ ${bold(item?.inputPath || 'unknown file')} skipped due to JSON stringify failing`);
		} else {
			memo.push(JSON.parse(stringified));
		}

		return memo;
	}, []) || [];
}

function hasDataFiles(dataPath) {
	try {
		// TODO check for editable files rather than anything here
		return readdirSync(dataPath)?.length > 0;
	} catch {
		return false;
	}
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
			const filesCount = cheapPlural(memo[collectionKey].length, 'file');
			log(`📁 Processed ${bold(collectionKey)} collection with ${filesCount}`);
		} else if (collectionsConfig[collectionKey].auto_discovered) {
			log(`📂 ${yellow('Ignored')} ${bold(collectionKey)} collection`);
			delete collectionsConfig[collectionKey];
		} else {
			log(`📁 Processed ${bold(collectionKey)} collection`);
		}

		return memo;
	}, {});
}

function discoverCollectionsConfig(context, config) {
	const { all, ...otherCollections } = context.collections;

	const guessed = all.reduce((memo, item) => {
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

	return Object.keys(guessed).reduce((memo, key) => {
		if (!otherCollections[key]) {
			return memo;
		}

		// Finds the top-most common basePaths to prevent sub-folders becoming separate entries
		const topBasePaths = Array.from(guessed[key].basePaths).filter(isTopPath);

		// Consider a collection output unless more items are not output
		const isOutput = guessed[key].outputOffset >= 0;

		topBasePaths.forEach((basePath) => {
			// Multiple collections can share this basePath, but this should cover common use-cases
			const collectionKey = topBasePaths.length === 1 ? key : basePath;
			const customPath = memo[collectionKey]?.path;

			memo[collectionKey] = {
				path: basePath,
				output: isOutput,
				auto_discovered: !customPath && customPath !== '',
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
