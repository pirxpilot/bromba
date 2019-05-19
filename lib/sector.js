const { series } = require('async');
const { writeFile, readFile, mkdir } = require('fs');
const { dirname } = require('path');

module.exports = sector;

function sector({ vlen }) {

  let data;
  let dirty;

  let self = {
    putValue,
    getValue,
    isDirty,
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
    const sourceStart = index * vlen;
    if (sourceStart + vlen > data.byteLength) {
      // invalid index
      return;
    }
    return Buffer.from(data.buffer, sourceStart, vlen);
  }

  function isDirty() {
    return dirty;
  }

  function readFromFile(file, fn) {
    readFile(file, function(err, buffer) {
      dirty = false;
      if (err && err.code === 'ENOENT') {
        // it's OK if file does not exist yet
        err = null;
      }
      data = buffer;
      fn(err, self);
    });
  }

  function writeToFile(file, fn = () => {}) {
    if (!dirty) {
      return fn(null, self);
    }
    dirty = false;
    series([
      fn => mkdir(dirname(file), { recursive: true }, fn),
      fn => writeFile(file, data, fn)
    ], err => {
      if (err) {
        console.error(err);
      }
      fn(err);
    });
  }

  return self;
}
