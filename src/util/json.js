const { configure } = require('safe-stable-stringify');

const stringify = configure({ deterministic: false });

function replacer(_key, value) {
	const isPage =
		value &&
		typeof value === 'object' &&
		Object.hasOwn(value, 'template') &&
		Object.hasOwn(value, 'inputPath') &&
		Object.hasOwn(value, 'fileSlug') &&
		Object.hasOwn(value, 'filePathStem') &&
		Object.hasOwn(value, 'data') &&
		Object.hasOwn(value, 'templateContent');

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
	stringifyJson,
};
