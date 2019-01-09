'use strict';
// https://github.com/webpack/webpack/blob/master/lib/ExternalModule.js
const path = require('path');
const Module = require("webpack/lib/Module");
const ImportDependenciesBlock = require("webpack/lib/dependencies/ImportDependenciesBlock");
const DeviceDependenciesBlock = require('./DeviceDependenciesBlock');

class DeviceModule extends Module {
  constructor(devices, context, dependency) {
    super("javascript/dynamic", context);
    this.devices = devices;
    this.originalDependency = dependency;

    const name = path.relative(process.cwd(), path.join(context, dependency.request));
    this._identifier = `device ./${name}`;
    this.name = name.replace(/[/ ]/g, '-');
  }

  build(options, compilation, resolver, fs, callback) {
    this.built = true;
    this.buildInfo = {};
    this.buildMeta = {};

    // const loaderContext = {};
    // compilation.hooks.normalModuleLoader.call(loaderContext, this)
    // this.target = loaderContext.target;

    this.devices.map(device => {
      // https://github.com/webpack/webpack/blob/master/lib/dependencies/ImportDependenciesBlock.js
      // https://github.com/webpack/webpack/blob/master/lib/DependenciesBlock.js
      // https://github.com/webpack/webpack/blob/master/lib/dependencies/ImportDependency.js
      const block = new DeviceDependenciesBlock(
        { name: this.name.replace('.APP_TARGET', `.${device}`), device },
        this, // module
        this.originalDependency.loc, // loc
        this.originalDependency.request.replace('.APP_TARGET', `.${device}`), // request
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
    // console.log('this.blocks[0].dependencies', this.blocks[0].dependencies);
    // console.log('dependencyTemplates', dependencyTemplates);
    // console.log('runtime', runtime.constructor.name);
    // console.log('this.target', this.target);
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
