import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import path from 'path'

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        // Allow serving files from the parent data directory
        path.resolve(__dirname, '..'),
      ],
    },
  },
})
