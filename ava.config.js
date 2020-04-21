export default {
  // test fileに対するpath
  files: ['test/**/*.test.{js,jsx,ts,tsx}'],
  extensions: ['ts'],
  cache: true,
  concurrency: 5,
  failFast: true,
  failWithoutAssertions: true,
  verbose: true,
  require: ['ts-node/register', 'tsconfig-paths/register'],
  environmentVariables: {
    TS_NODE_PROJECT: './test/tsconfig.json',
  },
}
