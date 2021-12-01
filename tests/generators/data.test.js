const test = require('ava');
const { getData } = require('../../src/generators/data.js');

test('gets data', (t) => {
	const context = {
		things: ['a', 'b', 'c'],
		nope: { hello: 'there' },
	};

	const customConfig = {
		data_config: {
			things: true,
			stuff: true,
			nope: false
		}
	};

	t.deepEqual(getData(context, customConfig), {
		things: ['a', 'b', 'c'],
		stuff: {}
	});
});

test('get no data', (t) => {
	t.deepEqual(getData({}, {}), {});
});
