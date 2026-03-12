import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/adapters/mock/index.ts',
    'src/adapters/supabase/index.ts',
    'src/adapters/pocketbase/index.ts',
    'src/adapters/rest/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  target: 'es2022',
  outDir: 'dist',
  treeshake: true,
});
