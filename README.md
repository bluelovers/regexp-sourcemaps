## regexp-sourcemaps

Apply regexp replaces on a string & get the replaced string & sourcemap as a result.

### Usage

The package is rather easy to use:

```js
var Replacer = require('regexp-sourcemaps');

var someReplacer = new Replacer(/some(.*?)content/, 'my $1 result', 'regexpName');

var res = someReplacer.replace('somesupercontent', '/path/to/file');
// res.code === 'my super result'
// res.map contain the sourcemap to map the content properly
```

#### `Replacer(regexp, replace [, regexpName = null])`

`regexp`: the regexp to match in the content with or without capturing groups

`replace`: the pattern to replace the match with (everything matching is replaced), can contain referencies to capturing groups using `$nn` with:
- `$0` or `${0}`: the whole matching text
- `$n` or `${n}`: the `nth` capturing group (n ≥ 1)

`regexpName`: the name to give the regexp replace in the sourcemap, useful to have more info in the sourcemaps but optional

#### `Replacer.prototype.replace(content [, file = 'content'])`

`content`: the content on which to apply the transformation

`file`: the path to the file on which the transformation is applied to insert in the resulting sourcemap
