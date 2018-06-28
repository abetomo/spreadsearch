'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const nroonga = require('nroonga')

class Db {
  constructor (config) {
    this.config = this.defaultSettings(config)
    this.db = new nroonga.Database(path.join(this.config.dataDir, this.config.name))
  }

  md5_ (str) {
    return crypto
      .createHash('md5')
      .update(str, 'utf8')
      .digest('hex')
  }

  defaultSettings (config) {
    return Object.assign({
      dataDir: os.tmpdir(),
      name: 'spreadsearch'
    }, config)
  }

  close () {
    this.db.close()
  }

  clean () {
    try {
      this.close()
    } catch (e) {
      console.log(e.message)
    }
    const regexp = new RegExp(`^${this.config.name}`)
    for (const file of fs.readdirSync(this.config.dataDir)) {
      if (regexp.test(file)) {
        const filePath = path.join(this.config.dataDir, file)
        fs.unlinkSync(filePath)
      }
    }
  }

  isTableExists (name) {
    return this.db.commandSync('table_list').filter((row) => {
      return row[1] === name
    }).length > 0
  }

  init (columns) {
    this.db.commandSync('table_create', {
      name: this.config.name,
      flags: 'TABLE_HASH_KEY',
      key_type: 'ShortText'
    })
    for (const column of columns) {
      this.db.commandSync('column_create', {
        table: this.config.name,
        name: column,
        flags: 'COLUMN_SCALAR',
        type: 'ShortText'
      })
    }

    this.db.commandSync('table_create', {
      name: 'Terms',
      flags: 'TABLE_PAT_KEY|KEY_NORMALIZE',
      key_type: 'ShortText',
      normalizer: 'NormalizerAuto',
      default_tokenizer: 'TokenBigramSplitSymbolAlpha'
    })
    for (const column of columns) {
      this.db.commandSync('column_create', {
        table: 'Terms',
        name: 'entry_' + column,
        flags: 'COLUMN_INDEX|WITH_POSITION',
        type: this.config.name,
        source: column
      })
    }
  }

  load (data) {
    this.db.commandSync('load', {
      table: this.config.name,
      values: JSON.stringify(data.map((d) => {
        return Object.assign({_key: this.md5_(JSON.stringify(d))}, d)
      }))
    })
  }

  truncate () {
    this.db.commandSync(`truncate ${this.config.name}`)
  }

  select (query) {
    const columns = this.db.commandSync(`column_list ${this.config.name}`)
      .slice(2)
      .map((row) => row[1])
    const result = this.db.commandSync('select', {
      table: this.config.name,
      match_columns: columns.join(','),
      query: query,
      limit: 100 // TODO: More than 100 cases
    })[0]
    const count = result.shift()[0]
    const keys = result.shift().slice(2).map((k) => k[0])
    return {
      count: count,
      result: result.map((row) => {
        const data = row.slice(2)
        return keys.reduce((acc, key, i) => {
          acc[key] = data[i]
          return acc
        }, {})
      })
    }
  }
}

module.exports = Db
