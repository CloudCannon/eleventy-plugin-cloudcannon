const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.setDataDeepMerge(true);

	eleventyConfig.addCollection('postsWithAuthor', (collectionApi) => {
		const authors = collectionApi.getFilteredByTag('authors');

		return collectionApi.getFilteredByTag('posts').map((post) => {
			post.data.authorItem = authors.find((author) => author.inputPath === `./src${post.data.author}`);
			return post;
		});
	});

	const options = {
		dir: {
			input: 'src',
			pages: 'pages'
		}
	};

	eleventyConfig.addPlugin(pluginCloudCannon, options);

	return options;
};
