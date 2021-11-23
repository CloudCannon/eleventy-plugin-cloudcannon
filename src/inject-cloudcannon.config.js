const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

let defaultConfig;

try {
	defaultConfig = require('./default-eleventy.config.js');
} catch (e) {
	console.error('⚠️ Unable to require your config from eleventy-plugin-cloudcannon.');
	console.error(e);
}

// Used when the 'Manage eleventy-plugin-cloudcannon manually' option is disabled in CloudCannon.
// Adds this plugin after running the renamed default config file.
module.exports = function (eleventyConfig, ...args) {
	console.log('💉 Injecting eleventy-plugin-cloudcannon');
	const config = defaultConfig?.apply?.(this, [eleventyConfig, ...args]);
	console.log('🆗 Processed existing configuration');
	eleventyConfig.addPlugin(pluginCloudCannon, eleventyConfig.cloudcannonOptions || config || {});
	console.log('🎉 Injected eleventy-plugin-cloudcannon!');
	return config;
};
