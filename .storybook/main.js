const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');
const path = require('path')

module.exports = {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.js'],

  addons: ['@storybook/addon-docs/register', '@storybook/addon-actions/register'],

  webpackFinal: async config => {
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
  
    config.module.rules.push({
        test: /\.[tj]sx?$/,
        loader: require.resolve('@storybook/source-loader'),
        exclude: [/node_modules/],
        enforce: 'pre',
    })

    config.resolve.extensions.push('.tsx')
  
    return config
  },
};
