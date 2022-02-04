'use strict'

const process = require('process')
const os = require('os')
const fs = require('fs')
const path = require('path')
const DotDir = require('../dot_dir')

/* global describe, test, expect, beforeEach, afterEach */
describe('dot_dir', () => {
  let dotDir = null
  beforeEach(() => {
    dotDir = new DotDir()
    process.env.HOME = os.tmpdir()
  })

  afterEach(() => {
    if (fs.existsSync(dotDir.configPath())) fs.unlinkSync(dotDir.configPath())
    if (fs.existsSync(dotDir.dataDirPath())) fs.rmdirSync(dotDir.dataDirPath())
    if (fs.existsSync(dotDir.dotDirPath())) fs.rmdirSync(dotDir.dotDirPath())
  })

  test('dot_dir is instanceOf DotDir', () => {
    expect(dotDir).toBeInstanceOf(DotDir)
  })

  describe('getInitialConfigValue()', () => {
    test('Return initial config value', () => {
      expect(dotDir.getInitialConfigValue()).toEqual({
        default: {
          authJsonPath: 'JSON path for Google\'s authentication',
          spreadsheetId: 'Google Spreadsheet ID',
          sheetName: 'Sheet name in Google Spreadsheet',
          replacement: {}
        }
      })
    })
  })

  describe('home()', () => {
    test('Return home directory', () => {
      expect(dotDir.home()).toBe(os.tmpdir())
    })
  })

  describe('dotDirPath()', () => {
    test('Return dot directory', () => {
      expect(dotDir.dotDirPath())
        .toBe(path.join(os.tmpdir(), '.spreadsearch'))
    })
  })

  describe('dataDirPath()', () => {
    test('Return data directory', () => {
      expect(dotDir.dataDirPath())
        .toBe(path.join(os.tmpdir(), '.spreadsearch', 'data'))
    })
  })

  describe('configPath()', () => {
    test('Return config.json path', () => {
      expect(dotDir.configPath())
        .toBe(path.join(os.tmpdir(), '.spreadsearch', 'config.json'))
    })
  })

  describe('loadAllConfigs()', () => {
    test('Load config file', () => {
      expect(dotDir.loadAllConfigs()).toBeNull()
      dotDir.init()
      expect(dotDir.loadAllConfigs()).toEqual({
        default: {
          authJsonPath: 'JSON path for Google\'s authentication',
          spreadsheetId: 'Google Spreadsheet ID',
          sheetName: 'Sheet name in Google Spreadsheet',
          replacement: {}
        }
      })
    })
  })

  describe('loadConfig()', () => {
    test('Load config file. No "name"', () => {
      expect(dotDir.loadConfig()).toBeNull()

      const expected = {
        dataDir: dotDir.dataDirPath(),
        name: 'default',
        ...dotDir.getInitialConfigValue().default
      }
      dotDir.init()
      expect(dotDir.loadConfig()).toEqual(expected)
    })

    test('Load config file. With "name"', () => {
      expect(dotDir.loadConfig()).toBeNull()

      const expected = {
        dataDir: dotDir.dataDirPath(),
        name: 'default',
        ...dotDir.getInitialConfigValue().default
      }
      dotDir.init()
      expect(dotDir.loadConfig('default')).toEqual(expected)
    })

    test('Failed to load config', () => {
      expect(dotDir.loadConfig()).toBeNull()
      dotDir.init()
      expect(dotDir.loadConfig('aaa')).toBeNull()
    })
  })

  describe('init()', () => {
    test('Create necessary directories and create initial setup file', () => {
      dotDir.init()
      expect(fs.existsSync(dotDir.dotDirPath())).toBeTruthy()
      expect(fs.existsSync(dotDir.dataDirPath())).toBeTruthy()
      expect(fs.existsSync(dotDir.configPath())).toBeTruthy()
      expect(fs.readFileSync(dotDir.configPath()).toString())
        .toBe(JSON.stringify(dotDir.getInitialConfigValue(), null, '  '))
    })
  })
})
