const Chunk = require('webpack/lib/Chunk');
const DeviceModule = require('./DeviceModule');

function copyChunk(name, chunk, device) {
  const newChunk = new Chunk(name);

  newChunk.device = device
  newChunk.id = chunk.id;
  newChunk.ids = [...chunk.ids];
  newChunk.chunkReason = `device chunk ${device} of ${chunk.id}`;
  newChunk.entryModule = chunk.entryModule;
  newChunk.setModules(chunk.modulesIterable);

  for (let group of chunk.groupsIterable)
    newChunk.addGroup(group);

  if (chunk.hasRuntime())
    newChunk.hasRuntime = () => true;

  return newChunk;
}

function addModules(deviceChunk, chunks, device) {
  for (const blockChunk of chunks) {
    for (const module of blockChunk.modulesIterable) {
      deviceChunk.addModule(module);

      if (module instanceof DeviceModule) {
        const deviceBlock = module.blocks.find(b => b.groupOptions.device === device);

        if (deviceBlock) // Prevent circular dependencies?
          addModules(deviceChunk, deviceBlock.chunkGroup.chunks);
      }
    }
  }
}

class DeviceOutputPlugin {
  constructor(getDeviceChunkName) {
    this.getDeviceChunkName = getDeviceChunkName;
  }

  apply(compilation) {
    compilation.hooks.beforeHash.tap(
      'DeviceOutputPlugin',
      () => {
        const createdChunks = new Map();
        const editedChunks = new Map();
        const extraChunks = [];
        const removeChunks = new Set();

        compilation.chunks.forEach(chunk =>  {
          const deviceModules = new Set();
          // 1. Remove child Device chunkGroups
          // -> We really do not want chunks to have the device chunk as a child
          for (const chunkGroup of chunk.groupsIterable) {
            for (const child of chunkGroup.childrenIterable) {
              const origin = child.origins.find(({ module }) => module instanceof DeviceModule);

              if (origin) {
                chunkGroup.removeChild(child)
                deviceModules.add(origin.module);
                child.chunks
                  .forEach(c => removeChunks.add(c));
              }
            }
          }

          if (deviceModules.size > 0) {
            // 2. Create new chunk
            // -> We'll clone chunk and insert the specific device modules
            const deviceChunks = {};

            for (const module of deviceModules) {
              for (const block of module.blocks) {
                const device = block.groupOptions.device;
                const deviceChunk = (
                  deviceChunks[device] =
                    deviceChunks[device]
                    || copyChunk(this.getDeviceChunkName(chunk, device), chunk, device)
                );

                addModules(deviceChunk, block.chunkGroup.chunks, device);
              }
            }

            createdChunks.set(chunk, deviceChunks);
            Object.values(deviceChunks)
              .forEach(c => extraChunks.push(c));

            editedChunks.set(chunk, deviceChunks);
          }
        });

        for (const chunk of extraChunks) {
          // 3. Fix child chunks
          // -> Child chunk mapping (which were deviced) was broken
          // In order to fix unnamed chunks, we've use its id as name
          const fixedAsyncChunks = new Set();
          for (const async of chunk.getAllAsyncChunks()) {
            fixedAsyncChunks.add(
              editedChunks.has(async)
              ? editedChunks.get(async)[chunk.device]
              : async
            )
          }

          chunk.getAllAsyncChunks = () => fixedAsyncChunks;

          // 4. Add created chunks to compilation
          compilation.chunks.push(chunk);
          if (chunk.name)
            compilation.namedChunks.set(chunk.name, chunk);
        }

        // 5. Remove original and subdevice chunks
        compilation.chunks = compilation.chunks
          .filter(c => !(editedChunks.has(c) || removeChunks.has(c)));
      }
    );
  }
}

module.exports = DeviceOutputPlugin;
