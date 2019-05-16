const test  = require('tape');
const { dirSync } = require('tmp');

const bromba = require('../');

const { name, removeCallback } = dirSync({
  prefix: 'bromba-',
  // unsafeCleanup: true
});

const keys = [
  [ 0, 0, 1, 2, 1 ],
  [ 0, 0, 1, 2, 2 ],
  [ 0, 0, 1, 2, 3 ],
  [ 4, 0, 1, 2, 1 ],
  [ 4, 0, 1, 2, 2 ]
].map(Buffer.from);

const values = [
  [ 21, 37 ],
  [ 22, 36 ],
  [ 23, 35 ],
  [ 24, 34 ],
  [ 25, 33 ]
].map(Buffer.from);

test('putMany', function (t) {

  const b = bromba(name, { vlen: 2 });

  b.putMany(keys, values, function(err) {
    t.error(err);

    b.close();
    // close does not have callback - wait for disk write
    setTimeout(t.end, 300);
  });
});


test('getMany', function (t) {

  const b = bromba(name, { vlen: 2 });

  b.getMany(keys, function(err, vs) {
    t.error(err);

    vs.forEach((v, i) => t.same(v, values[i], `same value ${i}`));

    b.close();
    t.end();
  });
});


test('cleanup', function(t) {
  removeCallback();
  t.end();
});
