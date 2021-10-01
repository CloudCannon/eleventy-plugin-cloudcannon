# Eleventy Plugin CloudCannon

An Eleventy (11ty) plugin that creates [CloudCannon](https://cloudcannon.com/) build information.

[<img src="https://img.shields.io/npm/v/eleventy-plugin-cloudcannon?logo=npm" alt="version badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)
[<img src="https://img.shields.io/npm/dt/eleventy-plugin-cloudcannon" alt="downloads badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)

***

- [Installation](#installation)
- [Plugin options](#plugin-options)
- [Site configuration](#site-configuration)
- [Manual installation](#manual-installation)
- [License](#license)

***

## Installation

CloudCannon automatically injects this plugin before your site is built. This means you'll get new
features and fixes as they are released. You can [disable this](#manual-installation) if you need
to maintain the plugin versioning manually.

If you use custom paths for your site, you'll need to pass them to the plugin, either one of:

- Setting `eleventyConfig.cloudcannonOptions`
- Returning from `.eleventy.js`

```javascript
module.exports = function (eleventyConfig) {
  const config = {
    pathPrefix: '/',
    dir: {
      input: '.',
      data: '_my-custom-data',
      layouts: '_layouts',
      includes: '_my-includes'
    },
    markdownItOptions: {
      html: true
    }
  };

  // Plugin looks here for plugin options
  eleventyConfig.cloudcannonOptions = config;

  // Plugin also looks at what you return for plugin options
  return config;
};
```

If you set your custom input path with the `--input` CLI option, CloudCannon reads it automatically.

## Plugin options

The options are either set on the `eleventyConfig.cloudcannonOptions` key within your
`.eleventy.js` file, or passed to the `addPlugin` call as a second argument if you are adding the
plugin manually.

Should match the return value from your `.eleventy.js` (https://www.11ty.dev/docs/config/) file.

<details>
  <summary><code>pathPrefix</code></summary>

> The `pathPrefix` setting your site uses. Defaults to: `'/'`

</details>

<details>
  <summary><code>dir</code></summary>

> Custom paths your site uses. Defaults to:
>
> ```javascript
> {
>   input: '.',
>   data: '_data',
>   includes: '_includes',
>   layouts: '_includes'
> }
> ```

</details>

<details>
  <summary><code>markdownItOptions</code></summary>

> Options passed to markdown-it. Defaults to `{ html: true }`.

</details>

## Site configuration

This plugin reads data from `cloudcannon` if available (i.e. `_data/cloudcannon.json` or
`_data/cloudcannon.js`).

Details on each property here are listed in the relevant parts of the
[CloudCannon documentation](https://cloudcannon.com/documentation/).

The following is an empty template as an example.

```json
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

## Manual installation

Manually managing this plugin means you'll have to upgrade when new versions are released. You can
also follow these steps to try it or debug locally.

<details>
<summary>Manual installation steps</summary>

<blockquote>

Start by enabling the "Manage eleventy-plugin-cloudcannon plugin manually" option in CloudCannon
for your site in *Site Settings / Build*.

```bash
npm install eleventy-plugin-cloudcannon --save
```

Add the following `addPlugin` call to the `module.exports` function in your `.eleventy.js` file:

```javascript
const pluginCloudCannon = require('eleventy-plugin-cloudcannon');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginCloudCannon);
};
```

If you use custom paths for your site, pass them to the plugin as well:

```javascript
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

Disabling the automatic injection prevents the `info.json` template being copied. In order to
retain this, add the following to your `.cloudcannon/prebuild` build hook:

```bash
rm -rf cloudcannon
cp -R node_modules/eleventy-plugin-cloudcannon/cloudcannon .
```

</blockquote>
</details>

## License

MIT
