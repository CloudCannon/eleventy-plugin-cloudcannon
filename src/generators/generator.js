function getGenerator(context, options) {
	const eleventyVersion = context.pkg?.dependencies?.['@11ty/eleventy']
		|| context.pkg?.devDependencies?.['@11ty/eleventy']
		|| '';

	return {
		name: 'eleventy',
		version: eleventyVersion,
		environment: process.env.ELEVENTY_ENV || '',
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': options?.markdownItOptions || { html: true }
		}
	};
}

module.exports = {
	getGenerator
};
