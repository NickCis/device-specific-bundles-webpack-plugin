'use strict';
// https://github.com/webpack/webpack/blob/master/lib/ExternalModule.js
const path = require('path');
const Module = require('webpack/lib/Module');
const ImportDependenciesBlock = require('webpack/lib/dependencies/ImportDependenciesBlock');
const DeviceDependenciesBlock = require('./DeviceDependenciesBlock');

class DeviceModule extends Module {
  constructor(modules, context, dependency) {
    super('javascript/dynamic', context);
    this.originalDependency = dependency;

    const name = path.relative(process.cwd(), path.join(context, dependency.request));
    this._identifier = `device ./${name}`;
    this.name = name.replace(/[/ ]/g, '-');
    this.deviceModules = modules;
  }

  build(options, compilation, resolver, fs, callback) {
    this.built = true;
    this.buildInfo = {};
    this.buildMeta = {};

    Object.entries(this.deviceModules)
      .forEach(([device, request]) => {
        // https://github.com/webpack/webpack/blob/master/lib/dependencies/ImportDependenciesBlock.js
        // https://github.com/webpack/webpack/blob/master/lib/DependenciesBlock.js
        // https://github.com/webpack/webpack/blob/master/lib/dependencies/ImportDependency.js
        const block = new DeviceDependenciesBlock(
          { name: `${device}:${this.name}`, device },
          this, // module
          this.originalDependency.loc, // loc
          request,
          this // originModule
        );
        this.addBlock(block);
      });

    callback();
  }

  identifier() {
    return this._identifier;
  }

  readableIdentifier() {
    return this.identifier();
  }

  // https://github.com/webpack/webpack/blob/master/lib/ExternalModule.js
  source(dependencyTemplates, runtime) {
    // https://github.com/webpack/webpack/blob/master/lib/RuntimeTemplate.js
    return `
var ids = ${JSON.stringify(this.blocks.map(b => b.dependencies[0].module.id))};
for (var i=0;i<ids.length;i++) {
  if(__webpack_require__.m[ids[i]]) {
    module.exports = __webpack_require__(ids[i]);
    break;
  }
}
    `.trim();
    // return `module.exports = ${this.name}(__webpack_require__)`;
  }

  size() {
    return 42;
  }
}

module.exports = DeviceModule;
