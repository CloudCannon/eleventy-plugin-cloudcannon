const { getInfo } = require('./src/generator.js');
const { normalisePath, stringifyJson } = require('./src/utility.js');

const input = process.env.CC_ELEVENTY_INPUT || '';

// defaultConfig should match the return value from https://www.11ty.dev/docs/config/
module.exports = function (eleventyConfig, defaultConfig = {}) {
	const config = {
		pathPrefix: normalisePath(defaultConfig.pathPrefix || '/'),
		markdownItOptions: defaultConfig.markdownItOptions || { html: true },
		dir: {
			input: normalisePath(input || defaultConfig.dir?.input || '.'),
			pages: normalisePath(defaultConfig.dir?.pages || ''), // relative to input
			data: normalisePath(defaultConfig.dir?.data || '_data'), // relative to input
			layouts: normalisePath(defaultConfig.dir?.layouts || '_includes') // relative to input
		}
	};

	eleventyConfig.addLiquidTag('ccInfo', function (liquidEngine) {
		return {
			parse: function () {},
			render: function (ctx) {
				const context = ctx.getAll();
				const info = getInfo(context, config);
				return stringifyJson(info);
			}
		};
	});
};
