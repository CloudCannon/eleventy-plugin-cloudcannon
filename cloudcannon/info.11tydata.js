const { dirname, basename } = require('path');

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

	processItem: function (item, tag) {
		return {
			...item.template.frontMatter.data,
			path: item.inputPath?.replace('./', '') ?? '',
			url: item.url ?? '',
			collection: tag,
			layout: item.template._layoutKey,
			_unlisted: isUnlisted(item) ?? undefined,
			output: item.url !== false
		};
	},

	getCollectionsConfig: function (collections, cloudcannon) {
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
			// Finds the top-most common basePaths to prevent sub-folders becoming separate entries
			const topBasePaths = Array.from(collectionsMeta[key].basePaths).filter(isTopPath);

			// Consider a collection output if more items are output than not
			const isOutput = collectionsMeta[key].outputOffset > 0;

			topBasePaths.forEach((basePath) => {
				// Multiple collections can share this basePath, but this should cover common use-cases
				memo[topBasePaths.length === 1 ? key : basePath] = {
					path: basePath,
					output: isOutput
				};
			});

			return memo;
		}, {});
	}
};
