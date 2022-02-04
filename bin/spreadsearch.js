#!/usr/bin/env node

'use strict'

const process = require('process')
const ss = new (require('..'))()
const usage = `spreadsearch [NAME] init|clean|update|console
spreadsearch [NAME] search QUERY
spreadsearch list`

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
  case 'list':
    console.log('List of names >>>')
    console.log(
      Object.keys(ss.dotDir.loadAllConfigs())
        .map(name => `* ${name}`)
        .join('\n')
    )
    process.exit(0)
  case 'clean':
    ss.dbClean()
    process.exit(0)
  case 'update':
    ;(async () => {
      try {
        await ss.dbUpdate()
        process.exit(0)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    })()
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
