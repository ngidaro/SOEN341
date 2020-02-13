'use strict';

const mongoose = require('mongoose');
const tunnel = require('tunnel-ssh');

const _connect = mongoose.connect;

const tunnelPromise = sshTunnelConfig => {
  return new Promise((resolve, reject) => {
    tunnel(sshTunnelConfig, (error, server) => {
      if (error) {
        reject(error);
      } else {
        resolve(server);
      }
    });
  });
};

mongoose.connect = async (sshTunnelConfig, ...args) => {
  try {
    if (sshTunnelConfig && !mongoose.sshTunnel) {
      mongoose.sshTunnel = await tunnelPromise(sshTunnelConfig);
    }
    return _connect(...args);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose;
