const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

// Intended for use with the CLI option: --config=inject-cloudcannon.config.js
// Adds the cloudcannon plugin after running the renamed default config file
module.exports = function (eleventyConfig) {
	let defaultConfig;

	try {
		defaultConfig = require('../default-eleventy.config.js');
	} catch {
		console.error('Failed to load default-eleventy.config.js');
	}

	const config = defaultConfig?.apply(this, arguments);
	eleventyConfig.addPlugin(pluginCloudCannon, eleventyConfig.cloudcannonOptions ?? config);
	return config;
};
