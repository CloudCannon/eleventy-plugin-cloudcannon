const { relative } = require('path');
const { cosmiconfigSync } = require('cosmiconfig');
const { red, bold } = require('chalk');
const { log } = require('./util/logger.js');

function readFileSync(configPath) {
	const moduleName = 'cloudcannon';
	const explorerSync = cosmiconfigSync(moduleName, {
		searchPlaces: [
			`${moduleName}.config.json`,
			`${moduleName}.config.yaml`,
			`${moduleName}.config.yml`,
			`${moduleName}.config.js`,
			`${moduleName}.config.cjs`
		]
	});

	try {
		const config = configPath
			? explorerSync.load(configPath)
			: explorerSync.search();

		if (config) {
			const relativeConfigPath = relative(process.cwd(), config.filepath);
			log(`⚙️ Using config file at ${bold(relativeConfigPath)}`);
			return config.config || {};
		}
	} catch (e) {
		if (e.code === 'ENOENT') {
			log(`⚠️ ${red('No config file found at')} ${red.bold(configPath)}`);
			return false;
		} else {
			log(`⚠️ ${red('Error reading config file')}`, 'error');
			throw e;
		}
	}

	log('⚙️ No config file found');
	return false;
}

function rewriteKey(object, oldKey, newKey) {
	if (object[oldKey] && !object[newKey]) {
		object[newKey] = object[oldKey];
		delete object[oldKey];
	}
}

function getLegacyConfig(context) {
	const legacy = context.cloudcannon || {};
	rewriteKey(legacy, 'data', 'data_config');

	if (legacy.collections) {
		legacy.collections = Object.keys(legacy.collections).reduce((memo, key) => {
			const collectionConfig = { ...legacy.collections[key] };

			rewriteKey(collectionConfig, '_sort_key', 'sort_key');
			rewriteKey(collectionConfig, '_subtext_key', 'subtext_key');
			rewriteKey(collectionConfig, '_image_key', 'image_key');
			rewriteKey(collectionConfig, '_image_size', 'image_size');
			rewriteKey(collectionConfig, '_singular_name', 'singular_name');
			rewriteKey(collectionConfig, '_singular_key', 'singular_key');
			rewriteKey(collectionConfig, '_disable_add', 'disable_add');
			rewriteKey(collectionConfig, '_icon', 'icon');
			rewriteKey(collectionConfig, '_add_options', 'add_options');

			return { ...memo, [key]: collectionConfig };
		}, {});

		rewriteKey(legacy, 'collections', 'collections_config');
	}

	return legacy;
}

function readConfig(context, options = {}) {
	const legacy = getLegacyConfig(context);
	const file = readFileSync() || {};

	const baseUrl = file.base_url || options.pathPrefix || '';

	const config = {
		...legacy,
		...file,
		base_url: baseUrl === '/' ? '' : baseUrl,
		source: file.source || options.dir?.input || '',
		paths: {
			...file.paths,
			static: file.paths?.static || '',
			uploads: (file.paths?.uploads ?? legacy.uploads_dir) || 'uploads',
			data: file.paths?.data || options.dir?.data || '_data',
			collections: '',
			pages: file.paths?.pages || options.dir?.pages || '',
			layouts: file.paths?.layouts || options.dir?.layouts || '_includes'
		}
	};

	rewriteKey(config, '_source_editor', 'source_editor');
	rewriteKey(config, '_editor', 'editor');
	rewriteKey(config, '_collection_groups', 'collection_groups');

	return config;
}

module.exports = {
	readConfig
};
