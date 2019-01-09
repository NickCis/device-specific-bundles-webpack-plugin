'use strict';

// https://github.com/webpack/webpack/blob/master/lib/dependencies/ImportDependency.js
// https://github.com/webpack/webpack/blob/master/lib/dependencies/AMDRequireDependency.js

const ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');

class DeviceDependency extends ModuleDependency {
  constructor(request, originModule, block) {
    super(request);
    this.originModule = originModule;
    this.block = block;
  }
}

DeviceDependency.Template = class DeviceDependencyTemplate {
  apply(dep, source, runtime) {
    // TODO:
  }
};

module.exports = DeviceDependency;
