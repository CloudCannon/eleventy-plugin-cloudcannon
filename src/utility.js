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

function getSourcePath(inputPath, source) {
	return stripTopPath(normalisePath(inputPath), source).replace(/^\/+/, '');
}

function replacer(key, value) {
	const isPage = value
		&& typeof value === 'object'
		&& Object.prototype.hasOwnProperty.call(value, 'template')
		&& Object.prototype.hasOwnProperty.call(value, 'inputPath')
		&& Object.prototype.hasOwnProperty.call(value, 'fileSlug')
		&& Object.prototype.hasOwnProperty.call(value, 'filePathStem')
		&& Object.prototype.hasOwnProperty.call(value, 'data')
		&& Object.prototype.hasOwnProperty.call(value, 'date')
		&& Object.prototype.hasOwnProperty.call(value, 'outputPath')
		&& Object.prototype.hasOwnProperty.call(value, 'url')
		&& Object.prototype.hasOwnProperty.call(value, 'templateContent')
		&& Object.prototype.hasOwnProperty.call(value, '_templateContent');

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
	getSourcePath,
	stringifyJson
};
