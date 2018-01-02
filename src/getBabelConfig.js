
module.exports = function () {
  return {
    babelrc: false,
    presets: [
      [require.resolve('babel-preset-umi'), {
        targets: process.env.NODE_TARGET ? {
          node: 6,
        } : null,
        disableTransform: process.env.DISABLE_TRANSFORM_RUNTIME
      }]
    ],
    plugins: [
      require.resolve('@babel/plugin-transform-modules-commonjs')
    ]
  };
};
