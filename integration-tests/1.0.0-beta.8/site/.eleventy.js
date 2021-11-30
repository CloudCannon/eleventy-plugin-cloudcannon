const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginCloudCannon);

	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.setDataDeepMerge(true);

	eleventyConfig.setFrontMatterParsingOptions({
		excerpt: function (file, options) {
			file.excerpt = file.content.split('\n').slice(1, 2).join(' ');
		}
	});

	eleventyConfig.addCollection('nav', function (collectionApi) {
		return collectionApi.getAll()
			.filter((page) => page.data.show_in_navigation === true)
			.sort((a, b) => a.data.navigation_order - b.data.navigation_order);
	});


	eleventyConfig.addFilter('postDate', (date) => date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
	eleventyConfig.addFilter('jsonify', (obj) => obj ? JSON.stringify(obj) : null);
	eleventyConfig.addFilter('getCollectionItemBySlug', (collection, slug) => collection.find((item) => slug === item.fileSlug));

	eleventyConfig.cloudcannonOptions = {
		dir: {
			pages: 'pages'
		}
	};
};
