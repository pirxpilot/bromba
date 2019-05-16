[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][deps-image]][deps-url]
[![Dev Dependency Status][deps-dev-image]][deps-dev-url]

# bromba

Fast wasteful short buffer disk storage.

## Install

```sh
$ npm install --save bromba
```

## Usage

```js
const bromba = require('bromba');

// all values will have to be 10 bytes Buffers
let db = bromba('/path/to/my/db.dat', { vlen: 10 });

let keys = [2, 3, 4].map(x => Buffer.from([x]));

// keys and values have to be Arrays of Buffer's
db.putMany(keys, values, function(err) {
  // for each key in an keys set corresponding value from values
});


db.getMany(keys, function(err, values) {
  if (err) {
    // something went wrong
  }
  // values for each key from keys
});
```

## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[npm-image]: https://img.shields.io/npm/v/bromba.svg
[npm-url]: https://npmjs.org/package/bromba

[travis-url]: https://travis-ci.com/pirxpilot/bromba
[travis-image]: https://img.shields.io/travis/com/pirxpilot/bromba.svg

[deps-image]: https://img.shields.io/david/pirxpilot/bromba.svg
[deps-url]: https://david-dm.org/pirxpilot/bromba

[deps-dev-image]: https://img.shields.io/david/dev/pirxpilot/bromba.svg
[deps-dev-url]: https://david-dm.org/pirxpilot/bromba?type=dev
