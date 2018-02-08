#!/usr/bin/env node

// ignore self signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv()
const logger = require('../lib/logger')(1000, console)
const serverModule = require('../lib/server')(logger)
serverModule.init(appEnv.port, () => {logger.log(`server startin on ${appEnv.url}`)})
