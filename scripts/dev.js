const webpack = require('webpack');
const config = require('../webpack.config');
const os = require('os');
const superstatic = require('superstatic').server;

Object.assign(config, {
  mode: 'development',
  entry: './demo/demo.js',
  externals: [],
});
const compiler = webpack(config);
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
compiler.watch({
  // Example watchOptions
  aggregateTimeout: 300,
  poll: undefined,
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log('Error!');
    if (err && err.details) {
      console.error(err.details);
    }
  }
});

app.listen(() => {
  console.log(`Demo started on => http://${lookupIpAddress}:8080/demo`);
});
