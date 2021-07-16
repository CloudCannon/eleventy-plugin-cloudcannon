const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

// Used when the 'Manage eleventy-plugin-cloudcannon manually' option is disabled in CloudCannon.
// Adds this plugin after running the renamed default config file.
module.exports = function (eleventyConfig, ...args) {
	let defaultConfig;

	try {
		defaultConfig = require('./default-eleventy.config.js');
	} catch {
		console.error('Not found: ./default-eleventy.config.js');
	}

	const config = defaultConfig?.apply?.(this, [eleventyConfig, ...args]) ?? {};
	eleventyConfig.addPlugin(pluginCloudCannon, eleventyConfig.cloudcannonOptions ?? config);
	return config;
};
