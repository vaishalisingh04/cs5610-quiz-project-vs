// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   server: {
//     proxy: {
//       '/api': {
//         target: "http://localhost:4000",
//         changeOrigin: true,
//       },
//     },
//   },
// });
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 如果你用 React 的话

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
