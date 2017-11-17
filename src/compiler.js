const getBabelConfig = require('./getBabelConfig');

const babelConfig = getBabelConfig();
babelConfig.plugins = babelConfig.plugins.concat(require.resolve('babel-plugin-istanbul'));

require('@babel/register')(babelConfig);

const noop = () => null;
['.css', '.less', '.html', '.htm'].forEach((ext) => {
  require.extensions[ext] = noop;
});

const { jsdom } = require('jsdom');

global.document = jsdom('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
