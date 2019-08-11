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

    b.close(t.end);
  });
});


test('getMany', function (t) {

  const b = bromba(name, { vlen: 2 });

  b.getMany(keys, function(err, vs) {
    t.error(err);

    vs.forEach((v, i) => t.same(v, values[i], `same value ${i}`));

    b.close(t.end);
  });
});

test('getMany with missing key', function (t) {

  const b = bromba(name, { vlen: 2 });

  const keys = [
    [ 0, 0, 1, 2, 1 ],
    [ 0, 0, 1, 2, 0 ], // missing key - existing sector
    [ 0, 0, 1, 2, 3 ],
    [ 0, 9, 1, 2, 0 ], // missing key - sector does not exist
  ].map(Buffer.from);

  b.getMany(keys, function(err, vs) {
    t.error(err);

    t.same(vs[0], values[0], `same value 0`);
    t.same(vs[1], Buffer.alloc(2));
    t.same(vs[2], values[2], `same value 2`);
    t.same(vs[3], Buffer.alloc(2));

    b.close(t.end);
  });
});

test('cleanup', function(t) {
  removeCallback();
  t.end();
});


