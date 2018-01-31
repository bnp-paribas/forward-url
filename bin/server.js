#!/usr/bin/env node
const logger = require('../lib/logger')(1000, console)
const serverModule = require('../lib/server')(logger)
serverModule.init(3000, () => {})
