function getGenerator(context, config) {
	const eleventyVersion = context.pkg?.dependencies?.['@11ty/eleventy']
		|| context.pkg?.devDependencies?.['@11ty/eleventy']
		|| '';

	return {
		name: 'eleventy',
		version: eleventyVersion,
		environment: process.env.ELEVENTY_ENV || '',
		...config.generator,
		metadata: {
			markdown: 'markdown-it',
			'markdown-it': { html: true },
			...config.generator?.metadata
		},
	};
}

module.exports = {
	getGenerator
};
