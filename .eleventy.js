const pkginfo = require('pkginfo')(module, 'version');
const version = module.exports.version;

module.exports = function (eleventyConfig, config = {}) {
	const paths = {
		data: '_data',
		includes: '_includes',
		layouts: '_includes',
		...config.dir
	};

	eleventyConfig.addFilter('ccJsonify', (obj) => obj ? JSON.stringify(obj) : null);
	eleventyConfig.addNunjucksShortcode('ccConfigPath', (key) => paths[key] || '');
	eleventyConfig.addNunjucksShortcode('ccPathPrefix', () => config.pathPrefix || '');
	eleventyConfig.addNunjucksShortcode('ccInput', () => config.input || '');
	eleventyConfig.addNunjucksShortcode('ccVersion', () => version);
};
