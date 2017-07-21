const getBabelConfig = require('./getBabelConfig');

const babelConfig = getBabelConfig();
babelConfig.plugins = babelConfig.plugins.concat(require.resolve('babel-plugin-istanbul'));

require('babel-register')(babelConfig);

const noop = () => null;
['.css', '.less', '.html', '.htm'].forEach((ext) => {
  require.extensions[ext] = noop;
});
