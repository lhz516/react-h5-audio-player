/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'react-h5-audio-player.min.js',
    libraryTarget: 'umd',
    library: 'ReactH5AudioPlayer',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  externals: {
    react: 'React',
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: 'defaults', // > 0.5%, last 2 versions, Firefox ESR, not dead
                },
              ],
              [
                '@babel/preset-typescript',
                {
                  isTSX: true,
                  allExtensions: true,
                },
              ],
              '@babel/preset-react',
            ],
            plugins: [
              ['@babel/plugin-proposal-private-methods'],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime',
            ],
            comments: false,
          },
        },
      },
    ],
  },
}
