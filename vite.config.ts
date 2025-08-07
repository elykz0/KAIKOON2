import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    server: {
      port: 3001,
      open: true,
      hmr: {
        overlay: false,
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
    define: {
      'process.env': env,
      // Expose environment variables to client-side
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
    }
  }
}) 
