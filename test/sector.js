const test  = require('tape');
const { dirSync } = require('tmp');

const sector = require('../lib/sector');

const a = Buffer.from([ 0, 200 ]);
const b = Buffer.from([ 0, 200 ]);
const c = Buffer.from([ 0, 200 ]);

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

  t.test('write', function (t) {
    const s = sector({ vlen: 2 });

    s.putValue(0, a);
    s.putValue(50, b);
    s.putValue(140, c);

    s.writeToFile(name, t.end);
  });


  t.test('read', function (t) {
    const s = sector({ vlen: 2 });

    s.readFromFile(name, function(err, s1) {
      t.error(err);
      t.same(s1, s);

      t.same(s.getValue(0), a);
      t.same(s.getValue(50), b);
      t.same(s.getValue(140), c);
      t.end();
    });
  });

  t.test('cleanup', function(t) {
    removeCallback();
    t.end();
  });

});
