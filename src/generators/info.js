const { getData } = require('./data.js');
const { getGenerator } = require('./generator.js');
const { getCollections, getCollectionsConfig } = require('./collections.js');
require('pkginfo')(module, 'name', 'version');

const cloudcannon = {
	name: module.exports.name,
	version: module.exports.version
};

function getInfo(context, config) {
	const collectionsConfig = getCollectionsConfig(context, config);
	const collections = getCollections(collectionsConfig, context, config);

	return {
		...config,
		cloudcannon: cloudcannon,
		collections: collections,
		collections_config: collectionsConfig,
		data: getData(context, config),
		generator: getGenerator(context, config),
		time: new Date().toISOString(),
		version: '0.0.3' // schema version
	};
}

module.exports = {
	getInfo
};
