# static-analysis

[![npm version](https://badge.fury.io/js/static-analysis.svg)](https://npmjs.org/package/static-analysis)

`static-analysis` Performs Static Analysis On JavaScript Programs To Find Out All Dependencies That Stem From The Given File.

```sh
yarn add -E static-analysis
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`async staticAnalysis(path, config): !Array<!Detection>`](#async-staticanalysispath-stringarraystringconfig-config-arraydetection)
  * [`Config`](#type-config)
  * [`Detection`](#type-detection)
  * [Ignore Node_Modules](#ignore-node_modules)
  * [Shallow Node_Modules](#shallow-node_modules)
  * [Soft Mode](#soft-mode)
  * [Fields](#fields)
- [`sort(detections: Array<Detection>): {}`](#sortdetections-arraydetection-)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/0.svg?sanitize=true">
</a></p>

## API

The package is available by importing its default function:

```js
import staticAnalysis from 'static-analysis'
```

The types and [externs](externs.js) for _Google Closure Compiler_ via [**_Depack_**](https://github.com/dpck/depack) are defined in the `_staticAnalysis` namespace.

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/1.svg?sanitize=true">
</a></p>

## <code>async <ins>staticAnalysis</ins>(</code><sub><br/>&nbsp;&nbsp;`path: string|!Array<string>,`<br/>&nbsp;&nbsp;`config: !Config,`<br/></sub><code>): <i>!Array<!Detection></i></code>
Detects all dependencies in a file and their dependencies recursively. Returns the array with detections.

 - <kbd><strong>path*</strong></kbd> <em><code>(string \| !Array&lt;string&gt;)</code></em>: The path to the file in which to detect dependencies.
 - <kbd><strong>config*</strong></kbd> <em><code><a href="#type-config" title="The configuration options for `staticAnalysis`.">!Config</a></code></em>: The configuration options for `staticAnalysis`.

It is possible to pass multiple paths or a path to the directory which has `index.js` or `index.jsx` files. If the package exports `main` over `module`, the `hasMain` property will be added. This function can be useful to find out all files to pass to the Google Closure Compiler, for example, which is what [_Depack_](https://github.com/dpck/depack) does to bundle frontend code and compile Node.js packages.

- The package does not build an AST, it just looks for `import` and `require` statements using regular expressions. Therefore, there's also no tree-shaking or complete analysis of the real dependencies.
- If a source is imported like `import fn from '@idio/preact/build/fn`, then the analysis will not contain `@idio/preact` as a `node_module` dependency with the `packageJson`, `name` and `version` fields, it will only appear as an entry file.

__<a name="type-config">`Config`</a>__: The configuration options for `staticAnalysis`.

|    Name     |             Type              |                                             Description                                             | Default |
| ----------- | ----------------------------- | --------------------------------------------------------------------------------------------------- | ------- |
| nodeModules | <em>boolean</em>              | Whether to include packages from `node_modules` in the output.                                      | `true`  |
| shallow     | <em>boolean</em>              | Only report on the entries of `node_module` dependencies, without analysing their own dependencies. | `false` |
| soft        | <em>boolean</em>              | Do not throw an error when the dependency cannot be found in `node_modules`.                        | `false` |
| fields      | <em>!Array&lt;string&gt;</em> | Any additional fields from `package.json` files to return.                                          | -       |

_For example, for the given file_:
```js
import read from '@wrote/read'
import { resolve } from 'path'
import { render } from 'preact'
import Fixture from '@idio/preact-fixture/src/Test'

const Component = require('./Component');

(async () => {
  const file = await read(resolve('example'))
  render(<Component>
    {file}
    <Fixture />
  </Component>, document.body)
})()
```

_Static Analysis can detect matches using the following script_:
```js
/* yarn example/ */
import staticAnalysis from 'static-analysis'

(async () => {
  const res = await staticAnalysis('example/source.js')
  console.log(res)
})()
```
```js
[ { entry: 'node_modules/@wrote/read/src/index.js',
    packageJson: 'node_modules/@wrote/read/package.json',
    version: '1.0.4',
    name: '@wrote/read',
    from: [ 'example/source.js' ] },
  { internal: 'path', from: [ 'example/source.js' ] },
  { entry: 'node_modules/preact/dist/preact.mjs',
    packageJson: 'node_modules/preact/package.json',
    version: '8.5.2',
    name: 'preact',
    from: [ 'example/source.js' ] },
  { package: '@idio/preact-fixture',
    entry: 'node_modules/@idio/preact-fixture/src/Test.jsx',
    from: [ 'example/source.js' ] },
  { entry: 'example/Component.jsx',
    required: true,
    from: [ 'example/source.js' ] },
  { internal: 'fs',
    from: [ 'node_modules/@wrote/read/src/index.js' ] },
  { entry: 'node_modules/catchment/src/index.js',
    packageJson: 'node_modules/catchment/package.json',
    version: '3.3.0',
    name: 'catchment',
    from: [ 'node_modules/@wrote/read/src/index.js' ] },
  { internal: 'stream',
    from: [ 'node_modules/catchment/src/index.js' ] },
  { entry: 'node_modules/erotic/src/index.js',
    packageJson: 'node_modules/erotic/package.json',
    version: '2.1.1',
    name: 'erotic',
    from: [ 'node_modules/catchment/src/index.js' ] },
  { entry: 'node_modules/@artdeco/clean-stack/src/index.js',
    packageJson: 'node_modules/@artdeco/clean-stack/package.json',
    version: '1.1.1',
    name: '@artdeco/clean-stack',
    from: 
     [ 'node_modules/catchment/src/index.js',
       'node_modules/erotic/src/callback.js' ] },
  { package: 'catchment',
    entry: 'node_modules/catchment/src/lib/index.js',
    from: [ 'node_modules/catchment/src/index.js' ] },
  { package: 'erotic',
    entry: 'node_modules/erotic/src/lib.js',
    from: 
     [ 'node_modules/erotic/src/index.js',
       'node_modules/erotic/src/callback.js' ] },
  { package: 'erotic',
    entry: 'node_modules/erotic/src/callback.js',
    from: [ 'node_modules/erotic/src/index.js' ] },
  { internal: 'os',
    from: [ 'node_modules/@artdeco/clean-stack/src/index.js' ] } ]
```

__<a name="type-detection">`Detection`</a>__: The module detection result.

|    Name     |             Type              |                                                               Description                                                               |
| ----------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| entry       | <em>string</em>               | The path to the JavaScript file to be required. If an internal Node.js package is required, it's name is found in the `internal` field. |
| __from*__   | <em>!Array&lt;string&gt;</em> | The file in which the dependency was found.                                                                                             |
| packageJson | <em>string</em>               | The path to the `package.json` file of the dependency if it's a module.                                                                 |
| name        | <em>string</em>               | The name of the package.                                                                                                                |
| version     | <em>string</em>               | The version of the package.                                                                                                             |
| internal    | <em>string</em>               | If it's an internal NodeJS dependency, such as `fs` or `path`, contains its name.                                                       |
| hasMain     | <em>boolean</em>              | Whether the entry from the package was specified via the `main` field and not `module` field.                                           |
| package     | <em>string</em>               | If the entry is a library file withing a package, this field contains its name. Same as the `name` field for the _main/module_ entries. |
| required    | <em>boolean</em>              | Whether the package was required using the `require` statement.                                                                         |

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/2.svg?sanitize=true" width="15">
</a></p>

### Ignore Node_Modules

It is possible to ignore `node_modules` folders. In this case, only dependencies that start with `./` or `/` will be included in the output.

```js
import staticAnalysis from 'static-analysis'

(async () => {
  const res = await staticAnalysis('example/source.js', {
    nodeModules: false,
  })
  console.log(res)
})()
```
```js
[ { entry: 'example/Component.jsx',
    required: true,
    from: [ 'example/source.js' ] } ]
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/3.svg?sanitize=true" width="15">
</a></p>

### Shallow Node_Modules

To only report the entry to the dependency from `node_modules` without analysing its dependency, the `shallow` options can be set.

```js
import staticAnalysis from 'static-analysis'

(async () => {
  const res = await staticAnalysis('example/source.js', {
    shallow: true,
  })
  console.log(res)
})()
```
```js
[ { entry: 'node_modules/@wrote/read/src/index.js',
    packageJson: 'node_modules/@wrote/read/package.json',
    version: '1.0.4',
    name: '@wrote/read',
    from: [ 'example/source.js' ] },
  { internal: 'path', from: [ 'example/source.js' ] },
  { entry: 'node_modules/preact/dist/preact.mjs',
    packageJson: 'node_modules/preact/package.json',
    version: '8.5.2',
    name: 'preact',
    from: [ 'example/source.js' ] },
  { package: '@idio/preact-fixture',
    entry: 'node_modules/@idio/preact-fixture/src/Test.jsx',
    from: [ 'example/source.js' ] },
  { entry: 'example/Component.jsx',
    required: true,
    from: [ 'example/source.js' ] } ]
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/4.svg?sanitize=true" width="15">
</a></p>

### Soft Mode

_Static Analysis_ will try to figure out entry points of package dependencies by looking up their `package.json` in the `node_modules` folder. If it cannot find this file, an error will be throw. To prevent the error, and exclude the module from appearing the results, the `soft` mode can be activated.

_With the following file being analysed:_

```jsx
import missing from 'missing'
import { render } from 'preact'

render(<div>Hello World</div>)
```

_The program will throw initially, but will skip the missing dependency in **soft mode**:_

```js
import staticAnalysis from 'static-analysis'

(async () => {
  try {
    const res = await staticAnalysis('example/missing-dep')
    console.log(res)
  } catch (err) {
    console.log(err)
  }
})()

;(async () => {
  const res = await staticAnalysis('example/missing-dep', {
    soft: true,
  })
  console.log('Soft mode on.')
  console.log(res)
})()
```
```js
Error: example/missing-dep.jsx
 [!] Package.json for module missing not found.
    at staticAnalysis (src/index.js:12:13)
    at example/soft.js:5:23
    at Object.<anonymous> (example/soft.js:10:3)
    at Module.p._compile (node_modules/alamode/compile/depack.js:49:18)
    at Object.k.(anonymous function).y._extensions.(anonymous function) [as .js] (node_modules/alamode/compile/depack.js:51:7)
Soft mode on.
[ { entry: 'node_modules/preact/dist/preact.mjs',
    packageJson: 'node_modules/preact/package.json',
    version: '8.5.2',
    name: 'preact',
    from: [ 'example/missing-dep.jsx' ] } ]
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/5.svg?sanitize=true" width="25">
</a></p>

### Fields

To make _Static Analysis_ return any additional fields from _package.json_ files on detected dependencies, they should be specified in the `fields` config property.

```js
import staticAnalysis from 'static-analysis'

(async () => {
  const res = await staticAnalysis('example/source', {
    fields: ['license', 'homepage'],
    shallow: true,
  })
  console.log(res)
})()
```
```js
[ { entry: 'node_modules/@wrote/read/src/index.js',
    packageJson: 'node_modules/@wrote/read/package.json',
    version: '1.0.4',
    name: '@wrote/read',
    license: 'MIT',
    homepage: 'https://github.com/wrote/read#readme',
    from: [ 'example/source.js' ] },
  { internal: 'path', from: [ 'example/source.js' ] },
  { entry: 'node_modules/preact/dist/preact.mjs',
    packageJson: 'node_modules/preact/package.json',
    version: '8.5.2',
    name: 'preact',
    license: 'MIT',
    homepage: 'https://github.com/developit/preact',
    from: [ 'example/source.js' ] },
  { package: '@idio/preact-fixture',
    entry: 'node_modules/@idio/preact-fixture/src/Test.jsx',
    from: [ 'example/source.js' ] },
  { entry: 'example/Component.jsx',
    required: true,
    from: [ 'example/source.js' ] } ]
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/6.svg?sanitize=true">
</a></p>

## <code><ins>sort</ins>(</code><sub><br/>&nbsp;&nbsp;`detections: Array<Detection>,`<br/></sub><code>): <i>{}</i></code>

Sorts the detected dependencies into commonJS modules, packageJsons and internals.

```js
import staticAnalysis, { sort } from 'static-analysis'

(async () => {
  const d = await staticAnalysis('example/source.js')
  const sorted = sort(d)
  console.log(sorted)
})()
```
```js
{ commonJsPackageJsons: [],
  packageJsons: 
   [ 'node_modules/@wrote/read/package.json',
     'node_modules/preact/package.json',
     'node_modules/catchment/package.json',
     'node_modules/erotic/package.json',
     'node_modules/@artdeco/clean-stack/package.json' ],
  commonJs: [],
  js: 
   [ 'node_modules/@wrote/read/src/index.js',
     'node_modules/preact/dist/preact.mjs',
     'node_modules/@idio/preact-fixture/src/Test.jsx',
     'example/Component.jsx',
     'node_modules/catchment/src/index.js',
     'node_modules/erotic/src/index.js',
     'node_modules/@artdeco/clean-stack/src/index.js',
     'node_modules/catchment/src/lib/index.js',
     'node_modules/erotic/src/lib.js',
     'node_modules/erotic/src/callback.js' ],
  internals: [ 'path', 'fs', 'stream', 'os' ],
  deps: 
   [ '@wrote/read',
     'preact',
     'catchment',
     'erotic',
     '@artdeco/clean-stack' ] }
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/7.svg?sanitize=true">
</a></p>

## Copyright

<table>
  <tr>
    <th>
      <a href="https://artd.eco">
        <img width="100" src="https://raw.githubusercontent.com/wrote/wrote/master/images/artdeco.png"
          alt="Art Deco">
      </a>
    </th>
    <th>© <a href="https://artd.eco">Art Deco</a> for <a href="https://artd.eco/depack">Depack</a> 2019</th>
    <th>
      <a href="https://www.technation.sucks" title="Tech Nation Visa">
        <img width="100" src="https://raw.githubusercontent.com/idiocc/cookies/master/wiki/arch4.jpg"
          alt="Tech Nation Visa">
      </a>
    </th>
    <th><a href="https://www.technation.sucks">Tech Nation Visa Sucks</a></th>
  </tr>
</table>

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/-1.svg?sanitize=true">
</a></p>