const { expectTransform } = require('../testUtil')

jest.autoMockOff()

describe('fn-to-class', () => {
  it('constructor fn -> class decl', () => {
    expectTransform(
      `function Apple() {}`,
      `class Apple { constructor() {} }`
    )
  })

  it('constructor fn + extend proto with proto -> class decl with superclass', () => {
    expectTransform(
      `
        function Apple() {}
        extend(Apple.prototype, Fruit.prototype)
      `,
      `
        class Apple extends Fruit {
          constructor() {}
        }
      `
    )
  })

  it('constructor fn + extend proto with fns -> class with methods', () => {
    expectTransform(
      `
        function Apple() {}
        extend(Apple.prototype, {
          isRed: function () { return true },
          isBlue: function () { return false }
        })
      `,
      `
        class Apple {
          constructor() {}
          isRed() { return true }
          isBlue() { return false }
        }
      `
    )
  })
})
