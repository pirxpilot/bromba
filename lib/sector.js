const { writeFile, readFile, mkdir } = require('fs').promises;
const { dirname } = require('path');
const { compress, uncompress } = require('snappy');

module.exports = sector;

function sector({ vlen }) {

  let data;
  let dirty;

  let self = {
    putValue,
    getValue,
    isDirty,
    size,
    writeToFile,
    readFromFile
  };

  function extendBuffer(lenAfter) {
    const lenNow = data ? data.byteLength : 0;
    if (lenNow >= lenAfter) {
      return;
    }
    let len = lenNow >= 1 ? lenNow : 1;
    while(len < lenAfter) {
      len *= 2;
    }
    let extended = Buffer.alloc(len);
    if (data) {
      data.copy(extended);
    }
    data = extended;
  }

  function putValue(index, value) {
    const start = index * vlen;
    extendBuffer(start + vlen);
    value.copy(data, start, 0, vlen);
    dirty = true;
  }

  function getValue(index) {
    if (!data) {
      // missing - return buffer filled with 0
      return Buffer.alloc(vlen);
    }
    const sourceStart = index * vlen;
    if (sourceStart + vlen > data.byteLength) {
      // invalid index
      return Buffer.alloc(vlen);
    }
    return Buffer.from(data.buffer, sourceStart, vlen);
  }

  function isDirty() {
    return dirty;
  }

  function size() {
    return data ? data.byteLength : 0;
  }

  async function readFromFile(file) {
    try {
      const cbuffer = await readFile(file);
      data = await uncompress(cbuffer);
      dirty = false;
      return self;
    } catch(err) {
      if (err.code === 'ENOENT') {
        // it's OK if file does not exist yet
        return self;
      }
      throw err;
    }
  }

  async function writeToFile(file) {
    if (!dirty) {
      return self;
    }
    dirty = false;
    const [ buffer ] = await Promise.all([
      compress(data),
      mkdir(dirname(file), { recursive: true })
    ]);
    await writeFile(file, buffer);
    return self;
  }

  return self;
}
