const { testInline } = require('../testUtil')

jest.autoMockOff()

describe('fn-to-class', () => {
  testInline(
    'constructor fn -> class decl',
    `function Apple() {}`,
    `class Apple { constructor() {} }`
  )
  testInline(
    'constructor fn + extend(proto, proto) -> class decl with superclass',
    `
    function Apple() {}
    extend(Apple.prototype, Banana.prototype)
    `,
    `class Apple extends Banana { constructor() {} }`
  )
  testInline(
    'constructor fn + extend(proto, {}) -> class with methods',
    `
    function Apple() {}
    extend(Apple.prototype, {
      hasSeeds: function () { return true }
    })
    `,
    `class Apple {
      constructor() {}
      hasSeeds() { return true }
    }`
  )
})
