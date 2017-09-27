'use strict'

const fs = require('fs')
const Db = require('./db')
const DotDir = require('./dot_dir')
const Ss2json = require('ss2json')
const readline = require('readline')

class Spreadsearch {
  constructor () {
    this.config = null
    this.db = null

    this.dotDir = new DotDir()
    this.ss2json = new Ss2json()
  }

  init () {
    this.dotDir.init()
  }

  loadConfig () {
    try {
      this.config = Object.assign(
        {dataDir: this.dotDir.dataDirPath()},
        JSON.parse(fs.readFileSync(this.dotDir.configPath()))
      )
      this.db = new Db(this.config)
      return this.config
    } catch (e) {}
    return null
  }

  replaceKey_ (data) {
    const replacement = this.config.replacement
    if (replacement == null) return data

    return data.map(row => {
      const obj = {}
      Object.keys(row).forEach(key => {
        const getKey = () => {
          if (replacement[key] == null) return key
          return replacement[key]
        }
        obj[getKey()] = row[key]
      })
      return obj
    })
  }

  getSpreadsheetData () {
    return this.ss2json.convert({
      authJsonPath: this.config.authJson,
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

  console () {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Query> '
    })

    rl.prompt()

    rl.on('line', (line) => {
      console.log(JSON.stringify(this.db.select(line.trim()).result, null, '  '), '\n')
      rl.prompt()
    }).on('close', () => {
      this.close()
      process.exit(0)
    })
  }
}

module.exports = Spreadsearch
