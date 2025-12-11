const { dirname, basename, extname } = require('node:path');
const isEqual = require('lodash.isequal');
const { getSourcePath } = require('../util/paths.js');

function isStaticPage(item) {
	return (
		item.template &&
		!item.template?._layoutKey &&
		!item.data?.tags?.length &&
		extname(item.inputPath || '') === '.html'
	);
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
	page: true,
	pkg: true,
	eleventy: true,
};

function isIgnoredItemKey(item, key, globalData) {
	return IGNORED_ITEM_KEYS[key] || isEqual(globalData?.[key], item.data?.[key]);
}

async function processItem(item, collectionKey, source) {
	if (!item.inputPath) {
		return;
	}

	const data = item.data || {};
	const globalData = await item.template?.templateData?.globalData;

	const combinedData = Object.keys(data).reduce((memo, key) => {
		if (!isIgnoredItemKey(item, key, globalData)) {
			memo[key] = data[key];
		}

		return memo;
	}, {});

	const processed = {
		...combinedData,
		path: getSourcePath(item.inputPath, source),
		url: item.url || '',
		output: item.url !== false,
	};

	if (Object.getOwnPropertyDescriptor(item, 'fileSlug')) {
		processed.fileSlug = item.fileSlug;
	}

	if (Object.getOwnPropertyDescriptor(item, 'filePathStem')) {
		processed.filePathStem = item.filePathStem;
	}

	if (collectionKey) {
		processed.collection = collectionKey;
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
	processItem,
};
