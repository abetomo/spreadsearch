'use strict'

const process = require('process')
const Db = require('./db')
const DotDir = require('./dot_dir')
const Ss2json = require('ss2json')
const readline = require('readline')

class Spreadsearch {
  constructor () {
    this.config = null
    this.db = new Db()

    this.dotDir = new DotDir()
    this.ss2json = new Ss2json()
  }

  parseArgs (argv) {
    switch (argv.length) {
      case 3:
        switch (argv[2]) {
          case 'list':
          case 'init':
          case 'clean':
          case 'update':
          case 'console':
          case 'help':
            return ['default', argv[2]]
          case 'search':
            return ['default', 'console']
        }
        return [null, 'help']
      case 4:
        switch (argv[3]) {
          case 'init':
          case 'clean':
          case 'update':
          case 'console':
          case 'help':
            return [argv[2], argv[3]]
          case 'search':
            return [argv[2], 'console']
        }
        if (argv[2] === 'search') {
          return ['default', argv[2], argv[3]]
        }
        return [null, 'help']
      case 5:
        if (argv[3] === 'search') {
          return [argv[2], argv[3], argv[4]]
        }
        return [null, 'help']
    }
    return ['default', 'console']
  }

  init () {
    this.dotDir.init()
  }

  loadConfig (name) {
    try {
      this.config = this.dotDir.loadConfig(name)
      this.db = new Db(this.config)
      return this.config
    } catch (e) {}
    return null
  }

  replaceKey_ (data) {
    const replacement = (() => {
      if (this.config.replacement == null) return {}
      return this.config.replacement
    })()

    return data.map(row => {
      return Object.keys(row).reduce((acc, key) => {
        const getKey = () => {
          if (replacement[key] == null) return key
          return replacement[key]
        }
        acc[getKey().replace(/\s/g, '_')] = row[key]
        return acc
      }, {})
    })
  }

  getSpreadsheetData () {
    try {
      return this.ss2json.convert({
        authJsonPath: this.config.authJsonPath,
        spreadsheetId: this.config.spreadsheetId,
        sheetName: this.config.sheetName
      })
    } catch (e) {
      console.error('An error occurred in spreadsheet reading.')
      console.error(e.message)
      return []
    }
  }

  close () {
    this.db.close()
  }

  dbClean () {
    this.db.clean()
  }

  async dbUpdate () {
    const data = this.replaceKey_(await this.getSpreadsheetData())
    if (!this.db.isTableExists(this.db.config.name)) {
      this.db.init(Object.keys(data[0]))
    }
    this.db.truncate()
    this.db.load(data)
  }

  search (query) {
    return this.db.select(query)
  }

  console () {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Query> '
    })

    rl.prompt()

    rl.on('line', (line) => {
      if (line.trim().length === 0) {
        console.log('\n=== Please enter search query. ===')
        return rl.prompt()
      }
      const output = this.search(line.trim()).result.map((r) => {
        return JSON.stringify(r, null, '  ')
      })
      console.log(`\n=== ${output.length} results ===`)
      console.log(output.join('\n'), '\n')
      rl.prompt()
    }).on('close', () => {
      this.close()
      process.exit(0)
    })
  }
}

module.exports = Spreadsearch
