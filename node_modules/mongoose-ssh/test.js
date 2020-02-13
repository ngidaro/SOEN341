'use strict';

const fs = require('fs');
const test = require('ava');
const mongoose = require('.');

require('dotenv').load();

const host = process.env.SSH_SERVER_HOST;
const port = process.env.SSH_SERVER_PORT;
const dstHost = process.env.DESTINATION_HOST;
const dstPort = process.env.DESTINATION_PORT;
const localHost = process.env.LOCAL_HOST;
const localPort = process.env.LOCAL_PORT;
const username = process.env.SSH_USERNAME;
const privateKey = fs.readFileSync(process.env.SSH_KEY_FILE);

const mongodbUri = process.env.MONGODB_URI;

const sshTunnelConfig = {username, privateKey, host, port, dstHost, dstPort, localHost, localPort};

test.serial('connect', async t => {
  try {
    await mongoose.connect(sshTunnelConfig, mongodbUri, {useNewUrlParser: true});
    t.pass();
  } catch (error) {
    t.fail([error]);
  }
});

test.serial('connect again', async t => {
  try {
    await mongoose.connect(sshTunnelConfig, mongodbUri, {useNewUrlParser: true});
    t.pass();
  } catch (error) {
    t.fail([error]);
  }
});

test.serial('multiple connect attemps', async t => {
  try {
    await mongoose.connect(sshTunnelConfig, mongodbUri, {useNewUrlParser: true});
    await mongoose.connect(sshTunnelConfig, mongodbUri, {useNewUrlParser: true});
    t.pass();
  } catch (error) {
    t.fail([error]);
  }
});

test.serial('multiple connections', async t => {
  try {
    await mongoose.connect(sshTunnelConfig, mongodbUri, {useNewUrlParser: true});
    const conn1 = mongoose.createConnection(mongodbUri, {useNewUrlParser: true});
    await conn1.startSession();
    const conn2 = mongoose.createConnection(mongodbUri, {useNewUrlParser: true});
    await conn2.startSession();
    t.pass();
  } catch (error) {
    t.fail();
  }
});
