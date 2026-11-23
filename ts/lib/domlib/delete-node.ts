// Copyright: Anki Software, LLC and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { getSelection } from "@tslib/cross-browser";

/**
 * Removing a node via node.remove() is invisible to the browser's undo stack.
 * Selecting the node and issuing the "delete" command instead makes the
 * removal a regular editing action, so that it can be undone with Ctrl+Z.
 *
 * The node needs to be inside the currently focused contenteditable.
 * If the command is unavailable or does nothing, the node is removed directly.
 */
export function deleteNodeUndoably(node: Node): void {
    const selection = getSelection(node);

    if (selection && typeof document.execCommand === "function") {
        const range = new Range();
        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);

        if (document.execCommand("delete") && !node.isConnected) {
            return;
        }
    }

    if (node.isConnected) {
        (node as ChildNode).remove();
    }
}
