const esbuild = require('esbuild');
const path = require('path');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('./package.json'));

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];
esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outdir: 'lib',
    bundle: true,
    sourcemap: true,
    format: 'esm',
    target: ['esnext'],
    external,
  })
  .catch(() => process.exit(1));
