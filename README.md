# Eleventy Plugin CloudCannon

An Eleventy (11ty) plugin that creates [CloudCannon](https://cloudcannon.com/) build information.

[<img src="https://img.shields.io/npm/v/eleventy-plugin-cloudcannon?logo=npm" alt="version badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)
[<img src="https://img.shields.io/npm/dt/eleventy-plugin-cloudcannon" alt="downloads badge">](https://www.npmjs.com/package/eleventy-plugin-cloudcannon)

***

- [Installation](#installation)
- [Configuration](#configuration)
- [Plugin options](#plugin-options)
- [License](#license)

***

## Installation

**You don't have to install anything** when building on CloudCannon. This plugin is automatically
installed before your site is built. This gives you the latest support, new features, and fixes
as they are released.

Although **not recommended**, you can disable the automatic installation and install the plugin
manually.

<details>
<summary>Manual installation steps</summary>

<blockquote>

When installing manually, you'll have to upgrade when new versions are released.
You could also follow these steps to debug an integration issue locally.

Start by enabling the "Manage eleventy-plugin-cloudcannon plugin manually" option in CloudCannon
for your site in *Site Settings / Build*.

```bash
npm install eleventy-plugin-cloudcannon --save
```

Add the following `addPlugin` call to your `.eleventy.js` file.
The second parameter is optional, and used to pass [plugin options](#plugin-options).

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

</blockquote>
</details>

## Configuration

This plugin uses a your `cloudcannon.config.*` configuration file as a base to generate
`_cloudcannon/info.json`.

Configuration files must be in the same directory you run `npx @11ty/eleventy`. The first file
found is used, the files supported are:

- `cloudcannon.config.json`
- `cloudcannon.config.yaml`
- `cloudcannon.config.yml`
- `cloudcannon.config.js`
- `cloudcannon.config.cjs`

Example content for `cloudcannon.config.cjs`:

```javascript
module.exports = {
  // Global CloudCannon configuration
  _inputs: {
    title: {
      type: 'text',
      comment: 'The title of your page.'
    }
  },
  _select_data: {
    colors: ['Red', 'Green', 'Blue']
  },

  // Base path to your site source files, same as input for Eleventy
  source: 'src',

  // The subpath your built output files are mounted at
  base_url: '/documentation',

  // Populates collections for navigation and metadata in the editor
  collections_config: {
    people: {
      // Base path for files in this collection, relative to source
      path: 'content/people',

      // Whether this collection produces output files or not
      output: true

      // Collection-level configuration
      name: 'Personnel',
      _enabled_editors: ['data']
    },
    posts: {
      path: '_posts',
      output: true
    },
    pages: {
      name: 'Main pages'
    }
  },

  // Generates the data for select and multiselect inputs matching these names
  data_config: {
    // Populates data with authors from an data file with the matching name
    authors: true,
    offices: true
  },

  paths: {
    // The default location for newly uploaded files, relative to source
    uploads: 'assets/uploads',

    // The path to site data files, relative to source
    data: 'data', // defaults to _data

    // The path to site layout files, relative to source
    layouts: '_layouts', // defaults to _includes

    // The path to site include files, relative to source
    includes: '_partials' // defaults to _includes
  }
};
```

See the [CloudCannon documentation](https://cloudcannon.com/documentation/) for more information
on the available features you can configure.

## Plugin options

Configuration is set in `cloudcannon.config.*`, but the plugin also automatically
reads the following from Eleventy if unset:

- `paths` from `dir` in `.eleventy.js` options
- `base_url` from `pathPrefix` in `.eleventy.js` options
- `source` from the `--input` CLI option or `dir.input` in `.eleventy.js` options

These options match Eleventy's [configuration format](https://www.11ty.dev/docs/config/) and are
set in one of three ways:

<details>
  <summary>Returning from <code>.eleventy.js</code> with automatic installation</summary>

**Requires automatic installation**.

> ```javascript
> module.exports = function (eleventyConfig) {
>   return {
>     pathPrefix: '/',
>     dir: {
>       input: '.',
>       data: '_my-custom-data',
>       layouts: '_layouts',
>       includes: '_my-includes'
>     }
>   };
> };
> ```

</details>

<details>
  <summary>Setting <code>eleventyConfig.cloudcannonOptions</code></summary>

**Requires automatic installation or needs to be before the call to `addPlugin`**.

> ```javascript
> module.exports = function (eleventyConfig) {
>   eleventyConfig.cloudcannonOptions = {
>     pathPrefix: '/',
>     dir: {
>       input: '.',
>       data: '_my-custom-data',
>       layouts: '_layouts',
>       includes: '_my-includes'
>     }
>   };
> };
> ```

</details>

<details>
  <summary>Through <code>addPlugin</code> with manual installation</summary>

> ```javascript
> const pluginCloudCannon = require('eleventy-plugin-cloudcannon');
>
> module.exports = function (eleventyConfig) {
>   const config = {
>     pathPrefix: '/',
>     dir: {
>       input: '.',
>       data: '_my-custom-data',
>       layouts: '_layouts',
>       includes: '_my-includes'
>     }
>   };
>
>   eleventyConfig.addPlugin(pluginCloudCannon, config);
>   return config;
> };
> ```

</details>

## License

MIT
