const path = require('path')
const ts = require('rollup-plugin-typescript2')
const replace = require('@rollup/plugin-replace')
const json = require('@rollup/plugin-json')

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

const masterVersion = require('./package.json').version
const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const name = path.basename(packageDir)
const resolve = (p) => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const packageOptions = pkg.buildOptions || {}

// ensure TS checks only once for each build
let hasTSChecked = false

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`,
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`,
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`,
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`,
  },
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
  ? []
  : packageFormats.map((format) => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach((format) => {
    if (packageOptions.prod === false) {
      return
    }
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }
    if (['global', 'esm-browser'].includes(format)) {
      packageConfigs.push(createMinifiedConfig(format))
    }
  })
}

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false

  const isProductionBuild =
    process.env.__DEV__ === 'false' || /\.prod\.js$/.test(output.file)
  const isBundlerESMBuild = /esm-bundler/.test(format)
  const isBrowserESMBuild = /esm-browser/.test(format)
  const isNodeBuild = format === 'cjs'
  const isGlobalBuild = /global/.test(format)

  if (isGlobalBuild) {
    output.name = packageOptions.name
  }

  const shouldEmitDeclarations = process.env.TYPES != null && !hasTSChecked

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
      exclude: ['**/__tests__', 'test-dts'],
    },
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  const external =
    isGlobalBuild || isBrowserESMBuild
      ? // normal browser builds - non-browser only imports are tree-shaken,
        // they are only listed here to suppress warnings.
        []
      : // Node / esm-bundler builds. Externalize everything.
        [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
        ]

  const nodePlugins =
    isGlobalBuild || isBrowserESMBuild
      ? [
          require('@rollup/plugin-node-resolve').nodeResolve({
            preferBuiltins: true,
          }),
          require('@rollup/plugin-commonjs')({
            sourceMap: false,
          }),
          require('rollup-plugin-node-builtins')(),
          require('rollup-plugin-node-globals')(),
        ]
      : []

  return {
    input: resolve(`src/index.ts`),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external,
    plugins: [
      json({
        namedExports: false,
      }),
      tsPlugin,
      createReplacePlugin(
        isProductionBuild,
        isBundlerESMBuild,
        isBrowserESMBuild,
        isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild,
        isGlobalBuild,
        isNodeBuild,
      ),
      ...nodePlugins,
      ...plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
  }
}

function createReplacePlugin(
  isProduction,
  isBundlerESMBuild,
  isBrowserESMBuild,
  isBrowserBuild,
  isGlobalBuild,
  isNodeBuild,
) {
  const replacements = {
    __COMMIT__: `"${process.env.COMMIT}"`,
    __VERSION__: `"${masterVersion}"`,
    __DEV__: isBundlerESMBuild
      ? // preserve to be handled by bundlers
        `(process.env.NODE_ENV !== 'production')`
      : // hard coded dev/prod builds
        !isProduction,
    // this is only used during Vu's internal tests
    __TEST__: false,
    // If the build is expected to run directly in the browser (global / esm builds)
    __BROWSER__: isBrowserBuild,
    __GLOBAL__: isGlobalBuild,
    __ESM_BUNDLER__: isBundlerESMBuild,
    __ESM_BROWSER__: isBrowserESMBuild,
    // is targeting Node ?
    __NODE_JS__: isNodeBuild,
  }

  // allow inline overrides like
  //__DEV__=true yarn build template
  Object.keys(replacements).forEach((key) => {
    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })
  return replace(replacements)
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format,
  })
}

function createMinifiedConfig(format) {
  const { terser } = require('rollup-plugin-terser')
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format,
    },
    [
      terser({
        ecma: 8,
        module: /^esm/.test(format),
        compress: {
          pure_getters: true,
        },
      }),
    ],
  )
}
