const webpack = require('webpack');
const config = require('../../webpack.config');
const os = require('os');
const superstatic = require('superstatic').server;

const compiler = webpack(config);
const ifaces = os.networkInterfaces();
let lookupIpAddress = null;

Object.values(ifaces).forEach(item => {
  item.forEach(details => {
    if (details.family === 'IPv4') {
      lookupIpAddress = details.address;
    }
  });
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
  }
});

app.listen(() => {
  console.log(`Demo started on => http://${lookupIpAddress}:8080/demo/mobile`);
});
