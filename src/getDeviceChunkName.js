'use strict';

function getDeviceChunkName(chunk, device) {
  return `${chunk.name || chunk.id}.${device}`;
}

module.exports = getDeviceChunkName;
