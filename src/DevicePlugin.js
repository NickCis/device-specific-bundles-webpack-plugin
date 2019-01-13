'use strict';

const path = require('path');
const DeviceModule = require('./DeviceModule');
const DeviceDependency = require('./DeviceDependency');
const DeviceModuleFactoryPlugin = require('./DeviceModuleFactoryPlugin');
const DeviceChunkTemplatePlugin = require('./DeviceChunkTemplatePlugin');
const DeviceOutputPlugin = require('./DeviceOutputPlugin');
const getDeviceModules = require('./getDeviceModules');

class DevicePlugin {
  constructor({ devices, gdm = getDeviceModules } = {}) {
    this.devices = devices;
    this.getDeviceModules = gdm;
  }

  apply(compiler) {
    compiler.hooks.compile.tap('DevicePlugin', ({ normalModuleFactory }) => {
      new DeviceModuleFactoryPlugin(this.devices, this.getDeviceModules)
        .apply(normalModuleFactory);
    });

    compiler.hooks.compilation.tap(
      'DevicePlugin',
      (compilation, { normalModuleFactory }) => {

        compilation.dependencyFactories.set(
          DeviceDependency,
          normalModuleFactory
        );

        new DeviceOutputPlugin()
          .apply(compilation);
      }
    );
  }
}

module.exports = DevicePlugin;
