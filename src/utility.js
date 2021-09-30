const safeStringify = require('fast-safe-stringify');

function normalisePath(path) {
	return path.replace(/\/+/, '/').replace(/^\.\//, '');
}

function stripTopPath(path, topPath) {
	const normalisedTop = normalisePath(topPath);
	return path.startsWith(normalisedTop) ? path.substring(normalisedTop.length) : path;
}

const stringifyJson = (obj, fallback) => {
	try {
		return safeStringify(obj, undefined, '\t');
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
