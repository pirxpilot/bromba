[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

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

[npm-image]: https://img.shields.io/npm/v/bromba
[npm-url]: https://npmjs.org/package/bromba

[build-url]: https://github.com/pirxpilot/bromba/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/workflow/status/pirxpilot/bromba/check

[deps-image]: https://img.shields.io/librariesio/release/npm/bromba
[deps-url]: https://libraries.io/npm/bromba

