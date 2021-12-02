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
	console.log('ℹ️ Installing eleventy-plugin-cloudcannon...');
	const config = defaultConfig?.apply?.(this, [eleventyConfig, ...args]);
	console.log('ℹ️ Adding eleventy-plugin-cloudcannon...');
	eleventyConfig.addPlugin(pluginCloudCannon, config);
	console.log('🆗 Installed eleventy-plugin-cloudcannon!');
	return config;
};
