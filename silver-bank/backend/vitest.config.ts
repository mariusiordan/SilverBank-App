import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      JWT_SECRET: 'test-secret-key',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
    },
  },
  server: {
    deps: {
      inline: ['jsonwebtoken', 'bcryptjs'],
    },
  },
});
