module.exports = (api) => {
  const env = api.env()
  const conditionalOptions = {}

  if (env === 'cjs') {
    conditionalOptions.modules = 'cjs'
  } else if (env === 'es') {
    conditionalOptions.modules = false
  }

  return {
    presets: [
      ['@babel/preset-env', {
        targets: 'defaults', // > 0.5%, last 2 versions, Firefox ESR, not dead
        loose: true,
        ...conditionalOptions,
      }],
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
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-runtime'
    ],
    comments: false,
  }
}
