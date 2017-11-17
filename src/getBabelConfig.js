
module.exports = function () {
  return {
    babelrc: false,
    presets: [
      [require.resolve('babel-preset-af-react'), {
        targets: process.env.NODE_TARGET ? {
          node: 6,
        } : null,
        disableTransform: process.env.DISABLE_TRANSFORM_RUNTIME
      }]
    ],
    plugins: [
      require.resolve('babel-plugin-add-module-exports'),
      require.resolve('@babel/plugin-transform-modules-commonjs')
    ]
  };
};
