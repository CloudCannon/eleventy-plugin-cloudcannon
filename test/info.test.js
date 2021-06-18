const info = require('../cloudcannon/info.11tydata.js');

// Simulates the context when running Eleventy
const boundGetData = info.getData.bind({
	ctx: {
		things: ['a', 'b', 'c'],
		nope: { hello: 'there' }
	}
});

const collectionItem = {
	inputPath: './staff/pete.html',
	url: '/staff/pete/',
	template: { _layoutKey: 'abc' },
	data: { tags: ['staff'] }
};

const nonOutputCollectionItem = {
	...collectionItem,
	inputPath: './staff/accounting/angela.html',
	url: false
};

const outsideCollectionItem = {
	...collectionItem,
	inputPath: './nested/authors/jane.html',
	url: '/staff/jane/'
};

const staticPage = {
	inputPath: './static.html',
	url: '/static/',
	template: { _layoutKey: null },
	data: {}
};

const page = {
	data: { tags: [] },
	inputPath: './page.html',
	url: '/page/',
	template: {
		_layoutKey: 'abc',
		frontMatter: {
			data: {
				title: 'Hi there'
			}
		}
	}
};

const unlistedPage = {
	...page,
	data: { _unlisted: true }
};

const nonOutputPage = {
	...page,
	url: false
};

const expectedProcessedPage = {
	title: 'Hi there',
	path: 'page.html',
	url: '/page/',
	collection: 'tag',
	layout: 'abc',
	_unlisted: false,
	output: true
};

// -----
// Tests

test('gets static pages', () => {
  const collections = { all: [page, collectionItem, staticPage] };
  expect(info.getStaticPages(collections)).toEqual([staticPage]);
});

test('gets pages', () => {
	const collections = { all: [page, collectionItem, staticPage] };
  expect(info.getPages(collections)).toEqual([page]);
});

test('gets collections', () => {
	const collections = {
		all: [page, collectionItem, staticPage],
		staff: [collectionItem]
	};

  expect(info.getCollections(collections)).toEqual({
  	staff: [collectionItem]
  });
});

test('gets data', () => {
	const cloudcannon = {
		data: {
			things: true,
			stuff: true,
			nope: false
		}
	};

  expect(boundGetData(cloudcannon)).toEqual({
		things: ['a', 'b', 'c'],
		stuff: {}
  });
});

test('get no data', () => {
  expect(boundGetData()).toEqual({});
});

test('processes item', () => {
  expect(info.processItem(page, 'tag')).toEqual(expectedProcessedPage);
});

test('processes unlisted item', () => {
  expect(info.processItem(unlistedPage, 'tag')).toEqual({
  	...expectedProcessedPage,
  	_unlisted: true
  });
});

test('processes non output item', () => {
  expect(info.processItem(nonOutputPage, 'tag')).toEqual({
  	...expectedProcessedPage,
  	url: '',
  	output: false
  });
});

test('gets collections config', () => {
	const collections = {
		all: [page, collectionItem, staticPage],
		staff: [collectionItem]
	};

  expect(info.getCollectionsConfig(collections)).toEqual({
  	staff: {
  		output: true,
  		path: 'staff'
  	}
  });
});

test('gets complex collections config', () => {
	const collections = {
		all: [page, collectionItem, nonOutputCollectionItem, outsideCollectionItem, staticPage],
		staff: [collectionItem, nonOutputCollectionItem, outsideCollectionItem]
	};

  expect(info.getCollectionsConfig(collections, undefined, '_data')).toEqual({
  	'nested/authors': {
  		output: true,
  		path: 'nested/authors'
  	},
  	staff: {
  		output: true,
  		path: 'staff'
  	},
  	data: {
  		output: false,
  		path: '_data'
  	}
  });
});

test('gets custom collections config', () => {
	const collections = {
		all: [page, collectionItem, staticPage],
		staff: [collectionItem]
	};

	const cloudcannon = {
		collections: {
			anything: 'here'
		}
	};

  expect(info.getCollectionsConfig(collections, cloudcannon)).toEqual({
		anything: 'here'
	});
});
