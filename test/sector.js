const test = require('node:test');
const assert = require('node:assert/strict');
const { dirSync } = require('tmp');

const sector = require('../lib/sector');

const a = Buffer.from([0, 200]);
const b = Buffer.from([0, 200]);
const c = Buffer.from([0, 200]);

test('memory sector', function () {
  const s = sector({ vlen: 2 });

  s.putValue(0, a);
  s.putValue(50, b);
  s.putValue(140, c);


  assert.deepEqual(s.getValue(0), a);
  assert.deepEqual(s.getValue(50), b);
  assert.deepEqual(s.getValue(140), c);
});


test('disk sector', async function (t) {

  let { name, removeCallback } = dirSync({
    prefix: 'bromba-',
    unsafeCleanup: true
  });
  name += '/ds/data.dat';


  const s = sector({ vlen: 2 });
  s.putValue(0, a);
  s.putValue(50, b);
  s.putValue(140, c);

  await s.writeToFile(name);


  await t.test('read', async function () {
    const s = sector({ vlen: 2 });

    const s1 = await s.readFromFile(name);
    assert.deepEqual(s1, s);

    assert.deepEqual(s.getValue(0), a);
    assert.deepEqual(s.getValue(50), b);
    assert.deepEqual(s.getValue(140), c);
  });

  removeCallback();

});
