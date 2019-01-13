'use strict';

const path = require('path');

async function getDeviceModules(devices, data, normalModuleFactory) {
  const resolver = normalModuleFactory.getResolver('normal', data.resolveOptions);
  const { root, dir, name, ext } = path.parse(data.request);
  const resolutions = {};
  let hasReplaced = false;

  await Promise.all(devices.map(device => {
    const request = path.format({
      root,
      dir,
      name,
      ext: `.${device}${ext}`
    });

    return new Promise(rs => {
      resolver.resolve(data.contextInfo, data.context, request, {}, err => {
        if (!err)
          hasReplaced = true;
        resolutions[device] = err ? data.request : request;

        rs();
      });
    });
  }));

  return [hasReplaced, resolutions];
}

module.exports = getDeviceModules;
