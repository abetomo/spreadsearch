#!/usr/bin/env node

'use strict'

const ss = new (require('..'))()
const usage = 'spreadsearch [NAME] init|clean|update'

const [name, type] = (() => {
  switch (process.argv.length) {
    case 3:
      switch (process.argv[2]) {
        case 'init':
        case 'clean':
        case 'update':
        case 'help':
          return ['default', process.argv[2]]
      }
      return [process.argv[2]]
    case 4: return [process.argv[2], process.argv[3]]
  }
  return ['default']
})()

if (type === 'help') {
  console.log(usage)
  process.exit(0)
}

if (type === 'init') {
  ss.init()
  console.log(`Please set the '${ss.dotDir.configPath()}'.`)
  process.exit(0)
}

if (ss.loadConfig(name) == null) {
  console.log(usage)
  console.log(`Please run \`spreadsearch init\` and configure '${ss.dotDir.configPath()}'.`)
  process.exit(1)
}

switch (type) {
  case 'clean':
    ss.dbClean()
    process.exit(0)
  case 'update':
    ss.dbUpdate()
      .then(() => process.exit(0))
      .catch(err => console.error(err))
    break
  default:
    ss.console()
}
