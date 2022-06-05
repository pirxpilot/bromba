const LRU = require('lru-cache');

const sector = require('./sector');

module.exports = bromba;

function keyToLocation(key) {
  let d1 = key[0].toString(16).padStart(2, 0);
  let d2 = key[1].toString(16).padStart(2, 0);

  let index = 0;
  for (let i = 2; i < key.byteLength; i++) {
    index *= 16;
    index += key[i];
  }

  return {
    name: `${d1}/${d2}.dat`,
    index
  };
}

function bromba(path, { vlen, max = 10 * 1024 * 1024}) {
  const cache = new LRU({
    max,
    fetchMethod: loadSectorFromDisk,
    dispose: flushSector
  });
  let closing = false;

  function nameToFile(name) {
    return `${path}/${name}`;
  }

  function loadSectorFromDisk(name) {
    const file = nameToFile(name);
    const s = sector({ vlen });
    return s.readFromFile(file);
  }

  async function flushSector(v, name) {
    if (closing) {
      // if we are closing all sectors are flushed already
      return;
    }
    const file = nameToFile(name);
    const s = await v;
    return s.writeToFile(file);
  }

  async function putOne(key, value) {
    const { name, index } = keyToLocation(key);
    const sector = await cache.fetch(name);
    return sector.putValue(index, value);
  }

  function putMany(keys, values) {
    return Promise.all(keys.map((k, i) => putOne(k, values[i])));
  }

  async function getOne(key) {
    const { name, index } = keyToLocation(key);
    const sector = await cache.fetch(name);
    return sector.getValue(index);
  }

  function getMany(keys) {
    return Promise.all(keys.map(getOne));
  }

  function open() {
  }

  async function close() {
    const flushTasks = Array
      .from(cache.entries())
      .map(([k, v]) => flushSector(v, k));
    await Promise.all(flushTasks);
    closing = true;
    cache.clear();
    closing = false;
  }

  return {
    putOne,
    putMany,
    getOne,
    getMany,
    open,
    close
  };
}
