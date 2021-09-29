const { dirname, basename, extname } = require('path');
const isEqual = require('lodash.isequal');
const safeStringify = require('fast-safe-stringify')

const STATIC_PAGE_EXTENSIONS = {
	'.html': true,
	'.htm': true
};

function stripSource(path, source) {
	const sourceNormalised = `${source}/`
		.replace(/\/+/, '/')
		.replace(/^\.\//, '');

	return path
		.replace(/\/+/, '/')
		.replace(/^\.\//, '')
		.replace(sourceNormalised, '');
}

function isTopPath(basePath, index, basePaths) {
	return !basePaths.some((other) => other !== basePath && basePath.startsWith(`${other}/`));
}

function isStaticPage(item) {
	return item.template
		&& !item.template?._layoutKey
		&& !item.data?.tags?.length
		&& STATIC_PAGE_EXTENSIONS[extname(item.inputPath || '')];
}

function isPage(item) {
	return item.template?._layoutKey && !item.data?.tags?.length;
}

function isUnlisted(item, source) {
	if (item.data?._unlisted === true || !item.inputPath) {
		return true;
	}

	const inputPath = stripSource(item.inputPath, source);
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
		path: stripSource(item.inputPath, source),
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

module.exports = {
	environment: process.env.ELEVENTY_ENV,

	getStaticPages: function (collections) {
		return collections.all.filter(isStaticPage);
	},

	getPages: function (collections) {
		return collections.all.filter(isPage);
	},

	getCollections: function (collections) {
		const { all, ...otherCollections } = collections;
		return otherCollections;
	},

	getData: function (cloudcannon) {
		if (!cloudcannon?.data) {
			return {};
		}

		const { ctx } = this;
		return Object.keys(cloudcannon.data).reduce((memo, key) => {
			if (cloudcannon.data[key] === true) {
				memo[key] = ctx[key] ?? {};
			}

			return memo;
		}, {});
	},

	jsonifyItems: function (items, tag) {
		const processedItems = items?.reduce?.((memo, item) => {
			// Stringified individually to avoid one item breaking it
			try {
				const json = safeStringify(processItem(item, tag, this.ctx?.inputPath || '.'));
				memo.push(json);
			} catch (e) {
				console.warn('eleventy-plugin-cloudcannon failed to jsonify item:', e);
			}

			return memo;
		}, []) || [];

		return `[${processedItems.join(',\n')}]`;
	},

	processItem: processItem, // TODO: Remove this after changing test references

	getCollectionsConfig: function (collections, cloudcannon, dataPath) {
		if (cloudcannon?.collections) {
			return cloudcannon.collections; // User-defined collections
		}

		const { all, ...otherCollections } = collections;
		const keys = Object.keys(otherCollections);

		const collectionsMeta = all.reduce((memo, item) => {
			const tag = item.data?.tags?.[0];

			if (tag && item.inputPath) {
				memo[tag] = memo[tag] ?? { basePaths: new Set(), outputOffset: 0 };
				// Map tags to basePaths, items with same tags can exist in separate folders
				const inputPath = stripSource(item.inputPath, this.ctx?.inputPath || '.');
				memo[tag].basePaths.add(dirname(inputPath));
				// Tracks how collection items are output
				memo[tag].outputOffset += item.url === false ? -1 : 1;
			}

			return memo;
		}, {});

		// Creates a collection entry for each top level basePath defined for a tag
		return keys.reduce((memo, key) => {
			if (!collectionsMeta[key]) {
				return memo;
			}

			// Finds the top-most common basePaths to prevent sub-folders becoming separate entries
			const topBasePaths = Array.from(collectionsMeta[key].basePaths).filter(isTopPath);

			// Consider a collection output unless more items are not output
			const isOutput = collectionsMeta[key].outputOffset >= 0;

			topBasePaths.forEach((basePath) => {
				// Multiple collections can share this basePath, but this should cover common use-cases
				memo[topBasePaths.length === 1 ? key : basePath] = {
					path: basePath,
					output: isOutput
				};
			});

			return memo;
		}, dataPath ? { data: { path: dataPath, output: false } } : {});
	}
};
