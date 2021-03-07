const path = require('path');

module.exports = {
	environment: process.env.ELEVENTY_ENV,

	getCollections: function (cloudcannon) {
		if (cloudcannon && cloudcannon.collections) {
			return cloudcannon.collections;
		}

		const { all, ...collections } = this.ctx.collections;
		const keys = Object.keys(collections);

		// Maps tags to basePaths, since items with same tags can exist in separate folders
		const basePaths = all.reduce((memo, item) => {
			const tag = (item.data.tags || [])[0];

			if (tag) {
				memo[tag] = memo[tag] || new Set();
				memo[tag].add(path.dirname(item.inputPath.replace('./', '')));
			}

			return memo;
		}, {});

		// Creates a collection entry for each basePath defined for a tag
		// TODO: use the top-most common basePath to prevent subfolders becoming separate entries
		return keys.reduce((memo, key) => {
			basePaths[key].forEach((basePath) => {
				memo[key] = {
					_path: basePath,
					output: true // TODO
				};
			});

			return memo;
		}, {});
	}
};
