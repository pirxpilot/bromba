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

// keys and values have to be Arrays of Buffer's
let keys = [2, 3, 4].map(x => Buffer.from([x]));

// for each key in an keys set corresponding value from values
await db.putMany(keys, values)


// values for each key from keys
const values = await db.getMany(keys);
```

## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[npm-image]: https://img.shields.io/npm/v/bromba
[npm-url]: https://npmjs.org/package/bromba

[build-url]: https://github.com/pirxpilot/bromba/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/workflow/status/pirxpilot/bromba/check

[deps-image]: https://img.shields.io/librariesio/release/npm/bromba
[deps-url]: https://libraries.io/npm/bromba
