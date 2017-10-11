#!/usr/bin/env node

'use strict'

const ss = new (require('..'))()
const usage = `spreadsearch [NAME] init|clean|update|console
spreadsearch [NAME] search QUERY`

const [name, type, query] = (() => {
  switch (process.argv.length) {
    case 3:
      switch (process.argv[2]) {
        case 'init':
        case 'clean':
        case 'update':
        case 'console':
        case 'help':
          return ['default', process.argv[2]]
      }
      return [process.argv[2]]
    case 4:
      switch (process.argv[3]) {
        case 'init':
        case 'clean':
        case 'update':
        case 'console':
        case 'help':
          return [process.argv[2], process.argv[3]]
      }
      if (process.argv[2] == 'search') {
        return ['default', process.argv[2], process.argv[3]]
      }
    case 5:
      if (process.argv[3] == 'search') {
        return [process.argv[2], process.argv[3], process.argv[4]]
      }
  }
  return ['default', 'console']
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
  case 'console':
    ss.console()
    break
  case 'search':
    console.log(ss.search(query))
    process.exit(0)
  default:
    console.log(usage)
    process.exit(1)
}
