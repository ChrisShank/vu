const DOMGlobals = ['window', 'document']
const NodeGlobals = ['module', 'require']

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': [
      'error',
      // we are only using this rule to check for unused arguments since TS
      // catches unused variables but not args.
      { varsIgnorePattern: '.*', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    // most of the codebase are expected to be env agnostic
    'no-restricted-globals': ['error', ...NodeGlobals],
  },
  overrides: [
    // tests, no restrictions (runs in Node / jest with jsdom)
    {
      files: ['**/__tests__/**', 'test-dts/**'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    // shared, may be used in any env
    {
      files: ['packages/shared/**'],
      rules: {
        'no-restricted-globals': 'off',
      },
    },
    // Packages targeting DOM
    // {
    //   files: ['packages/{template,component}/**'],
    //   rules: {
    //     'no-restricted-globals': ['error', ...NodeGlobals]
    //   }
    // },
    // Packages targeting Node
    // {
    //   files: ['packages/{}/**'],
    //   rules: {
    //     'no-restricted-globals': ['error', ...DOMGlobals],
    //     'no-restricted-syntax': 'off'
    //   }
    // },
  ],
}
