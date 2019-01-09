'use strict';
// https://github.com/webpack/webpack/blob/master/lib/AsyncDependenciesBlock.js
// https://github.com/webpack/webpack/blob/master/lib/dependencies/ImportDependenciesBlock.js
// https://github.com/webpack/webpack/blob/master/lib/dependencies/AMDRequireDependenciesBlock.js

const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const DeviceDependency = require('./DeviceDependency');

class DeviceDependenciesBlock extends AsyncDependenciesBlock {
  constructor(groupOptions, module, loc, request, originalModule) {
    super(groupOptions, module, loc, request);
    const dep = new DeviceDependency(request, originalModule, this);
    dep.loc = loc;

    this.addDependency(dep);
  }
}

module.exports = DeviceDependenciesBlock;
