const pkginfo = require('pkginfo')(module, 'version');
const version = module.exports.version;

// defaultConfig should match the return value from https://www.11ty.dev/docs/config/
module.exports = function (eleventyConfig, defaultConfig = {}) {
	const config = {
		pathPrefix: defaultConfig.pathPrefix ?? '/',
		markdownItOptions: defaultConfig.markdownOptions ?? { html: true },
		dir: {
			input: defaultConfig.dir?.input ?? '.',
			data: defaultConfig.dir?.data ?? '_data', // relative to input
			includes: defaultConfig.dir?.includes ?? '_includes', // relative to input
			layouts: defaultConfig.dir?.layouts ?? '_includes', // relative to input
		}
	}

	eleventyConfig.addNunjucksShortcode('ccPath', (key) => (config.dir[key] ?? '').replace(/^\.\/?/, ''));
	eleventyConfig.addNunjucksShortcode('ccConfig', (key) => JSON.stringify(config[key] ?? ''));
	eleventyConfig.addNunjucksShortcode('ccVersion', () => version);
	eleventyConfig.addFilter('ccJsonify', (obj) => {
		try {
			return JSON.stringify(obj);
		} catch {
			console.warn('eleventy-plugin-cloudcannon: failed to JSON.stringify');
		}

		return null;
	});
};
