const { dirname, basename } = require('path');

function isStaticPage(item) {
	return !item.template._layoutKey && (!item.data.tags || !item.data.tags.length)
}

function isPage(item) {
	return item.template._layoutKey && (!item.data.tags || !item.data.tags.length)
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
			path: item.inputPath ? item.inputPath.replace('./', '') : '',
			url: item.url || '',
			collection: tag,
			layout: item.template._layoutKey,
			_unlisted: isUnlisted(item) || undefined,
			output: item.url !== false
		};
	}
};
