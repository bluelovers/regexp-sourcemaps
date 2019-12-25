/**
 * Created by user on 2019/12/26.
 */

import { Replacer } from '../';

let someReplacer = new Replacer(/some(.*?)content/, 'my $1 result', 'regexpName');

let res = someReplacer.replace('somesupercontent', '/path/to/file');

console.log({
	someReplacer,
	res,
})

