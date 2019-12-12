const path = require('path')

// Storybook Webpack config doc: https://storybook.js.org/docs/configurations/custom-webpack-config/
module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
    include: path.resolve(__dirname, '../src'),
  });

  return config
}
