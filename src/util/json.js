const { configure } = require('safe-stable-stringify');

const stringify = configure({ deterministic: false });

function replacer(key, value) {
	const isNotPage = !value
		|| typeof value !== 'object'
		|| !Object.prototype.hasOwnProperty.call(value, 'template')
		|| !Object.prototype.hasOwnProperty.call(value, 'inputPath')
		|| !Object.prototype.hasOwnProperty.call(value, 'fileSlug')
		|| !Object.prototype.hasOwnProperty.call(value, 'filePathStem')
		|| !Object.prototype.hasOwnProperty.call(value, 'data')
		|| !Object.prototype.hasOwnProperty.call(value, 'templateContent');

	return isNotPage ? value : '[FILTERED]';
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
