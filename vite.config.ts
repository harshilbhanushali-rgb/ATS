import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
    const frontendRoot = path.resolve(__dirname, 'frontend');
    const frontendSrc = path.resolve(frontendRoot, 'src');
    return {
      root: frontendRoot,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': frontendSrc,
        }
      }
    };
});
