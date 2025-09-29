import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    // main entry
    index: 'src/index.ts',
    // adapter subpaths (must mirror package.json "exports" keys)
    'adapters/supabase/index': 'src/adapters/supabase/index.ts',
    'adapters/fake/index': 'src/adapters/fake/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  splitting: false,
  minify: true,
  treeshake: true,
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' }
  }
})
