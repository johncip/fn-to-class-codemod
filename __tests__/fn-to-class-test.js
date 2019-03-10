const { expectTransform } = require('../testUtil')

jest.autoMockOff()

describe('fn-to-class', () => {
  it('constructor fn -> class decl', () => {
    expectTransform(
      `function Apple() {}`,
      `class Apple { constructor() {} }`
    )
  })

  it('constructor fn, extend proto w/ proto -> class decl with extends keyword', () => {
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

  it('constructor fn, extend proto with fns -> class with methods', () => {
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

  it('constructor fn, extend proto w/ proto, "super" fn call -> class with super()', () => {
    expectTransform(
      `
        function Apple() {
          Fruit.call(this, 'ripe')
          this.size = 'small'
        }
        extend(Apple.prototype, Fruit.prototype)
      `,
      `
        class Apple extends Fruit {
          constructor() {
            super('ripe')
            this.size = 'small'
          }
        }
      `
    )
  })
})
