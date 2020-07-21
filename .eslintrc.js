module.exports = {
  root: true,
  env: {
    commonjs: true,
    es2020: true,
    es6: 'true', // enable all ECMAScript 6 features except for modules.
    jasmine: 'true', // adds all of the Jasmine testing global variables for version 1.3 and 2.0.
    jest: 'true', // Jest global variables.
    mocha: 'true', // adds all of the Mocha testing global variables.
    mongo: 'true', // MongoDB global variables.
    node: true,
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
    'plugin:you-dont-need-lodash-underscore/compatible',
  ],
  plugins: ['prettier'],
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
  },
}
