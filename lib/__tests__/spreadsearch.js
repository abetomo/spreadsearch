'use strict'

const os = require('os')
const fs = require('fs')
const Spreadsearch = require('../spreadsearch')

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

  describe('parseArgs()', () => {
    test('length === 2', () => {
      expect(ss.parseArgs(['node', 'spreadsearch'])).toEqual(['default', 'console'])
    })

    test('length === 3', () => {
      const tests = [{
        args: ['list'],
        expected: ['default', 'list']
      }, {
        args: ['init'],
        expected: ['default', 'init']
      }, {
        args: ['clean'],
        expected: ['default', 'clean']
      }, {
        args: ['update'],
        expected: ['default', 'update']
      }, {
        args: ['console'],
        expected: ['default', 'console']
      }, {
        args: ['help'],
        expected: ['default', 'help']
      }, {
        args: ['search'],
        expected: ['default', 'console']
      }, {
        args: ['hoge'],
        expected: [null, 'help']
      }]
      for (const t of tests) {
        expect(ss.parseArgs(['node', 'spreadsearch'].concat(t.args)))
          .toEqual(t.expected)
      }
    })

    test('length === 4', () => {
      const tests = [{
        args: ['name1', 'list'],
        expected: [null, 'help']
      }, {
        args: ['name1', 'init'],
        expected: ['name1', 'init']
      }, {
        args: ['name2', 'clean'],
        expected: ['name2', 'clean']
      }, {
        args: ['name3', 'update'],
        expected: ['name3', 'update']
      }, {
        args: ['name4', 'console'],
        expected: ['name4', 'console']
      }, {
        args: ['name5', 'help'],
        expected: ['name5', 'help']
      }, {
        args: ['name6', 'search'],
        expected: ['name6', 'console']
      }, {
        args: ['search', 'query'],
        expected: ['default', 'search', 'query']
      }, {
        args: ['name7', 'hoge'],
        expected: [null, 'help']
      }]
      for (const t of tests) {
        expect(ss.parseArgs(['node', 'spreadsearch'].concat(t.args)))
          .toEqual(t.expected)
      }
    })

    test('length === 5', () => {
      const tests = [{
        args: ['name1', 'list', 'q'],
        expected: [null, 'help']
      }, {
        args: ['name1', 'init', 'q'],
        expected: [null, 'help']
      }, {
        args: ['name2', 'clean', 'q'],
        expected: [null, 'help']
      }, {
        args: ['name3', 'update', 'q'],
        expected: [null, 'help']
      }, {
        args: ['name4', 'console', 'q'],
        expected: [null, 'help']
      }, {
        args: ['name5', 'help', 'q'],
        expected: [null, 'help']
      }, {
        args: ['name6', 'search', 'q'],
        expected: ['name6', 'search', 'q']
      }, {
        args: ['name7', 'hoge', 'q'],
        expected: [null, 'help']
      }]
      for (const t of tests) {
        expect(ss.parseArgs(['node', 'spreadsearch'].concat(t.args)))
          .toEqual(t.expected)
      }
    })
  })

  describe('init()', () => {
    test('Create necessary directories and create initial setup file', () => {
      ss.init()
      expect(fs.existsSync(ss.dotDir.dotDirPath())).toBeTruthy()
      expect(fs.existsSync(ss.dotDir.dataDirPath())).toBeTruthy()
      expect(fs.existsSync(ss.dotDir.configPath())).toBeTruthy()
      expect(fs.readFileSync(ss.dotDir.configPath()).toString())
        .toEqual(JSON.stringify(ss.dotDir.getInitialConfigValue(), null, '  '))
    })
  })

  describe('loadConfig()', () => {
    test('Load config file', () => {
      expect(ss.loadConfig()).toBeNull()
      expect(ss.config).toBeNull()

      const expected = {
        dataDir: ss.dotDir.dataDirPath(),
        name: 'default',
        ...ss.dotDir.getInitialConfigValue().default
      }
      ss.init()
      expect(ss.loadConfig()).toEqual(expected)
      expect(ss.config).toEqual(expected)
    })

    test('Failed to load config', () => {
      expect(ss.loadConfig()).toBeNull()
      expect(ss.config).toBeNull()

      ss.init()
      expect(ss.loadConfig('aaa')).toBeNull()
      expect(ss.config).toBeNull()
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
        key2: 'value2',
        'key 3': 'value 3'
      }, {
        key1: 'value3',
        key2: 'value4',
        'key 3': 'value 5'
      }]

      test('When there is no setting, no change. Spaces are replaced with "_"', () => {
        expect(ss.replaceKey_(data)).toEqual([{
          key1: 'value1',
          key2: 'value2',
          key_3: 'value 3'
        }, {
          key1: 'value3',
          key2: 'value4',
          key_3: 'value 5'
        }])
      })

      test('Replace key with substitution setting. Spaces are replaced with "_"', () => {
        ss.config.replacement = {
          key1: 'replacement_key1'
        }
        expect(ss.replaceKey_(data)).toEqual([{
          replacement_key1: 'value1',
          key2: 'value2',
          key_3: 'value 3'
        }, {
          replacement_key1: 'value3',
          key2: 'value4',
          key_3: 'value 5'
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

  describe('More tests', () => {
    test.skip('More tests', () => {})
  })
})
