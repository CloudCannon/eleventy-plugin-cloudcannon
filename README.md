# Eleventy Plugin CloudCannon

An Eleventy (11ty) plugin that creates [CloudCannon](https://cloudcannon.com/) editor details.

![version badge](https://img.shields.io/npm/v/eleventy-plugin-cloudcannon?logo=npm) ![downloads badge](https://img.shields.io/npm/dt/eleventy-plugin-cloudcannon)

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

If you are running this locally rather than on CloudCannon, copy the templates as well:

```
cp -R node_modules/eleventy-plugin-cloudcannon/cloudcannon .
```

## Options

Matches what you set or return in your main config. All optional, including the parameter itself.

| Key          | Type   | Default                                                                | Description                                  |
| ------------ | ------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| `pathPrefix` | string | `""`                                                                   | Custom pathPrefix setting your site uses |
| `input`      | string | `"."`                                                                  | Custom input path your site uses         |
| `dir`        | object | `{ "data": "_data", "includes": "_includes", "layouts": "_includes" }` | Custom paths your site uses (if any)     |

## Data

This plugin reads data from `cloudcannon` if available (defaults to `_data/cloudcannon.json`).

Details on each property here are listed in the relevant parts of the
[CloudCannon documentation](https://cloudcannon.com/documentation/).

The following is an empty template as an example.

```
{
  "timezone": "",
  "collections": {
    "projects": {
      "_path": "",
      "name": "",
      "title": "",
      "output": false,
      "_sort-key": "",
      "_subtext-key": "",
      "_image-key": "",
      "_image-size": "",
      "_singular-name": "",
      "_singular-key": "",
      "_disable-add": false,
      "_icon": "",
      "_add-options": []
    }
  },
  "comments": {},
  "input-options": {},
  "editor": {},
  "source-editor": {},
  "explore": {},
  "array-structures": {},
  "select-data": {}
}
```

## License

MIT
