/* global jest */
'use strict'

const Ss2json = jest.genMockFromModule('ss2json')

Ss2json.prototype.convert = (params) => {
  return Promise.resolve([{
    key1: 'value1',
    key2: 'value2'
  }, {
    key1: 'value3',
    key2: 'value4'
  }])
}

module.exports = Ss2json
