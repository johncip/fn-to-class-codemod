const fnToClass = require('./fn-to-class')

function runInlineTest (module, options, input, expectedOutput) {
  const transform = module.default ? module.default : module
  let jscodeshift = require('jscodeshift')
  if (module.parser) {
    jscodeshift = jscodeshift.withParser(module.parser)
  }

  const normalizeWhitespace = str => str.trim().replace(/\s+/gm, ' ')

  const output = transform(
    input,
    { jscodeshift, stats: () => {} },
    options || {}
  )

  expect(normalizeWhitespace(output)).toEqual(
    normalizeWhitespace(expectedOutput)
  )
}

function testInline (testName, input, expectedOutput) {
  it(testName, () => {
    runInlineTest(fnToClass, {}, { source: input }, expectedOutput)
  })
}

module.exports = { testInline }
