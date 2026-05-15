module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    // This project does not currently include eslint-plugin-react, so core
    // no-unused-vars cannot reliably detect JSX component usage.
    'no-unused-vars': 'off',
  },
};
