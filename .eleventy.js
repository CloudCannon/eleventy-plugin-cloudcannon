const pkginfo = require('pkginfo')(module, 'version');
const safeStringify = require('fast-safe-stringify');

const version = module.exports.version;
const time = new Date().toISOString();

// defaultConfig should match the return value from https://www.11ty.dev/docs/config/
module.exports = function (eleventyConfig, defaultConfig = {}) {
	const config = {
		pathPrefix: defaultConfig.pathPrefix ?? '/',
		markdownItOptions: defaultConfig.markdownOptions ?? { html: true },
		dir: {
			input: defaultConfig.dir?.input ?? '.',
			data: defaultConfig.dir?.data ?? '_data', // relative to input
			pages: defaultConfig.dir?.pages ?? '', // relative to input
			includes: defaultConfig.dir?.includes ?? '_includes', // relative to input
			layouts: defaultConfig.dir?.layouts ?? '_includes', // relative to input
		}
	};

	const jsonify = (obj, fallback) => {
		try {
			return safeStringify(obj);
		} catch (e) {
			console.warn('eleventy-plugin-cloudcannon failed to jsonify:', e, obj);
		}

		return fallback;
	};

	eleventyConfig.addNunjucksShortcode('ccTime', () => time);
	eleventyConfig.addNunjucksShortcode('ccPath', (key) => (config.dir[key] ?? '').replace(/^\.\/?/, ''));
	eleventyConfig.addNunjucksShortcode('ccVersion', () => version);
	eleventyConfig.addNunjucksShortcode('ccConfig', (key) => jsonify(config[key] || ''));
	eleventyConfig.addFilter('ccJsonify', jsonify);
};
