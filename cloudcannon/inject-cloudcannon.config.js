const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

// Intended for use with the CLI option: --config=inject-cloudcannon.config.js
// Adds the cloudcannon plugin after running the renamed default config file
module.exports = function (eleventyConfig, config = {}) {
	let defaultConfig;

	try {
		defaultConfig = require('../default-eleventy.config.js');
	} catch {
		console.error('Failed to load default-eleventy.config.js');
	}

	defaultConfig?.apply(this, arguments);

	const paths = {
		data: '_data',
		includes: '_includes',
		layouts: '_includes',
		...(config.dir ?? {})
	};

	eleventyConfig.addPlugin(pluginCloudCannon);
};
