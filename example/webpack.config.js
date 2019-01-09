const DevicePlugin = require('..');

module.exports = {
  mode: 'production',
  target: 'node',
  optimization: {
    minimize: false,
  },
  plugins: [
    new DevicePlugin([
      'desktop',
      'mobile'
    ]),
  ]
};
