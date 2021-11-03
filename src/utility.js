const safeStringify = require('fast-safe-stringify');

function normalisePath(path) {
	return path
		.replace(/\/+/g, '/')
		.replace(/^\.$/, '')
		.replace(/^\.\//g, '');
}

function stripTopPath(path, topPath) {
	const normalisedTop = normalisePath(topPath);
	return path.startsWith(normalisedTop) ? path.substring(normalisedTop.length) : path;
}

function replacer(key, value) {
	const isPage = typeof value === 'object'
		&& value?.hasOwnProperty('template')
		&& value?.hasOwnProperty('inputPath')
		&& value?.hasOwnProperty('fileSlug')
		&& value?.hasOwnProperty('filePathStem')
		&& value?.hasOwnProperty('data')
		&& value?.hasOwnProperty('date')
		&& value?.hasOwnProperty('outputPath')
		&& value?.hasOwnProperty('url')
		&& value?.hasOwnProperty('templateContent')
		&& value?.hasOwnProperty('_templateContent');

	if (isPage) {
		return '[FILTERED]';
	}

	return value;
}

const stringifyJson = (obj, fallback) => {
	try {
		return safeStringify(obj, replacer, '\t');
	} catch (e) {
		console.warn('eleventy-plugin-cloudcannon failed to stringify JSON:', e, obj);
	}

	return fallback;
};

module.exports = {
	normalisePath,
	stripTopPath,
	stringifyJson
};
