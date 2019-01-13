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
        const [isDeviced, modules] = await this.getDeviceModules(this.devices, data, normalModuleFactory);
        const dependency = data.dependencies[0];

        if (isDeviced && !(dependency instanceof DeviceDependency)) {
          callback(null, new DeviceModule(modules, data.context, data.dependencies[0]));
        } else {
          factory(data, callback);
        }
      }
    );
  }
}

module.exports = DeviceModuleFactoryPlugin;
