import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['tests/shell/setup-storage.mjs'],
    include: ['tests/**/*.test.mjs'],
  },
});
