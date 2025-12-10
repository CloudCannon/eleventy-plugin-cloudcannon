const assert = require('node:assert');
const { test } = require('node:test');
const { getData } = require('../../src/generators/data.js');

test('gets data', () => {
	const context = {
		things: ['a', 'b', 'c'],
		nope: { hello: 'there' },
	};

	const customConfig = {
		data_config: {
			things: true,
			stuff: true,
			nope: false,
		},
	};

	assert.deepStrictEqual(getData(context, customConfig), {
		things: ['a', 'b', 'c'],
		stuff: {},
	});
});

test('get no data', () => {
	assert.deepStrictEqual(getData({}, {}), {});
});
