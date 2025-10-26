import { defineConfig } from 'tsup'
export default defineConfig({
    entry: {
        index: 'src/index.ts', 'adapters/supabase/index': 'src/adapters/supabase/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    splitting: false,
    treeshake: true,
    minify: true,

    outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
    external: ['@supabase/supabase-js', 'zod']
})
