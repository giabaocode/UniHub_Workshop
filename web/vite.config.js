import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' 

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8081';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webp}'],
          navigateFallbackDenylist: [/^\/api/], // Ngăn Service Worker chặn các request API
        },
        manifest: {
          name: 'UniHub Workshop Check-in',
          short_name: 'UniHub',
          theme_color: '#1e3a5f',
          display: 'standalone',
        },
      })
    ],
    server: {
      host: '0.0.0.0',
      https: false,
      cors: true, // Cho phép CORS trên Vite Dev Server
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          // Thêm headers cho proxy để bypass Ngrok warning
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            });
          }
        }
      }
    }
  };
})
