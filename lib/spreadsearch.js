'use strict'

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
      const obj = {}
      Object.keys(row).forEach(key => {
        const getKey = () => {
          if (replacement[key] == null) return key
          return replacement[key]
        }
        obj[getKey().replace(/\s/g, '_')] = row[key]
      })
      return obj
    })
  }

  getSpreadsheetData () {
    return this.ss2json.convert({
      authJsonPath: this.config.authJsonPath,
      spreadsheetId: this.config.spreadsheetId,
      sheetName: this.config.sheetName
    })
  }

  close () {
    this.db.close()
  }

  dbClean () {
    this.db.clean()
  }

  dbUpdate () {
    return this.getSpreadsheetData().then(data => {
      const _data = this.replaceKey_(data)
      if (!this.db.isTableExists(this.db.config.name)) {
        this.db.init(Object.keys(_data[0]))
      }
      this.db.truncate()
      this.db.load(_data)
    })
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
      const output = this.search(line.trim()).result.map((r) => {
        return JSON.stringify(r, null, '  ')
      }).join('\n')
      console.log(output, '\n')
      rl.prompt()
    }).on('close', () => {
      this.close()
      process.exit(0)
    })
  }
}

module.exports = Spreadsearch
