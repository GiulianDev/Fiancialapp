import { defineConfig, type HmrContext } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import { exec } from 'child_process'

// Plugin custom per mantenere aggiornata la mappa architetturale per l'LLM
const updateMapPlugin = () => {
  return {
    name: 'update-map-on-change',
    // Definiamo esplicitamente il tipo per il parametro ctx
    handleHotUpdate(ctx: HmrContext) { 
      const file = ctx.file; // Ora TypeScript sa che 'file' è una stringa
      
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        exec('uv run generate_map.py > ../.continue/rules/02-PROJECT_MAP.md', (error) => {
          if (error) {
            console.error('Errore durante l\'aggiornamento della mappa:', error);
          } else {
            console.log('🗺️ Mappa di progetto aggiornata per Qwen in background!');
          }
        });
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    updateMapPlugin() // <--- Plugin iniettato qui
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
})