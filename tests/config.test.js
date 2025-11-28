const test = require('ava');
const { readConfig } = require('../src/config.js');

test('reads legacy config', (t) => {
	const options = {
		markdownItOptions: {
			html: true,
			linkify: true,
		},
	};

	const context = {
		cloudcannon: {
			data: {
				things: true,
				stuff: true,
				nope: false,
			},
			collections: {
				pages: {
					path: '',
					output: true,
				},
				staff: {
					path: 'staff',
					_add_options: [],
					_disable_add: true,
					_icon: 'people',
					_image_key: 'profile_image',
					_image_size: 'cover',
					_singular_key: 'staff_member',
					_singular_name: 'Staff Member',
					_sort_key: 'name',
					_subtext_key: 'bio',
				},
			},
			_inputs: {
				type: 'disabled',
				id: {
					instance_value: 'UUID',
				},
			},
			_editor: {
				default_path: '/base/',
			},
			_collection_groups: [
				{
					heading: 'Content',
					collections: ['pages', 'staff'],
				},
			],
			_source_editor: {
				theme: 'dawn',
			},
			_select_data: {
				things: ['Hat', 'Cake'],
			},
		},
	};

	const expected = {
		_inputs: {
			type: 'disabled',
			id: {
				instance_value: 'UUID',
			},
		},
		_select_data: {
			things: ['Hat', 'Cake'],
		},
		base_url: '',
		collection_groups: [
			{
				heading: 'Content',
				collections: ['pages', 'staff'],
			},
		],
		collections_config: {
			pages: {
				path: '',
				output: true,
			},
			staff: {
				path: 'staff',
				add_options: [],
				disable_add: true,
				icon: 'people',
				image_key: 'profile_image',
				image_size: 'cover',
				singular_key: 'staff_member',
				singular_name: 'Staff Member',
				sort_key: 'name',
				subtext_key: 'bio',
			},
		},
		data_config: {
			nope: false,
			stuff: true,
			things: true,
		},
		editor: {
			default_path: '/base/',
		},
		paths: {
			collections: '',
			data: '_data',
			layouts: '_includes',
			pages: '',
			static: '',
			uploads: 'uploads',
		},
		source: '',
		source_editor: {
			theme: 'dawn',
		},
		generator: {
			metadata: {
				markdown: 'markdown-it',
				'markdown-it': {
					html: true,
					linkify: true,
				},
			},
		},
	};

	const config = readConfig(context, options);

	t.deepEqual(config, expected);
});
