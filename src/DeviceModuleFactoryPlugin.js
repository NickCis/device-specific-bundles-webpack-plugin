const path = require('path');
const DeviceModule = require('./DeviceModule');

class DeviceModuleFactoryPlugin {
  constructor(devices) {
    this.devices = devices;
  }

  apply(normalModuleFactory) {
    normalModuleFactory.hooks.factory.tap(
      'DevicePlugin',
      factory => (data, callback) => {
        if (data.request.includes('.APP_TARGET')) {
          // console.log('<---------factory hooks');
          // console.log('data', data);
          const dependency = data.dependencies[0];
          // console.log('typeof dependency', dependency.constructor.name);
          // console.log('dependency', dependency);
          // console.log('dependency.request', dependency.request);
          // console.log('dependency.getResourceIdentifier()', dependency.getResourceIdentifier());
          // console.log('dependency.loc', dependency.loc);
          // console.log('dependency.range', dependency.range);

          // console.log('> ------- relative', relative);

          // const fullPath = path.resolve(data.context, data.request).replace('.APP_TARGET', '');
          // const relative = path.relative(this.context, fullPath);
          // const name = `plugin_${relative.replace(/\//g, '_')}`;
          const module = new DeviceModule(this.devices, data.context, dependency);
          // console.log('module', module);
          return callback(null, module);
        }

        factory(data, (err, module) => {
          // console.log('<---------factory hooks');
          // console.log('data', data);
          // console.log('err', err);
          // console.log('module', module);
          callback(err, module);
        });
      }
    );
  }
}

module.exports = DeviceModuleFactoryPlugin;
