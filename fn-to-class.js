/*
 * Returns true for ASTs of the form `function Foo()` (where 'F' is capitalized).
 */
function isConstructorFn (node) {
  if (node.type !== 'FunctionDeclaration') {
    return
  }
  return node.id.name.match(/^[A-Z]/)
}

/*
 * Returns true for ASTs of the form `extend(Foo.prototype, ...)`
 */
function isExtendPrototype (node) {
  if (node.type !== 'ExpressionStatement') return

  const expr = node.expression
  if (expr.type !== 'CallExpression') return
  if (expr.callee.name !== 'extend') return

  const args = expr.arguments
  if (args.length < 2) return

  const first = args[0]
  if (first.type !== 'MemberExpression') return
  if (first.property.name !== 'prototype') return

  return true
}

/*
 * Returns true for ASTs of the form `extend(Foo.prototype, Bar.prototype)`.
 */
function isProtoExtendsProto (node) {
  if (!isExtendPrototype(node)) return

  const second = node.expression.arguments[1]
  if (second.type !== 'MemberExpression') return
  if (second.property.name !== 'prototype') return

  return true
}


/*
 * Returns true for ASTs of the form `extend(Foo.prototype, { ... })`.
 */
function isProtoExtendsObject (node) {
  if (!isExtendPrototype(node)) return

  const second = node.expression.arguments[1]
  if (second.type !== 'ObjectExpression') return

  return true
}

/*
 * Returns ['Foo', 'Bar'] For ASTs resembling `extend(Foo.prototype, Bar.prototype)`.
 */
function getPepClassNames (node) {
  if (!isProtoExtendsProto(node)) return
  const [first, second] = node.expression.arguments
  return [first.object.name, second.object.name]
}

/*
 * Builds a method definition for attaching to a class.
 */
function buildMethodDefinition (j, key, node, isStatic = false) {
  return j.methodDefinition(
    'method',
    key,
    j.functionExpression(null, node.params, node.body),
    isStatic
  )
}

/*
 * Builds a class declaration with optional superclass name.
 */
function buildClassDeclaration (j, path, superName = null) {
  return j.classDeclaration(
    path.value.id,
    j.classBody([
      buildMethodDefinition(
        j,
        j.identifier('constructor'),
        path.value
      )
    ]),
    superName ? j.identifier(superName) : null
  )
}

const fnToClass = (file, api) => {
  const j = api.jscodeshift
  const root = j(file.source)
  let superClasses = {}
  let classNodes = {}

  // extends(Foo.prototype, Bar.prototype)
  //   -> ∅
  //    & store mapping {Foo : Bar}
  root
    .find(j.ExpressionStatement, node => isProtoExtendsProto(node))
    .forEach(path => {
      const [className, superName] = getPepClassNames(path.value)
      superClasses[className] = superName
      j(path).remove()
    })

  // function Foo ()
  //   -> class Foo extends Bar (given mapping {Foo : Bar})
  //    & store mapping from 'Foo' to path
  root
    .find(
      j.FunctionDeclaration,
      node => isConstructorFn(node)
    )
    .forEach(path => {
      const name = path.value.id.name
      const superName = superClasses[name]
      j(path).replaceWith(path => {
        const built = buildClassDeclaration(j, path, superName)
        classNodes[name] = built
        return built
      })
    })

  // extends(Foo.prototype, { fns, nonFns })
  //   -> ∅ (each fn)
  //   -> ∅ (whole expression, if {...} becomes empty)
  //    & attach each fn as a method to class
  root
    .find(
      j.ExpressionStatement,
      node => isProtoExtendsObject(node)
    )
    .forEach(callPath => {
      const [dotExpr, entries] = callPath.value.expression.arguments
      const className = dotExpr.object.name

      // within the object, find values which are functions
      j(entries)
        .find(
          j.Property,
          { value: { type: 'FunctionExpression' } }
        )
        .forEach(propertyPath => {
          const classBody = classNodes[className].body
          const property = propertyPath.value

          classBody.body.push(
            buildMethodDefinition(
              j,
              j.identifier(property.key.name),
              property.value
            )
          )
          j(propertyPath).remove()
        })

      if (!entries.properties.length) {
        j(callPath).remove()
      }
    })

  return root.toSource()
}

module.exports = fnToClass
