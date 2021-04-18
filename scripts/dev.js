const webpack = require('webpack');
const config = require('../webpack.config');
const os = require('os');
const superstatic = require('superstatic').server;

const compiler = webpack({
  ...config,
  mode: 'development',
  entry: './demo/demo.tsx',
  externals: [],
});
const ifaces = os.networkInterfaces();
let lookupIpAddress = null;

Object.values(ifaces).forEach(item => {
  const target = item.find(details => details.family === 'IPv4');
  if (target) {
    lookupIpAddress = target.address;
  }
});
const app = superstatic({
  host: lookupIpAddress,
  port: 8080,
});
compiler.watch(
  {
    // Example [watchOptions](/configuration/watch/#watchoptions)
    aggregateTimeout: 300,
    poll: undefined,
  },
  (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    // Log result..
  },
);

app.listen(() => {
  console.log(`Demo started on => http://${lookupIpAddress}:8080/demo`);
});
