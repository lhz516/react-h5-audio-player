const path = require('path')
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin')

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

  config.module.rules.push({
    test: /\.mdx$/,
    use: [
      {
        loader: 'babel-loader',
      },
      {
        loader: '@mdx-js/loader',
        options: {
          compilers: [createCompiler({})],
        },
      },
    ],
  });

  config.resolve.extensions.push('.tsx')
  config.resolve.extensions.push('.mdx')

  return config
}
