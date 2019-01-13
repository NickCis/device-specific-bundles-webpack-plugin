'use strict';

const path = require('path');
const DeviceModule = require('./DeviceModule');
const DeviceDependency = require('./DeviceDependency');

class DeviceModuleFactoryPlugin {
  constructor(devices, getDeviceModules) {
    this.devices = devices;
    this.getDeviceModules = getDeviceModules;
  }

  apply(normalModuleFactory) {
    normalModuleFactory.hooks.factory.tap(
      'DevicePlugin',
      factory => async (data, callback) => {
        const dependency = data.dependencies[0];

        if (!(dependency instanceof DeviceDependency)) {
          const [isDeviced, modules] = await this.getDeviceModules(this.devices, data, normalModuleFactory);

          if (isDeviced) {
            callback(null, new DeviceModule(modules, data.context, data.dependencies[0]));
            return;
          }
        }

        factory(data, callback);
      }
    );
  }
}

module.exports = DeviceModuleFactoryPlugin;
