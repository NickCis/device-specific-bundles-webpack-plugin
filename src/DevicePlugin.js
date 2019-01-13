'use strict';

const path = require('path');
const DeviceModule = require('./DeviceModule');
const DeviceDependency = require('./DeviceDependency');
const DeviceModuleFactoryPlugin = require('./DeviceModuleFactoryPlugin');
const DeviceChunkTemplatePlugin = require('./DeviceChunkTemplatePlugin');
const DeviceOutputPlugin = require('./DeviceOutputPlugin');
const getDeviceModules = require('./getDeviceModules');
const getDeviceChunkName = require('./getDeviceChunkName');

class DevicePlugin {
  constructor({ devices, gdm = getDeviceModules, gdcn = getDeviceChunkName } = {}) {
    this.devices = devices;
    this.getDeviceModules = gdm;
    this.getDeviceChunkName = gdcn;
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

        new DeviceOutputPlugin(this.getDeviceChunkName)
          .apply(compilation);
      }
    );
  }
}

module.exports = DevicePlugin;
