const test = require('node:test');
const assert = require('node:assert/strict');
const { dirSync } = require('tmp');

const bromba = require('../');

test('bromba', async function (t) {
  const { name, removeCallback } = dirSync({
    prefix: 'bromba-',
    unsafeCleanup: true
  });

  const keys = [
    [0, 0, 1, 2, 1],
    [0, 0, 1, 2, 2],
    [0, 0, 1, 2, 3],
    [4, 0, 1, 2, 1],
    [4, 0, 1, 2, 2]
  ].map(Buffer.from);

  const values = [
    [21, 37],
    [22, 36],
    [23, 35],
    [24, 34],
    [25, 33]
  ].map(Buffer.from);


  const b = bromba(name, { vlen: 2 });
  await b.putMany(keys, values);
  await b.close();


  await t.test('getMany', async function () {

    const b = bromba(name, { vlen: 2 });
    const vs = await b.getMany(keys);

    vs.forEach((v, i) => assert.deepEqual(v, values[i], `same value ${i}`));

    await b.close();
  });

  await t.test('getMany with missing key', async function () {

    const b = bromba(name, { vlen: 2 });

    const keys = [
      [0, 0, 1, 2, 1],
      [0, 0, 1, 2, 0], // missing key - existing sector
      [0, 0, 1, 2, 3],
      [0, 9, 1, 2, 0], // missing key - sector does not exist
    ].map(Buffer.from);

    const vs = await b.getMany(keys);

    assert.deepEqual(vs[0], values[0], `same value 0`);
    assert.deepEqual(vs[1], Buffer.alloc(2));
    assert.deepEqual(vs[2], values[2], `same value 2`);
    assert.deepEqual(vs[3], Buffer.alloc(2));

    await b.close();
  });

  removeCallback();
});
