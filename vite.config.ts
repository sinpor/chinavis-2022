import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import WindiCSS from 'vite-plugin-windicss';

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [react(), WindiCSS()],
  server: {
    proxy: {
      // 正则表达式写法
      '/api/': {
        target: 'http://chinavis2022.vaiwan.com/',
        // target: 'http://10.170.47.171:5000/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
