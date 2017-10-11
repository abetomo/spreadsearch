#!/usr/bin/env node

'use strict'

const ss = new (require('..'))()
const usage = `spreadsearch [NAME] init|clean|update|console
spreadsearch [NAME] search QUERY`

const [name, type, query] = ss.parseArgs(process.argv)

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
    console.log(JSON.stringify(ss.search(query), null, '  '))
    process.exit(0)
  default:
    console.log(usage)
    process.exit(1)
}
