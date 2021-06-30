# Eleventy Plugin CloudCannon

An Eleventy (11ty) plugin that creates [CloudCannon](https://cloudcannon.com/) editor details.

[<img src="https://img.shields.io/npm/v/eleventy-plugin-cloudcannon?logo=npm" alt="version badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)
[<img src="https://img.shields.io/npm/dt/eleventy-plugin-cloudcannon" alt="downloads badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)

## Installation

### CloudCannon

By default, CloudCannon automatically injects this plugin before your site is built. You can
disable this if you want to maintain the plugin versioning yourself or you experience issues.

Disabling the automatic injection prevents the templates being copied. In order to retain this,
you may wish to add the following to your `_cloudcannon-prebuild.sh`:

```
rm -rf cloudcannon
cp -R node_modules/eleventy-plugin-cloudcannon/cloudcannon .
```

If you use custom paths for your site, pass them to the plugin in the `cloudcannonOptions` key
within your `.eleventy.js` file:

```
module.exports = function (eleventyConfig) {
  const config = {
    pathPrefix: '/',
    dir: {
      input: '.',
      data: '_my-custom-data',
      layouts: '_layouts',
      includes: '_my-includes'
    }
  };

  eleventyConfig.cloudcannonOptions = config;
  return config;
};
```

### Manual

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-cloudcannon).

```
npm install eleventy-plugin-cloudcannon --save
```

Add the following `addPlugin` call to the `module.exports` function in your `.eleventy.js` file:

```
const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginCloudCannon);
};
```

If you use custom paths for your site, pass them to the plugin as well:

```
const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
  const config = {
    pathPrefix: '/',
    dir: {
      input: '.',
      data: '_my-custom-data',
      layouts: '_layouts',
      includes: '_my-includes'
    }
  };

  eleventyConfig.addPlugin(pluginCloudCannon, config);
  return config;
};
```

## Options

The options are either set on the `eleventyConfig.cloudcannonOptions` key within your
`.eleventy.js` file, or passed to the `addPlugin` call as a second argument if you are adding the
plugin manually.

Should match the return value from your `.eleventy.js` (https://www.11ty.dev/docs/config/) file.
All optional, including the argument itself.

| Key                 | Type   | Default                                                                      | Description                         |
| ------------------- | ------ | ---------------------------------------------------------------------------- | ----------------------------------- |
| `pathPrefix`        | string | `'/'`                                                                        | `pathPrefix` setting your site uses |
| `dir`               | object | `{ input: '.', data: '_data', includes: '_includes', layouts: '_includes' }` | Custom paths your site uses         |
| `markdownItOptions` | object | `{ html: true }`                                                             | Options passed to markdown-it       |

## Data

This plugin reads data from `cloudcannon` if available (defaults to `_data/cloudcannon.json` or
`_data/cloudcannon.js`).

Details on each property here are listed in the relevant parts of the
[CloudCannon documentation](https://cloudcannon.com/documentation/).

The following is an empty template as an example.

```
{
  "timezone": "",
  "collections": {
    "projects": {
      "path": "",
      "name": "",
      "title": "",
      "output": false,
      "_sort_key": "",
      "_subtext_key": "",
      "_image_key": "",
      "_image_size": "",
      "_singular_name": "",
      "_singular_key": "",
      "_disable_add": false,
      "_icon": "",
      "_enabled_editors": null,
      "_add_options": []
    }
  },
  "_comments": {},
  "_options": {},
  "_editor": {},
  "_collection_groups": null,
  "_source_editor": {},
  "_array_structures": {},
  "_enabled_editors": null,
  "_select_data": {}
}
```

## License

MIT
