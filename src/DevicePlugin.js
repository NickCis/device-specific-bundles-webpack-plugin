const path = require('path');
const DeviceModule = require('./DeviceModule');
const DeviceDependency = require('./DeviceDependency');
const DeviceModuleFactoryPlugin = require('./DeviceModuleFactoryPlugin');
const DeviceChunkTemplatePlugin = require('./DeviceChunkTemplatePlugin');
const DeviceOutputPlugin = require('./DeviceOutputPlugin');

class Plugin {
  constructor(devices) {
    this.devices = devices;
  }

  apply(compiler) {
    compiler.hooks.compile.tap('DevicePlugin', ({ normalModuleFactory }) => {
      new DeviceModuleFactoryPlugin(this.devices)
        .apply(normalModuleFactory);
    });

    /*compiler.hooks.thisCompilation.tap(
      'DevicePlugin',
      compilation => {
         compilation.hooks.recordChunks.tap(
          'DevicePlugin',
          (chunks, records) => {
            console.log('----- RecordChunks');
            console.log('chunks', chunks);
            console.log('records', records);
            chunks.slice();
          }
        );
      }
    );*/

    compiler.hooks.compilation.tap(
      'DevicePlugin',
      (compilation, { normalModuleFactory }) => {

        compilation.dependencyFactories.set(
          DeviceDependency,
          normalModuleFactory
        );

        // new DeviceChunkTemplatePlugin()
        //   .apply(compilation.chunkTemplate);

        new DeviceOutputPlugin()
          .apply(compilation);
      }
    );

    /*
    // Rewrite output
    compiler.hooks.emit.tap('Plugin', compilation => {
      // console.log('compilation.modules', compilation.modules);
      // console.log('compilation.assets', compilation.assets);
      const deviceModules = compilation.modules
        .filter(m => m instanceof DeviceModule);
      const assets = compilation.assets;
      compilation.assets = {};

      // Hay una manera mas linda de saber que assets requiere?, Capaz usar chunks en vez de assets?
      Object.entries(assets)
        .forEach(([name, entry]) => {
          if (name.endsWith('.js')) {
            const source = entry.source();
            const [, filename, ext] = name.match(/^(.*?)\.js$/);
            const modules = {};

            deviceModules.forEach(module => {
              if (source.includes(` = ${module.name};`)) {
                Object.entries(module.output)
                  .forEach(([device, output]) => {
                    if (!modules[device])
                      modules[device] = [];
                    modules[device].push(output);
                  });
              }
            });

            if (Object.keys(modules).length) {
              Object.entries(modules)
                .forEach(([device, extras]) => {
                  const newSource = [...extras, source].join('\n');
                  compilation.assets[`${filename}.${device}.js`] = {
                    source: () => newSource,
                    size: () => Buffer.byteLength(newSource, 'utf8')
                  };
                });
              return;
            }
          }

          compilation.assets[name] = entry;
        });
      // console.log('chunks', compilation.chunks);
      // console.log('is in chunk?', deviceModules[0].isInChunk(compilation.chunks[0]));
      // console.log('deviceModules[0].getChunks()', deviceModules[0].getChunks());
    });
    */
  }
}

module.exports = Plugin;
