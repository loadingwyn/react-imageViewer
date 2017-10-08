const webpack = require('webpack');
const config = require('../../webpack.config');
const os = require('os');
const superstatic = require('superstatic').server;


webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log('Error!');
  }
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
  app.listen(() => {
    console.log(`Demo started on => http://${lookupIpAddress}:8080/demo/mobile`);
  });
});
