import { defineConfig } from 'tsup'
export default defineConfig({
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    minify: true,
    splitting: false,
    treeshake: true,
    outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
    external: ['@vibecode-db/client', 'zod']
})
