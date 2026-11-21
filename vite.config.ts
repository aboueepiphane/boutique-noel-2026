import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' : le build fonctionne depuis n'importe quel sous-chemin (hébergement statique, artifact)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three') ) return 'three'
          if (id.includes('@react-three') || id.includes('postprocessing')) return 'r3f'
        },
      },
    },
  },
})
