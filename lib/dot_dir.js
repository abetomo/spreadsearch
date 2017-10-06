'use strict'

const fs = require('fs')
const path = require('path')
const dotDirName = '.spreadsearch'
const initialValue = {
  authJsonPath: 'JSON path for Google\'s authentication',
  spreadsheetId: 'Google Spreadsheet ID',
  sheetName: 'Sheet name in Google Spreadsheet',
  replacement: {}
}

class DotDir {
  getInitialConfigValue () {
    return initialValue
  }

  home () {
    return process.env.HOME
  }

  dotDirPath () {
    this._dotDirPath = this._dotDirPath || path.join(this.home(), dotDirName)
    return this._dotDirPath
  }

  dataDirPath () {
    this._dataDirPath = this._dataDirPath || path.join(this.dotDirPath(), 'data')
    return this._dataDirPath
  }

  configPath () {
    this._configPath = this._configPath || path.join(this.dotDirPath(), 'config.json')
    return this._configPath
  }

  loadConfig () {
    try {
      return Object.assign(
        {dataDir: this.dataDirPath()},
        JSON.parse(fs.readFileSync(this.configPath()))
      )
    } catch (e) {}
    return null
  }

  init () {
    if (!fs.existsSync(this.dotDirPath())) fs.mkdirSync(this.dotDirPath())
    if (!fs.existsSync(this.dataDirPath())) fs.mkdirSync(this.dataDirPath())
    if (!fs.existsSync(this.configPath())) {
      fs.writeFileSync(
        this.configPath(),
        JSON.stringify(initialValue, null, '  ')
      )
    }
  }
}

module.exports = DotDir
