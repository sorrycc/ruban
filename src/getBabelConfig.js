
module.exports = function () {
  return {
    babelrc: false,
    presets: [
      [require.resolve('babel-preset-af-react'), process.env.NODE_TARGET ? {
        targets: {
          node: 6,
        }
      } : {}]
    ],
    plugins: [
      require.resolve('babel-plugin-add-module-exports'),
      require.resolve('@babel/plugin-transform-modules-commonjs')
    ].concat(
      process.env.DISABLE_TRANSFORM_RUNTIME ? [] : [
        require.resolve('@babel/plugin-transform-runtime')
      ]
    )
  };
};
