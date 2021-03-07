function isStaticPage(item) {
	return !item.template._layoutKey && (!item.data.tags || !item.data.tags.length)
}

function isPage(item) {
	return item.template._layoutKey && (!item.data.tags || !item.data.tags.length)
}

module.exports = {
	environment: process.env.ELEVENTY_ENV,

	getStaticPages: function () {
		return this.ctx.collections.all.filter(isStaticPage);
	},

	getPages: function () {
		return this.ctx.collections.all.filter(isPage);
	},

	getCollections: function () {
		const { all, ...collections } = this.ctx.collections;
		return collections;
	}
};
