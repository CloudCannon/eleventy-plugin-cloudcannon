const { dirname, basename, extname } = require('path');
const isEqual = require('lodash.isequal');
const { getSourcePath } = require('../util/paths.js');

function isStaticPage(item) {
	return item.template
		&& !item.template?._layoutKey
		&& !item.data?.tags?.length
		&& extname(item.inputPath || '') === '.html';
}

function isPage(item) {
	return item.template?._layoutKey && !item.data?.tags?.length;
}

function hasPages(all) {
	return all.some((item) => isPage(item) || isStaticPage(item));
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

module.exports = {
	isStaticPage,
	isPage,
	hasPages,
	processItem
};
