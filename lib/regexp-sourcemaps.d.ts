import { SourceNode, CodeWithSourceMap } from 'source-map';
/**
 * Handle a position in a file
 */
export declare class Position {
    file: string;
    line: number;
    column: number;
    constructor(file: string, line?: number, column?: number);
    /**
     * Advance in the file to move the cursor after content
     * @param content
     * @returns {this}
     */
    forward(content: string): this;
    /**
     * Add content to a node (needs to be added line per line)
     * @param node
     * @param content
     * @param autoForward
     * @returns {this}
     */
    add(node: SourceNode, content: string, autoForward?: boolean): this;
}
/**
 * Regexp replacer with sourcemap support
 */
export declare class Replacer {
    protected $regexp: RegExp;
    protected $replace: string;
    protected $regexpName?: string;
    constructor($regexp: RegExp, $replace: string, $regexpName?: string);
    /**
     * Create a replace node depending on the current pos & match
     * @param pos
     * @param match
     * @returns {SourceNode}
     * @constructor
     */
    createReplaceNode(pos: any, match: any): SourceNode;
    /**
     * Replace the provided content
     * @param content
     * @param file
     * @returns {CodeWithSourceMap}
     */
    replace(content: string, file?: string): CodeWithSourceMap;
}
export default Replacer;
