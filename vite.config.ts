import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {
    plugins: ['typescript'],
    options: { typeAware: true, typeCheck: true },
    overrides: [{ files: ['**/*.test.ts'], plugins: ['vitest'] }],
  },
  fmt: {
    singleQuote: true,
    semi: true,
  },
});
