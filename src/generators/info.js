const { getData } = require('./data.js');
const { getGenerator } = require('./generator.js');
const { getCollections, getCollectionsConfig } = require('./collections.js');
const { bold, yellow } = require('ansi-colors');
const { log } = require('../util/logger.js');
require('pkginfo')(module, 'name', 'version');

function cheapPlural(amount, str) {
	const amountStr = amount === 0 ? 'no' : amount;
	return `${amountStr} ${str}${amount === 1 ? '' : 's'}`;
}

const cloudcannon = {
	name: module.exports.name,
	version: module.exports.version,
};

async function getInfo(context, config) {
	const collectionsConfig = getCollectionsConfig(context, config);
	const collections = await getCollections(collectionsConfig, context, config);

	Object.keys(collectionsConfig).forEach((collectionKey) => {
		if (collections[collectionKey]?.length) {
			const filesCount = cheapPlural(collections[collectionKey].length, 'file');
			log(`📁 Processed ${bold(collectionKey)} collection with ${filesCount}`);
		} else if (collectionsConfig[collectionKey].auto_discovered) {
			log(`📂 ${yellow('Ignored')} ${bold(collectionKey)} collection`);
			delete collectionsConfig[collectionKey];
		} else {
			log(`📁 Processed ${bold(collectionKey)} collection`);
		}
	});

	return {
		...config,
		cloudcannon,
		collections,
		collections_config: collectionsConfig,
		data: getData(context, config),
		generator: getGenerator(context, config),
		time: new Date().toISOString(),
		version: '0.0.3', // schema version
	};
}

module.exports = {
	getInfo,
};
