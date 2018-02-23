'use strict'

const os = require('os')
const fs = require('fs')
const Db = require('../db')

const testData = [{
  col1: 'hoge',
  col2: 'fuga'
}, {
  col1: 'piyo',
  col2: 1234
}].concat(Array.from(
  Array(20),
  (v, i) => {
    return {
      col1: `v1-${i}`,
      col2: `v2-${i}`
    }
  }
))

/* global describe, test, expect, beforeEach, afterEach */
describe('db', () => {
  let db = null
  beforeEach(() => {
    db = new Db()
  })

  afterEach(() => {
    db.clean()
  })

  test('db is instanceOf Db', () => {
    expect(db).toBeInstanceOf(Db)
  })

  describe('md5_()', () => {
    test('value of md5', () => {
      expect(db.md5_('hoge')).toBe('ea703e7aa1efda0064eaa507d9e8ab7e')
    })
  })

  describe('defaultSettings()', () => {
    test('Default setting', () => {
      expect(db.defaultSettings({})).toEqual({
        dataDir: os.tmpdir(),
        name: 'spreadsearch'
      })
    })

    test('User setting', () => {
      expect(db.defaultSettings({
        dataDir: '/tmp/hoge',
        name: 'fuga'
      })).toEqual({
        dataDir: '/tmp/hoge',
        name: 'fuga'
      })

      expect(db.defaultSettings({dataDir: '/tmp/hoge'})).toEqual({
        dataDir: '/tmp/hoge',
        name: 'spreadsearch'
      })

      expect(db.defaultSettings({name: 'fuga'})).toEqual({
        dataDir: os.tmpdir(),
        name: 'fuga'
      })
    })
  })

  describe('clean()', () => {
    const dbFiles = () => {
      const regexp = new RegExp(`^${db.config.name}`)
      return fs.readdirSync(db.config.dataDir)
        .filter((file) => regexp.test(file))
    }

    test('Remove Groonga db file', () => {
      expect(dbFiles().length).toBeGreaterThan(0)
      db.clean()
      expect(dbFiles().length).toBe(0)
    })
  })

  describe('init() and isTableExists()', () => {
    test('Create a table of Groonga', () => {
      expect(db.isTableExists(db.config.name)).toBeFalsy()
      db.init(Object.keys(testData[0]))
      expect(db.isTableExists(db.config.name)).toBeTruthy()
    })
  })

  describe('load() and select()', () => {
    test('Load data into Groonga and select', () => {
      db.init(Object.keys(testData[0]))
      db.load(testData)

      expect(db.select('aaa')).toEqual({
        count: 0,
        result: []
      })
      expect(db.select('o')).toEqual({
        count: 2,
        result: [{
          col1: 'hoge',
          col2: 'fuga'
        }, {
          col1: 'piyo',
          col2: '1234'
        }]
      })
      expect(db.select('fuga')).toEqual({
        count: 1,
        result: [{
          col1: 'hoge',
          col2: 'fuga'
        }]
      })
      expect(db.select('piyo')).toEqual({
        count: 1,
        result: [{
          col1: 'piyo',
          col2: '1234'
        }]
      })
      expect(db.select('v')).toEqual({
        count: 20,
        result: Array.from(
          Array(20),
          (v, i) => {
            return {
              col1: `v1-${i}`,
              col2: `v2-${i}`
            }
          }
        )
      })
    })
  })

  describe('truncate()', () => {
    test('Empty with truncate', () => {
      db.init(Object.keys(testData[0]))
      db.load(testData)
      db.truncate()
      expect(db.select(null)).toEqual({
        count: 0,
        result: []
      })
    })
  })
})
