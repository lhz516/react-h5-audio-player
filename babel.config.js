module.exports = (api) => {
  const env = api.env()
  let envOptions

  if (env === 'cjs') {
    envOptions = {
      targets: '> 0.5%',
      modules: 'cjs',
    }
  } else if (env === 'es') {
    envOptions = {
      targets: { esmodules: true },
      modules: false,
    }
  }

  return {
    presets: [
      ['@babel/preset-env', envOptions],
      [
        '@babel/preset-typescript',
        {
          isTSX: true,
          allExtensions: true,
        },
      ],
      '@babel/preset-react',
    ],
    plugins: ['@babel/plugin-proposal-class-properties'],
    comments: false,
  }
}
