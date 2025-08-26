import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    '@storybook/addon-essentials',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  typescript: {
    check: false,
    skipCompiler: false,
  },

  viteFinal: async (config) => {
    // Configure JSX for .js files and CSS preprocessing
    config.esbuild = config.esbuild || {};
    config.esbuild.jsx = 'automatic';
    
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {};
    config.optimizeDeps.esbuildOptions.loader = {
      ...config.optimizeDeps.esbuildOptions.loader,
      '.js': 'jsx',
    };

    config.css = config.css || {};
    config.css.preprocessorOptions = config.css.preprocessorOptions || {};
    config.css.preprocessorOptions.scss = {};

    return config;
  },
};

export default config;