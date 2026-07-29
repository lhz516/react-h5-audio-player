import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'vite.umd.entry.ts'),
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
        exports: 'default',
      },
    },
    outDir: 'lib',
    emptyOutDir: false,
    minify: true,
    // Ensure we're building for browser compatibility similar to webpack config
    target: 'es2015',
  },
})
