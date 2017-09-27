'use strict'

const os = require('os')
const fs = require('fs')
const Spreadsearch = require('../spreadsearch')

const sampleConfig = {
  authJsonPath: 'JSON path for Google\'s authentication',
  spreadsheetId: 'Google Spreadsheet ID',
  sheetName: 'Sheet name in Google Spreadsheet',
  replacement: {}
}

/* global describe, test, expect, beforeEach, afterEach */
describe('spreadsearch', () => {
  let ss = null
  beforeEach(() => {
    process.env.HOME = os.tmpdir()
    ss = new Spreadsearch()
  })

  afterEach(() => {
    ss.dbClean()
    if (fs.existsSync(ss.dotDir.configPath())) fs.unlinkSync(ss.dotDir.configPath())
    if (fs.existsSync(ss.dotDir.dataDirPath())) fs.rmdirSync(ss.dotDir.dataDirPath())
    if (fs.existsSync(ss.dotDir.dotDirPath())) fs.rmdirSync(ss.dotDir.dotDirPath())
  })

  test('ss is instanceOf Spreadsearch', () => {
    expect(ss).toBeInstanceOf(Spreadsearch)
  })

  describe('init()', () => {
    test('Create necessary directories and create initial setup file', () => {
      ss.init()
      expect(fs.existsSync(ss.dotDir.dotDirPath())).toBeTruthy()
      expect(fs.existsSync(ss.dotDir.dataDirPath())).toBeTruthy()
      expect(fs.existsSync(ss.dotDir.configPath())).toBeTruthy()
      expect(fs.readFileSync(ss.dotDir.configPath()).toString())
        .toEqual(JSON.stringify(sampleConfig, null, '  '))
    })
  })

  describe('loadConfig()', () => {
    test('Load config file', () => {
      expect(ss.loadConfig()).toBeNull()
      expect(ss.config).toBeNull()

      const expected = Object.assign(
        {dataDir: ss.dotDir.dataDirPath()},
        sampleConfig
      )
      ss.init()
      expect(ss.loadConfig()).toEqual(expected)
      expect(ss.config).toEqual(expected)
    })
  })

  describe('Initialized', () => {
    beforeEach(() => {
      ss.init()
      ss.loadConfig()
    })

    describe('replaceKey_()', () => {
      const data = [{
        key1: 'value1',
        key2: 'value2'
      }, {
        key1: 'value3',
        key2: 'value4'
      }]

      test('When there is no setting, no change', () => {
        expect(ss.replaceKey_(data)).toEqual(data)
      })

      test('Replace key with substitution setting', () => {
        ss.config.replacement = {
          key1: 'replacement_key1'
        }
        expect(ss.replaceKey_(data)).toEqual([{
          replacement_key1: 'value1',
          key2: 'value2'
        }, {
          replacement_key1: 'value3',
          key2: 'value4'
        }])
      })
    })

    describe('getSpreadsheetData()', () => {
      test('Test using Mock', () => {
        return ss.getSpreadsheetData().then(data => {
          expect(data).toEqual([{
            key1: 'value1',
            key2: 'value2'
          }, {
            key1: 'value3',
            key2: 'value4'
          }])
        })
      })
    })
  })

  test('More tests')
})
