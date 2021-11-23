const { mkdirSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');
const { getInfo } = require('./src/generator.js');
const { readConfig } = require('./src/config.js');
const { normalisePath, stringifyJson } = require('./src/utility.js');

const input = process.env.CC_ELEVENTY_INPUT || '';

const infoTemplate = `---
eleventyExcludeFromCollections: true
permalink: /_cloudcannon/info.json
layout: null
---
{% ccInfo %}
`;

// defaultOptions should match the return value from https://www.11ty.dev/docs/config/
module.exports = function (eleventyConfig, defaultOptions) {
	const options = {
		pathPrefix: normalisePath(defaultOptions?.pathPrefix || '/'),
		markdownItOptions: defaultOptions?.markdownItOptions || { html: true },
		dir: {
			input: normalisePath(input || defaultOptions?.dir?.input || '.'),
			pages: normalisePath(defaultOptions?.dir?.pages || ''), // relative to input
			data: normalisePath(defaultOptions?.dir?.data || '_data'), // relative to input
			layouts: normalisePath(defaultOptions?.dir?.layouts || '_includes') // relative to input
		}
	};

	// Create the template file for Eleventy to process and call the ccInfo tag
	const templatePath = join(options.dir.input, 'cloudcannon/info.liquid');
	mkdirSync(dirname(templatePath), { recursive: true });
	writeFileSync(templatePath, infoTemplate);

	eleventyConfig.addLiquidTag('ccInfo', function (liquidEngine) {
		return {
			parse: function () {},
			render: function (ctx) {
				const context = ctx.getAll();
				const config = readConfig(context, options);
				const info = getInfo(context, config, options);
				return stringifyJson(info);
			}
		};
	});
};
