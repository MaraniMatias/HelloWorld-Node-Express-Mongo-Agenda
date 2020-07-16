module.exports = {
  root: true,
  env: {
    browser: false,
    node: 'true', // Node.js global variables and Node.js scoping.
    es6: 'true', // enable all ECMAScript 6 features except for modules.
    mocha: 'true', // adds all of the Mocha testing global variables.
    jasmine: 'true', // adds all of the Jasmine testing global variables for version 1.3 and 2.0.
    jest: 'true', // Jest global variables.
    mongo: 'true', // MongoDB global variables.
  },
  extends: [
    'prettier',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
    'plugin:you-dont-need-lodash-underscore/compatible',
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
  },
}
