const { bold } = require('ansi-colors');
const { log } = require('../util/logger.js');

function getData(context, config) {
	const dataConfig = config.data_config || {};

	return Object.keys(dataConfig).reduce((memo, key) => {
		if (dataConfig[key] === true) {
			memo[key] = context[key] ?? {};
			log(`💾 Processed ${bold(key)} data set`);
		}

		return memo;
	}, {});
}

module.exports = {
	getData
};
