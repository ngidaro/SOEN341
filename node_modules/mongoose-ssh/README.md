# Mongoose-Ssh

Mongoose through ssh tunnel.

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

### Install

```
npm install --save mongoose-ssh
```

### Usage

```js
const mongoose = require('mongoose-ssh');

mongoose.connect(
  {
    host: 'ssh-server-host',
    port: 'ssh-server-port',
    dstHost: 'destination-host',
    dstPort: 'destination-port',
    localHost: 'local-host',
    localPort: 'local-port',
    username: 'ssh-username',
    privateKey: 'ssh-private-key'
  },
  'mongodb://dbUsernam:dbPassword@localhost/dbname'
);
``` 

See `test.js` for more details.

### License

MIT

### References

* [tunnel-ssh](https://github.com/agebrock/tunnel-ssh)
