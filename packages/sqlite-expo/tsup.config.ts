import { defineConfig } from 'tsup'
export default defineConfig({
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    splitting: false,
    treeshake: true,
    minify: true,
    outExtension({ format }) {
        return { js: format === 'esm' ? '.mjs' : '.cjs' }
    },
    external: ['@vibecode-db/client', '@vibecode-db/sqlite-core', 'expo-sqlite']
})
