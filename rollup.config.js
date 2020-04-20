import * as path from 'path'
import typescript from '@rollup/plugin-typescript'
import autoExternal from 'rollup-plugin-auto-external'

const base = path.resolve(__dirname)
const tsconfig = path.join(base, 'tsconfig.json')

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      dir: 'dist',
      entryFileNames: '[name].module.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  context: 'this',
  plugins: [
    autoExternal({
      builtins: false,
      packagePath: path.resolve('./package.json'),
    }),
    typescript({
      tsconfig,
      // [Issue #287 · rollup/plugins](https://github.com/rollup/plugins/issues/287)
      rootDir: './src',
    }),
  ],
}
