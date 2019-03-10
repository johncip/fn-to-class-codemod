# fn-to-class-codemod

This is a codemod script for use with [jscodeshift](https://github.com/facebook/jscodeshift). It will transform ES5 constructor-function-based "classes" into ES6 classes.

There are existing tools for this that didn't cover my specific case, **which involves specific use of lodash's `extend` function**. For the common case, where e.g. methods are defined with `Foo.prototype.bar = ...`, you should instead use one of these:

- [lebab](https://github.com/lebab/lebab)
- [dhruvdutt/es5-function-to-class-codemod](https://github.com/dhruvdutt/es5-function-to-class-codemod)

## Example

`fn-to-class-codemod` will transform code like this:

```javascript
import { extend } from 'lodash'
import Entity from './entity'

export default function Hint (game, tile) {
  Entity.call(this, game, tile)
  this.isFlat = true
}

extend(Hint.prototype, Entity.prototype)

extend(Hint.prototype, {
  collideWith: function (target) {
    this.moveHere(target)
    this.game.hintPanel.show()
  }
})
```

...to this:

```javascript
import { extend } from 'lodash'
import Entity from './entity'

export default class Hint extends Entity {
  constructor(game, tile, emap) {
    super(game, tile, emap)
    this.isFlat = true
  }

  collideWith(target) {
    this.moveHere(target)
    this.game.hintPanel.show()
  }
}
```

Note that the unused import has not been removed (but a followup `eslint --fix` pass should do it though.

## Using

To use this codemod to modify files in place:

```bash
npm install --global jscodeshift
jscodeshift -t fn-to-class.js $your_file_or_dir
```

I recommend that you first do a console-printed dry run with:

```
jscodeshift -d -p -t fn-to-class.js ...
```


## To do

- [ ] preserve comments in all cases
- [ ] transform properties
- [ ] test with multiple classes per file


#### Things that this doesn't handle, which I don't necessarily plan on adding

- support the common case (`prototype.bar = `)
- support `_.extend`, `_.assignIn`, and `assignIn`
- support `Object.extend`
- partially-transformed files (later steps rely on the class declaration having been created in the same session)

## Developing

Pull requests are very welcome. Note that ESLint is declared as a dev dependency at the moment -- this is just for my own convenience.

```bash
hub clone johncip/fn-to-class-codemod
cd fn-to-class-codemod
npm install
```
