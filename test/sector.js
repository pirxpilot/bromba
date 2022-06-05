const test = require('tape');
const { dirSync } = require('tmp');

const sector = require('../lib/sector');

const a = Buffer.from([0, 200]);
const b = Buffer.from([0, 200]);
const c = Buffer.from([0, 200]);

test('memory sector', function (t) {
  const s = sector({ vlen: 2 });

  s.putValue(0, a);
  s.putValue(50, b);
  s.putValue(140, c);


  t.same(s.getValue(0), a);
  t.same(s.getValue(50), b);
  t.same(s.getValue(140), c);

  t.end();
});


test('disk sector', function (t) {

  let { name, removeCallback } = dirSync({
    prefix: 'bromba-',
    unsafeCleanup: true
  });
  name += '/ds/data.dat';


  t.teardown(removeCallback);

  t.test('write', async function () {
    const s = sector({ vlen: 2 });

    s.putValue(0, a);
    s.putValue(50, b);
    s.putValue(140, c);

    await s.writeToFile(name);
  });


  t.test('read', async function (t) {
    const s = sector({ vlen: 2 });

    const s1 = await s.readFromFile(name);
    t.same(s1, s);

    t.same(s.getValue(0), a);
    t.same(s.getValue(50), b);
    t.same(s.getValue(140), c);
  });
});
