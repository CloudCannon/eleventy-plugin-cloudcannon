import { relative } from 'path';
import { cosmiconfig } from 'cosmiconfig';
import chalk from 'chalk';

async function readFile(configPath) {
	const moduleName = 'cloudcannon';
	const explorer = cosmiconfig(moduleName, {
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
			? await explorer.load(configPath)
			: await explorer.search();

		if (config) {
			const relativeConfigPath = relative(process.cwd(), config.filepath);
			console.log(`⚙️ Using config file at ${chalk.bold(relativeConfigPath)}`);
			return config.config || {};
		}
	} catch (e) {
		if (e.code === 'ENOENT') {
			console.log(`⚠️ ${chalk.red('No config file found at')} ${chalk.red.bold(configPath)}`);
			return false;
		} else {
			console.log(`⚠️ ${chalk.red('Error reading config file')}`, 'error');
			throw e;
		}
	}

	console.log('⚙️ No config file found');
	return false;
}

function getLegacyCollectionsConfig(legacy) {
	const collections = legacy.collections || {};

	return Object.keys(collections).reduce((memo, key) => {
		const value = collections[key];

		const collectionConfig = {
			...value,
			sort_key: value.sort_key ?? value._sort_key,
			subtext_key: value.subtext_key ?? value._subtext_key,
			image_key: value.image_key ?? value._image_key,
			image_size: value.image_size ?? value._image_size,
			singular_name: value.singular_name ?? value._singular_name,
			singular_key: value.singular_key ?? value._singular_key,
			disable_add: value.disable_add ?? value._disable_add,
			icon: value.icon ?? value._icon,
			add_options: value.add_options ?? value._add_options
		};

		return { ...memo, [key]: collectionConfig };
	}, {});
}

function readConfig(context, options) {
	const legacy = context.cloudcannon || {};
	const file = readFile() || {};

	const baseUrl = file.base_url || options.pathPrefix || '';

	return {
		...legacy,
		...file,
		base_url: baseUrl === '/' ? '' : baseUrl,
		data_config: file.data_config ?? legacy.data,
		collections_config: file.collections_config ?? getLegacyCollectionsConfig(legacy),
		collection_groups: file.collection_groups ?? legacy._collection_groups,
		editor: file.editor ?? legacy._editor,
		source_editor: file.source_editor ?? legacy._source_editor,
		source: file.source || options.dir.input || '',
		paths: {
			...file.paths,
			static: file.paths?.static || '',
			uploads: (file.paths?.uploads ?? legacy.uploads_dir) || 'uploads',
			data: file.paths?.data || options.dir.data || '_data',
			collections: '',
			layouts: file.paths?.layouts || options.dir.layouts || '_includes'
		}
	};
}

module.exports = {
	readConfig
};
