const { dirname, basename } = require('path');
const isEqual = require('lodash.isequal');

function isTopPath(basePath, index, basePaths) {
	return !basePaths.some((other) => other !== basePath && basePath.startsWith(`${other}/`));
}

function isStaticPage(item) {
	return !item.template._layoutKey && !item.data.tags?.length;
}

function isPage(item) {
	return item.template._layoutKey && !item.data.tags?.length;
}

function isUnlisted(item) {
	if (item.data._unlisted === true) {
		return true;
	}

	const parentFolder = basename(dirname(item.inputPath));
	const filename = basename(item.inputPath);
	return filename.startsWith(`${parentFolder}.`);
}

const IGNORED_ITEM_KEYS = {
	pagination: true,
	collections: true,
	page: true
};

function isIgnoredItemKey(item, key) {
	return IGNORED_ITEM_KEYS[key]
		|| isEqual(item.template?.templateData?.globalData?.[key], item.data[key]);
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

	processItem: function (item, tag) {
		const combinedData = Object.keys(item.data).reduce((memo, key) => {
			if (!isIgnoredItemKey(item, key)) {
				memo[key] = item.data[key];
			}

			return memo;
		}, {});

		const processed = {
			...combinedData,
			path: item.inputPath.replace(/^\.\//, ''),
			url: item.url || '',
			collection: tag,
			output: item.url !== false
		};

		if (item.template?._layoutKey) {
			processed.layout = item.template._layoutKey;
		}

		if (isUnlisted(item)) {
			processed._unlisted = true;
		}

		return processed;
	},

	getCollectionsConfig: function (collections, cloudcannon, dataPath) {
		if (cloudcannon?.collections) {
			return cloudcannon.collections; // User-defined collections
		}

		const { all, ...otherCollections } = collections;
		const keys = Object.keys(otherCollections);

		const collectionsMeta = all.reduce((memo, item) => {
			const tag = item.data.tags?.[0];

			if (tag) {
				memo[tag] = memo[tag] ?? { basePaths: new Set(), outputOffset: 0 };
				// Map tags to basePaths, items with same tags can exist in separate folders
				memo[tag].basePaths.add(dirname(item.inputPath.replace('./', '')));
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
