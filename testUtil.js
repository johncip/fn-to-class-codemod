const fnToClass = require('./fn-to-class')

function normalize (str) {
  return str.trim().replace(/\s+/gm, ' ')
}

function expectTransform (input, expectedOutput, options = {}) {
  let jscodeshift = require('jscodeshift')
  const api = { jscodeshift, stats: () => {} }
  const output = fnToClass({ source: input }, api, options)

  expect(normalize(output))
    .toEqual(normalize(expectedOutput))
}

module.exports = { expectTransform }
