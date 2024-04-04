const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

// The build process in CloudCannon sets these:
const eleventyVersion = process.env.CC_ELEVENTY_VERSION; // Version of 11ty/eleventy installed
const defaultConfigPath = process.env.CC_ELEVENTY_CONFIG; // Where the site's config was moved

// Supports @11ty/eleventy v0, v1, v2
function configOld(eleventyConfig) {
	if (!defaultConfigPath) {
		console.log('ℹ️ Not installing eleventy-plugin-cloudcannon (legacy): no site config');
		return eleventyConfig;
	}

	console.log('ℹ️ Installing eleventy-plugin-cloudcannon (legacy)...');

	let defaultConfig;
	try {
		defaultConfig = require(defaultConfigPath);
	} catch (e) {
		console.error('⚠️ Unable to require your config from eleventy-plugin-cloudcannon (legacy).');
		console.error(e);
		throw e;
	}

	const config = defaultConfig?.call?.(this, eleventyConfig);
	console.log('ℹ️ Adding eleventy-plugin-cloudcannon (legacy)...');

	eleventyConfig.addPlugin(pluginCloudCannon, config);
	console.log('🆗 Installed eleventy-plugin-cloudcannon (legacy)!');

	return config;
}

// Supports @11ty/eleventy v3
async function config(eleventyConfig) {
	if (!defaultConfigPath) {
		console.log('ℹ️ Not installing eleventy-plugin-cloudcannon: no site config');
		return eleventyConfig;
	}

	console.log('ℹ️ Installing eleventy-plugin-cloudcannon...');

	let defaultConfig;
	try {
		const defaultConfigImport = await import(defaultConfigPath);
		defaultConfig = defaultConfigImport?.default || defaultConfigImport;
	} catch (e) {
		console.error('⚠️ Unable to require your config from eleventy-plugin-cloudcannon.');
		console.error(e);
		throw e;
	}

	const config = await defaultConfig?.call?.(this, eleventyConfig);
	console.log('ℹ️ Adding eleventy-plugin-cloudcannon...');

	eleventyConfig.addPlugin(pluginCloudCannon, config);
	console.log('🆗 Installed eleventy-plugin-cloudcannon!');

	return config;
}

module.exports = eleventyVersion?.match(/^[0|1|2]\./) ? configOld : config;
