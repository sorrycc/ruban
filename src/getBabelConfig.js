
module.exports = function () {
  return {
    babelrc: false,
    presets: [
      [require.resolve('babel-preset-af-react'), {
        targets: {
          node: 6,
        }
      }]
    ],
    plugins: [
      require.resolve('babel-plugin-add-module-exports'),
      require.resolve('@babel/plugin-transform-modules-commonjs'),
      require.resolve('@babel/plugin-transform-runtime')
    ]
  };
};
