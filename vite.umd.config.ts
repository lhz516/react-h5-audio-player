import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'ReactH5AudioPlayer',
      fileName: () => 'react-h5-audio-player.min.js',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        exports: 'named',
      },
    },
    outDir: 'lib',
    minify: true,
    // Ensure we're building for browser compatibility similar to webpack config
    target: 'es2015',
  },
})
