#!/usr/bin/env node

'use strict'

const ss = new (require('..'))()

if (process.argv[2] === 'init') {
  ss.init()
  console.log(`Please set the '${ss.dotDir.configPath()}'.`)
  process.exit(0)
}

if (ss.loadConfig() == null) {
  console.log(`Please run \`spreadsearch init\` and configure '${ss.dotDir.configPath()}'.`)
  process.exit(1)
}

switch (process.argv[2]) {
  case 'dataClean':
    ss.dbClean()
    process.exit(0)
  case 'dataUpdate':
    ss.dbUpdate()
      .then(() => process.exit(0))
      .catch(err => console.error(err))
    break
  default:
    ss.console()
}
