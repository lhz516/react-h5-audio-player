const path = require('path')

// Storybook Webpack config doc: https://storybook.js.org/docs/configurations/custom-webpack-config/
module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
    include: path.resolve(__dirname, '../src'),
  })

  config.module.rules.push({
    test: /\.tsx$/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          ['@babel/preset-typescript', {
            isTSX: true,
            allExtensions: true
          }]
        ],
        plugins: ['@babel/plugin-proposal-class-properties']
      } 
    }
  })

  config.resolve.extensions.push('.tsx')

  return config
}
