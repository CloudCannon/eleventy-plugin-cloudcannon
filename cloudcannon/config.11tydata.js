const path = require('path');

function isTopPath(basePath, index, basePaths) {
	return !basePaths.some((other) => other !== basePath && basePath.startsWith(`${other}/`));
}

module.exports = {
	environment: process.env.ELEVENTY_ENV,

	getCollections: function (collections, cloudcannon) {
		if (cloudcannon && cloudcannon.collections) {
			return cloudcannon.collections; // User-defined collections
		}

		const { all, ...otherCollections } = collections;
		const keys = Object.keys(otherCollections);

		const collectionsMeta = all.reduce((memo, item) => {
			const tag = (item.data.tags || [])[0];

			if (tag) {
				memo[tag] = memo[tag] || { basePaths: new Set(), outputOffset: 0 };
				// Map tags to basePaths, items with same tags can exist in separate folders
				memo[tag].basePaths.add(path.dirname(item.inputPath.replace('./', '')));
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
					_path: basePath,
					output: isOutput
				};
			});

			return memo;
		}, {});
	}
};
