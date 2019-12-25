'use strict';

import { SourceNode, CodeWithSourceMap } from 'source-map';
import SymbolInspect from 'symbol.inspect';

const lineMatcher = /\n/gm;
const varMatcher = /\$({([\d]+)}|[\d]+)/gm;

/**
 * Handle a position in a file
 */
export class Position
{
	constructor(public file: string, public line = 1, public column = 0)
  {

  }

	/**
	 * Advance in the file to move the cursor after content
	 * @param content
	 * @returns {this}
	 */
	forward(content: string)
	{
		let lines = content.split(lineMatcher);

		if (lines.length <= 1)
		{
			this.column += content.length;
		}
		else
		{
			this.line += lines.length - 1;
			this.column = lines[lines.length - 1].length;
		}

		return this;
	}

	/**
	 * Add content to a node (needs to be added line per line)
	 * @param node
	 * @param content
	 * @param autoForward
	 * @returns {this}
	 */
	add(node: SourceNode, content: string, autoForward: boolean = true)
	{
    let pos = autoForward ? this : new Position(this.file, this.line, this.column);

    let match;
    let sub;

    let lastIndex = lineMatcher.lastIndex = 0;
		while ((match = lineMatcher.exec(content)))
		{
			sub = content.substring(lastIndex, lineMatcher.lastIndex);
			node.add(new SourceNode(pos.line, pos.column, pos.file, sub));
			pos.forward(sub);
			lastIndex = lineMatcher.lastIndex;
		}

		if (lastIndex < content.length)
		{
			sub = content.substring(lastIndex);
			node.add(new SourceNode(pos.line, pos.column, pos.file, sub));
			pos.forward(sub);
		}

		return this;
	}
}

/**
 * Regexp replacer with sourcemap support
 */
export class Replacer
{
	constructor(protected $regexp: RegExp, protected $replace: string, protected $regexpName?: string)
	{
		this.$regexpName = !$regexpName ? null : 'regexp/' + $regexpName;
	}

	/**
	 * Create a replace node depending on the current pos & match
	 * @param pos
	 * @param match
	 * @returns {SourceNode}
	 * @constructor
	 */
	createReplaceNode(pos, match)
	{
		let node = new SourceNode();
    let varMatch: RegExpExecArray;
    let replacePos = new Position(this.$regexpName);

		let lastIndex = varMatcher.lastIndex = 0;
		while ((varMatch = varMatcher.exec(this.$replace)))
		{
			let parValue = match[varMatch[2] || varMatch[1]];
			if (varMatch.index > lastIndex)
			{
				replacePos.add(node, this.$replace.substring(lastIndex, varMatch.index));
			}

			pos.add(node, parValue, false);
			lastIndex = varMatcher.lastIndex;
		}
		if (lastIndex < this.$replace.length)
		{
			replacePos.add(node, this.$replace.substring(lastIndex));
		}

		return node;
	}

	/**
	 * Replace the provided content
	 * @param content
	 * @param file
	 * @returns {CodeWithSourceMap}
	 */
	replace(content: string, file = 'content')
	{
		let filePos = new Position(file);

    let match;

		// Create the base node & add sources
    let node = new SourceNode();
		node.setSourceContent(file, content);
		if (this.$regexpName)
		{
			node.setSourceContent(this.$regexpName, this.$replace);
		}

    let lastIndex = this.$regexp.lastIndex = 0;
		while ((match = this.$regexp.exec(content)))
		{
			if (match.index > lastIndex)
			{
				filePos.add(node, content.substring(lastIndex, match.index));
			}

			node.add(this.createReplaceNode(filePos, match));
			filePos.forward(match[0]);

			// Move
			lastIndex = this.$regexp.lastIndex || match.index + match[0].length;

			// Handle empty match
			if (!match[0].length)
			{
				++this.$regexp.lastIndex;
			}

			// Handle global flag
			if (!this.$regexp.global)
			{
				break;
			}
		}

		if (lastIndex < content.length)
		{
			filePos.add(node, content.substring(lastIndex));
		}

    let res = node.toStringWithSourceMap({ file: file });

		return res;
	}
}

export default Replacer
