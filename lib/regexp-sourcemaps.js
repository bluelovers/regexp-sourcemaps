'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const source_map_1 = require("source-map");
const lineMatcher = /\n/gm;
const varMatcher = /\$({([\d]+)}|[\d]+)/gm;
/**
 * Handle a position in a file
 */
class Position {
    constructor(file, line = 1, column = 0) {
        this.file = file;
        this.line = line;
        this.column = column;
    }
    /**
     * Advance in the file to move the cursor after content
     * @param content
     * @returns {this}
     */
    forward(content) {
        let lines = content.split(lineMatcher);
        if (lines.length <= 1) {
            this.column += content.length;
        }
        else {
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
    add(node, content, autoForward = true) {
        let pos = autoForward ? this : new Position(this.file, this.line, this.column);
        let match;
        let sub;
        let lastIndex = lineMatcher.lastIndex = 0;
        while ((match = lineMatcher.exec(content))) {
            sub = content.substring(lastIndex, lineMatcher.lastIndex);
            node.add(new source_map_1.SourceNode(pos.line, pos.column, pos.file, sub));
            pos.forward(sub);
            lastIndex = lineMatcher.lastIndex;
        }
        if (lastIndex < content.length) {
            sub = content.substring(lastIndex);
            node.add(new source_map_1.SourceNode(pos.line, pos.column, pos.file, sub));
            pos.forward(sub);
        }
        return this;
    }
}
exports.Position = Position;
/**
 * Regexp replacer with sourcemap support
 */
class Replacer {
    constructor($regexp, $replace, $regexpName) {
        this.$regexp = $regexp;
        this.$replace = $replace;
        this.$regexpName = $regexpName;
        this.$regexpName = !$regexpName ? null : 'regexp/' + $regexpName;
    }
    /**
     * Create a replace node depending on the current pos & match
     * @param pos
     * @param match
     * @returns {SourceNode}
     * @constructor
     */
    createReplaceNode(pos, match) {
        let node = new source_map_1.SourceNode();
        let varMatch;
        let replacePos = new Position(this.$regexpName);
        let lastIndex = varMatcher.lastIndex = 0;
        while ((varMatch = varMatcher.exec(this.$replace))) {
            let parValue = match[varMatch[2] || varMatch[1]];
            if (varMatch.index > lastIndex) {
                replacePos.add(node, this.$replace.substring(lastIndex, varMatch.index));
            }
            pos.add(node, parValue, false);
            lastIndex = varMatcher.lastIndex;
        }
        if (lastIndex < this.$replace.length) {
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
    replace(content, file = 'content') {
        let filePos = new Position(file);
        let match;
        // Create the base node & add sources
        let node = new source_map_1.SourceNode();
        node.setSourceContent(file, content);
        if (this.$regexpName) {
            node.setSourceContent(this.$regexpName, this.$replace);
        }
        let lastIndex = this.$regexp.lastIndex = 0;
        while ((match = this.$regexp.exec(content))) {
            if (match.index > lastIndex) {
                filePos.add(node, content.substring(lastIndex, match.index));
            }
            node.add(this.createReplaceNode(filePos, match));
            filePos.forward(match[0]);
            // Move
            lastIndex = this.$regexp.lastIndex || match.index + match[0].length;
            // Handle empty match
            if (!match[0].length) {
                ++this.$regexp.lastIndex;
            }
            // Handle global flag
            if (!this.$regexp.global) {
                break;
            }
        }
        if (lastIndex < content.length) {
            filePos.add(node, content.substring(lastIndex));
        }
        let res = node.toStringWithSourceMap({ file: file });
        return res;
    }
}
exports.Replacer = Replacer;
exports.default = Replacer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXhwLXNvdXJjZW1hcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdleHAtc291cmNlbWFwcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsMkNBQTJEO0FBRzNELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUMzQixNQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQztBQUUzQzs7R0FFRztBQUNILE1BQWEsUUFBUTtJQUVwQixZQUFtQixJQUFZLEVBQVMsT0FBTyxDQUFDLEVBQVMsU0FBUyxDQUFDO1FBQWhELFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFJO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBSTtJQUdsRSxDQUFDO0lBRUY7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxPQUFlO1FBRXRCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdkMsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFDckI7WUFDQyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7U0FDOUI7YUFFRDtZQUNDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7U0FDN0M7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxHQUFHLENBQUMsSUFBZ0IsRUFBRSxPQUFlLEVBQUUsY0FBdUIsSUFBSTtRQUUvRCxJQUFJLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFB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cEUscUJBQXFCO1lBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUNwQjtnQkFDQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2FBQ3pCO1lBRUQscUJBQXFCO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDeEI7Z0JBQ0MsTUFBTTthQUNOO1NBQ0Q7UUFFRCxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUM5QjtZQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUNoRDtRQUVDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRXZELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBaEdELDRCQWdHQztBQUVELGtCQUFlLFFBQVEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU291cmNlTm9kZSwgQ29kZVdpdGhTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCBTeW1ib2xJbnNwZWN0IGZyb20gJ3N5bWJvbC5pbnNwZWN0JztcblxuY29uc3QgbGluZU1hdGNoZXIgPSAvXFxuL2dtO1xuY29uc3QgdmFyTWF0Y2hlciA9IC9cXCQoeyhbXFxkXSspfXxbXFxkXSspL2dtO1xuXG4vKipcbiAqIEhhbmRsZSBhIHBvc2l0aW9uIGluIGEgZmlsZVxuICovXG5leHBvcnQgY2xhc3MgUG9zaXRpb25cbntcblx0Y29uc3RydWN0b3IocHVibGljIGZpbGU6IHN0cmluZywgcHVibGljIGxpbmUgPSAxLCBwdWJsaWMgY29sdW1uID0gMClcbiAge1xuXG4gIH1cblxuXHQvKipcblx0ICogQWR2YW5jZSBpbiB0aGUgZmlsZSB0byBtb3ZlIHRoZSBjdXJzb3IgYWZ0ZXIgY29udGVudFxuXHQgKiBAcGFyYW0gY29udGVudFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGZvcndhcmQoY29udGVudDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGxpbmVzID0gY29udGVudC5zcGxpdChsaW5lTWF0Y2hlcik7XG5cblx0XHRpZiAobGluZXMubGVuZ3RoIDw9IDEpXG5cdFx0e1xuXHRcdFx0dGhpcy5jb2x1bW4gKz0gY29udGVudC5sZW5ndGg7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxpbmUgKz0gbGluZXMubGVuZ3RoIC0gMTtcblx0XHRcdHRoaXMuY29sdW1uID0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBjb250ZW50IHRvIGEgbm9kZSAobmVlZHMgdG8gYmUgYWRkZWQgbGluZSBwZXIgbGluZSlcblx0ICogQHBhcmFtIG5vZGVcblx0ICogQHBhcmFtIGNvbnRlbnRcblx0ICogQHBhcmFtIGF1dG9Gb3J3YXJkXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0YWRkKG5vZGU6IFNvdXJjZU5vZGUsIGNvbnRlbnQ6IHN0cmluZywgYXV0b0ZvcndhcmQ6IGJvb2xlYW4gPSB0cnVlKVxuXHR7XG4gICAgbGV0IHBvcyA9IGF1dG9Gb3J3YXJkID8gdGhpcyA6IG5ldyBQb3NpdGlvbih0aGlzLmZpbGUsIHRoaXMubGluZSwgdGhpcy5jb2x1bW4pO1xuXG4gICAgbGV0IG1hdGNoO1xuICAgIGxldCBzdWI7XG5cbiAgICBsZXQgbGFzdEluZGV4ID0gbGluZU1hdGNoZXIubGFzdEluZGV4ID0gMDtcblx0XHR3aGlsZSAoKG1hdGNoID0gbGluZU1hdGNoZXIuZXhlYyhjb250ZW50KSkpXG5cdFx0e1xuXHRcdFx0c3ViID0gY29udGVudC5zdWJzdHJpbmcobGFzdEluZGV4LCBsaW5lTWF0Y2hlci5sYXN0SW5kZXgpO1xuXHRcdFx0bm9kZS5hZGQobmV3IFNvdXJjZU5vZGUocG9zLmxpbmUsIHBvcy5jb2x1bW4sIHBvcy5maWxlLCBzdWIpKTtcblx0XHRcdHBvcy5mb3J3YXJkKHN1Yik7XG5cdFx0XHRsYXN0SW5kZXggPSBsaW5lTWF0Y2hlci5sYXN0SW5kZXg7XG5cdFx0fVxuXG5cdFx0aWYgKGxhc3RJbmRleCA8IGNvbnRlbnQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdHN1YiA9IGNvbnRlbnQuc3Vic3RyaW5nKGxhc3RJbmRleCk7XG5cdFx0XHRub2RlLmFkZChuZXcgU291cmNlTm9kZShwb3MubGluZSwgcG9zLmNvbHVtbiwgcG9zLmZpbGUsIHN1YikpO1xuXHRcdFx0cG9zLmZvcndhcmQoc3ViKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG4vKipcbiAqIFJlZ2V4cCByZXBsYWNlciB3aXRoIHNvdXJjZW1hcCBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjbGFzcyBSZXBsYWNlclxue1xuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgJHJlZ2V4cDogUmVnRXhwLCBwcm90ZWN0ZWQgJHJlcGxhY2U6IHN0cmluZywgcHJvdGVjdGVkICRyZWdleHBOYW1lPzogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy4kcmVnZXhwTmFtZSA9ICEkcmVnZXhwTmFtZSA/IG51bGwgOiAncmVnZXhwLycgKyAkcmVnZXhwTmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSByZXBsYWNlIG5vZGUgZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IHBvcyAmIG1hdGNoXG5cdCAqIEBwYXJhbSBwb3Ncblx0ICogQHBhcmFtIG1hdGNoXG5cdCAqIEByZXR1cm5zIHtTb3VyY2VOb2RlfVxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGNyZWF0ZVJlcGxhY2VOb2RlKHBvcywgbWF0Y2gpXG5cdHtcblx0XHRsZXQgbm9kZSA9IG5ldyBTb3VyY2VOb2RlKCk7XG4gICAgbGV0IHZhck1hdGNoOiBSZWdFeHBFeGVjQXJyYXk7XG4gICAgbGV0IHJlcGxhY2VQb3MgPSBuZXcgUG9zaXRpb24odGhpcy4kcmVnZXhwTmFtZSk7XG5cblx0XHRsZXQgbGFzdEluZGV4ID0gdmFyTWF0Y2hlci5sYXN0SW5kZXggPSAwO1xuXHRcdHdoaWxlICgodmFyTWF0Y2ggPSB2YXJNYXRjaGVyLmV4ZWModGhpcy4kcmVwbGFjZSkpKVxuXHRcdHtcblx0XHRcdGxldCBwYXJWYWx1ZSA9IG1hdGNoW3Zhck1hdGNoWzJdIHx8IHZhck1hdGNoWzFdXTtcblx0XHRcdGlmICh2YXJNYXRjaC5pbmRleCA+IGxhc3RJbmRleClcblx0XHRcdHtcblx0XHRcdFx0cmVwbGFjZVBvcy5hZGQobm9kZSwgdGhpcy4kcmVwbGFjZS5zdWJzdHJpbmcobGFzdEluZGV4LCB2YXJNYXRjaC5pbmRleCkpO1xuXHRcdFx0fVxuXG5cdFx0XHRwb3MuYWRkKG5vZGUsIHBhclZhbHVlLCBmYWxzZSk7XG5cdFx0XHRsYXN0SW5kZXggPSB2YXJNYXRjaGVyLmxhc3RJbmRleDtcblx0XHR9XG5cdFx0aWYgKGxhc3RJbmRleCA8IHRoaXMuJHJlcGxhY2UubGVuZ3RoKVxuXHRcdHtcblx0XHRcdHJlcGxhY2VQb3MuYWRkKG5vZGUsIHRoaXMuJHJlcGxhY2Uuc3Vic3RyaW5nKGxhc3RJbmRleCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBub2RlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIHByb3ZpZGVkIGNvbnRlbnRcblx0ICogQHBhcmFtIGNvbnRlbnRcblx0ICogQHBhcmFtIGZpbGVcblx0ICogQHJldHVybnMge0NvZGVXaXRoU291cmNlTWFwfVxuXHQgKi9cblx0cmVwbGFjZShjb250ZW50OiBzdHJpbmcsIGZpbGUgPSAnY29udGVudCcpXG5cdHtcblx0XHRsZXQgZmlsZVBvcyA9IG5ldyBQb3NpdGlvbihmaWxlKTtcblxuICAgIGxldCBtYXRjaDtcblxuXHRcdC8vIENyZWF0ZSB0aGUgYmFzZSBub2RlICYgYWRkIHNvdXJjZXNcbiAgICBsZXQgbm9kZSA9IG5ldyBTb3VyY2VOb2RlKCk7XG5cdFx0bm9kZS5zZXRTb3VyY2VDb250ZW50KGZpbGUsIGNvbnRlbnQpO1xuXHRcdGlmICh0aGlzLiRyZWdleHBOYW1lKVxuXHRcdHtcblx0XHRcdG5vZGUuc2V0U291cmNlQ29udGVudCh0aGlzLiRyZWdleHBOYW1lLCB0aGlzLiRyZXBsYWNlKTtcblx0XHR9XG5cbiAgICBsZXQgbGFzdEluZGV4ID0gdGhpcy4kcmVnZXhwLmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUgKChtYXRjaCA9IHRoaXMuJHJlZ2V4cC5leGVjKGNvbnRlbnQpKSlcblx0XHR7XG5cdFx0XHRpZiAobWF0Y2guaW5kZXggPiBsYXN0SW5kZXgpXG5cdFx0XHR7XG5cdFx0XHRcdGZpbGVQb3MuYWRkKG5vZGUsIGNvbnRlbnQuc3Vic3RyaW5nKGxhc3RJbmRleCwgbWF0Y2guaW5kZXgpKTtcblx0XHRcdH1cblxuXHRcdFx0bm9kZS5hZGQodGhpcy5jcmVhdGVSZXBsYWNlTm9kZShmaWxlUG9zLCBtYXRjaCkpO1xuXHRcdFx0ZmlsZVBvcy5mb3J3YXJkKG1hdGNoWzBdKTtcblxuXHRcdFx0Ly8gTW92ZVxuXHRcdFx0bGFzdEluZGV4ID0gdGhpcy4kcmVnZXhwLmxhc3RJbmRleCB8fCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcblxuXHRcdFx0Ly8gSGFuZGxlIGVtcHR5IG1hdGNoXG5cdFx0XHRpZiAoIW1hdGNoWzBdLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0Kyt0aGlzLiRyZWdleHAubGFzdEluZGV4O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBIYW5kbGUgZ2xvYmFsIGZsYWdcblx0XHRcdGlmICghdGhpcy4kcmVnZXhwLmdsb2JhbClcblx0XHRcdHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGxhc3RJbmRleCA8IGNvbnRlbnQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGZpbGVQb3MuYWRkKG5vZGUsIGNvbnRlbnQuc3Vic3RyaW5nKGxhc3RJbmRleCkpO1xuXHRcdH1cblxuICAgIGxldCByZXMgPSBub2RlLnRvU3RyaW5nV2l0aFNvdXJjZU1hcCh7IGZpbGU6IGZpbGUgfSk7XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlcGxhY2VyXG4iXX0=