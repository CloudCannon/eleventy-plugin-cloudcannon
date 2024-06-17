const { configure } = require('safe-stable-stringify');

const stringify = configure({ deterministic: false });

function replacer(_key, value) {
	const isPage = value
		&& typeof value === 'object'
		&& Object.prototype.hasOwnProperty.call(value, 'template')
		&& Object.prototype.hasOwnProperty.call(value, 'inputPath')
		&& Object.prototype.hasOwnProperty.call(value, 'fileSlug')
		&& Object.prototype.hasOwnProperty.call(value, 'filePathStem')
		&& Object.prototype.hasOwnProperty.call(value, 'data')
		&& Object.prototype.hasOwnProperty.call(value, 'templateContent');

	return isPage ? '[FILTERED]' : value;
}

function stringifyJson(obj, fallback) {
	try {
		return stringify(obj, replacer, '\t');
	} catch (e) {
		console.warn('eleventy-plugin-cloudcannon failed to stringify JSON:', e, obj);
	}

	return fallback;
}

module.exports = {
	stringifyJson
};
