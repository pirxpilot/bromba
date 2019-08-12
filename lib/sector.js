const { waterfall } = require('async');
const { writeFile, readFile, mkdir } = require('fs');
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

  function readFromFile(file, fn) {
    readFile(file, onread);

    function onread(err, cbuffer) {
      dirty = false;
      if (!err) {
        return uncompress(cbuffer, ondata);
      }
      if (err.code === 'ENOENT') {
        // it's OK if file does not exist yet
        return fn(null, self);
      }
      fn(err);
    }

    function ondata(err, buffer) {
      if (err) {
        return fn(err);
      }
      dirty = false;
      data = buffer;
      fn(err, self);
    }
  }

  function writeToFile(file, fn = () => {}) {
    if (!dirty) {
      return fn(null, self);
    }
    dirty = false;
    waterfall([
      fn => mkdir(dirname(file), { recursive: true }, fn),
      fn => compress(data, fn),
      (b, fn) => writeFile(file, b, fn)
    ], err => {
      if (err) {
        console.error(err);
      }
      fn(err);
    });
  }

  return self;
}
