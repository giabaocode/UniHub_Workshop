// vite.config.js
import { defineConfig } from "file:///Users/kunda/Desktop/UniHub_Workshop/web/node_modules/vite/dist/node/index.js";
import react from "file:///Users/kunda/Desktop/UniHub_Workshop/web/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///Users/kunda/Desktop/UniHub_Workshop/web/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webp}"],
        navigateFallbackDenylist: [/^\/api/]
        // Ngăn Service Worker chặn các request API
      },
      manifest: {
        name: "UniHub Workshop Check-in",
        short_name: "UniHub",
        theme_color: "#1e3a5f",
        display: "standalone"
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    https: false,
    cors: true,
    // Cho phép CORS trên Vite Dev Server
    proxy: {
      "/api": {
        // ĐỔI THÀNH localhost ĐỂ NODE.JS TỰ TÌM ĐÚNG ĐỊA CHỈ
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // Thêm headers cho proxy để bypass Ngrok warning
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            proxyReq.setHeader("ngrok-skip-browser-warning", "true");
          });
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva3VuZGEvRGVza3RvcC9VbmlIdWJfV29ya3Nob3Avd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMva3VuZGEvRGVza3RvcC9VbmlIdWJfV29ya3Nob3Avd2ViL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9rdW5kYS9EZXNrdG9wL1VuaUh1Yl9Xb3Jrc2hvcC93ZWIvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YScgXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmplY3RSZWdpc3RlcjogJ2F1dG8nLFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZix3b2ZmMix3ZWJwfSddLFxuICAgICAgICBuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL2FwaS9dLCAvLyBOZ1x1MDEwM24gU2VydmljZSBXb3JrZXIgY2hcdTFFQjduIGNcdTAwRTFjIHJlcXVlc3QgQVBJXG4gICAgICB9LFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1VuaUh1YiBXb3Jrc2hvcCBDaGVjay1pbicsXG4gICAgICAgIHNob3J0X25hbWU6ICdVbmlIdWInLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMxZTNhNWYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICB9LFxuICAgIH0pXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBodHRwczogZmFsc2UsXG4gICAgY29yczogdHJ1ZSwgLy8gQ2hvIHBoXHUwMEU5cCBDT1JTIHRyXHUwMEVBbiBWaXRlIERldiBTZXJ2ZXJcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIC8vIFx1MDExMFx1MUVENEkgVEhcdTAwQzBOSCBsb2NhbGhvc3QgXHUwMTEwXHUxRUMyIE5PREUuSlMgVFx1MUVGMCBUXHUwMENDTSBcdTAxMTBcdTAwREFORyBcdTAxMTBcdTFFQ0FBIENIXHUxRUM4XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsIFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsIFxuICAgICAgICAvLyBUaFx1MDBFQW0gaGVhZGVycyBjaG8gcHJveHkgXHUwMTExXHUxRUMzIGJ5cGFzcyBOZ3JvayB3YXJuaW5nXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ25ncm9rLXNraXAtYnJvd3Nlci13YXJuaW5nJywgJ3RydWUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQTBTLFNBQVMsb0JBQW9CO0FBQ3ZVLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZ0JBQWdCO0FBQUEsTUFDaEIsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLGdEQUFnRDtBQUFBLFFBQy9ELDBCQUEwQixDQUFDLFFBQVE7QUFBQTtBQUFBLE1BQ3JDO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBO0FBQUEsUUFFTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUE7QUFBQSxRQUVSLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMscUJBQVMsVUFBVSw4QkFBOEIsTUFBTTtBQUFBLFVBQ3pELENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
