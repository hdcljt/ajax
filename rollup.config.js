import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/ajax.esm.js',
      format: 'es',
      exports: 'named'
    },
    {
      file: 'lib/ajax.min.js',
      format: 'es',
      exports: 'named',
      plugins: [terser()]
    }
  ],
  plugins: [typescript()]
}
