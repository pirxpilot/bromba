const async = require('async');
const asyncCache = require('async-cache');

const sector = require('./sector');

module.exports = bromba;

function keyToLocation(key) {
  let d1 = key.readUInt8(0).toString(16).padStart(2, 0);
  let d2 = key.readUInt8(1).toString(16).padStart(2, 0);

  let index = 0 ;
  for(let i = 2; i < key.byteLength; i++) {
    index *= 16;
    index += key.readUInt8(i);
  }

  return {
    name: `${d1}/${d2}.dat`,
    index
  };
}

function bromba(path, { vlen }) {
  const cache = asyncCache({
    max:1000,
    maxAge: Infinity,
    load: loadSectorFromDisk,
    dispose: flushSector
  });

  function nameToFile(name) {
    return `${path}/${name}`;
  }

  function loadSectorFromDisk(name, fn) {
    let file = nameToFile(name);
    let s = sector({ vlen });
    s.readFromFile(file, fn);
  }

  function flushSector(name, s, fn) {
    let file = nameToFile(name);
    s.writeToFile(file, fn);
  }

  function putOne(key, value, fn) {
    const { name, index } = keyToLocation(key);
    cache.get(name, function(err, sector) {
      if (!err) {
        sector.putValue(index, value);
      }
      fn(err);
    });
  }

  function putMany(keys, values, fn) {
    async.eachOf(keys, (k, i, fn) => putOne(k, values[i], fn), fn);
  }

  function getOne(key, fn) {
    const { name, index } = keyToLocation(key);
    cache.get(name, function(err, sector) {
      if(err) { return fn(err); }
      fn(null, sector.getValue(index));
    });
  }

  function getMany(keys, fn) {
    async.map(keys, getOne, fn);
  }

  function open(fn = () => {}) {
    // nothing to do on open
    fn();
  }

  function close(fn = () => {}) {
    async.each(
      cache.keys(),
      (name, fn) => flushSector(name, cache.peek(name), fn),
      err => {
        cache.reset();
        fn(err);
      }
    );
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
