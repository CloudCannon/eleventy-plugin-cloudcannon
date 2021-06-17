# Eleventy Plugin CloudCannon

An Eleventy (11ty) plugin that creates [CloudCannon](https://cloudcannon.com/) editor details.

[<img src="https://img.shields.io/npm/v/eleventy-plugin-cloudcannon?logo=npm" alt="version badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)
[<img src="https://img.shields.io/npm/dt/eleventy-plugin-cloudcannon" alt="downloads badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)

## Installation

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-cloudcannon).

```
npm install eleventy-plugin-cloudcannon --save
```

Add the following `addPlugin` call to your `module.exports` function in the Eleventy config file
(`.eleventy.js` by default):

```
const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginCloudCannon, options);
};
```

If you set custom `dir` values for your site, pass them to the plugin as well:

```
const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
  const config = {
    dir: {
      data: '_my-custom-data',
      layouts: '_layouts',
      includes: '_my-includes'
    }
  };

  eleventyConfig.addPlugin(pluginCloudCannon, config);

  return config;
};
```

To ensure your site stays up to date with future plugin versions, add the following to your `_cloudcannon-prebuild.sh`:

```
nvm use 14
npm update eleventy-plugin-cloudcannon
npm install
rm -rf cloudcannon
cp -R node_modules/eleventy-plugin-cloudcannon/cloudcannon .
```

## Options

Matches what you set or return in your main config. All optional, including the parameter itself.

| Key          | Type   | Default                                                          | Description                              |
| ------------ | ------ | ---------------------------------------------------------------- | ---------------------------------------- |
| `pathPrefix` | string | `''`                                                             | Custom pathPrefix setting your site uses |
| `input`      | string | `'.'`                                                            | Custom input path your site uses         |
| `dir`        | object | `{ data: '_data', includes: '_includes', layouts: '_includes' }` | Custom paths your site uses (if any)     |

## Data

This plugin reads data from `cloudcannon` if available (defaults to `_data/cloudcannon.json` or `_data/cloudcannon.js`).

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
  "_source_editor": {},
  "_array_structures": {},
  "_enabled_editors": null,
  "_select_data": {}
}
```

## License

MIT
