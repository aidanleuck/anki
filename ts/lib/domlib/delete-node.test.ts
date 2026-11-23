// Copyright: Anki Software, LLC and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { afterEach, expect, test, vi } from "vitest";

import { deleteNodeUndoably } from "./delete-node";

function setup(): { root: HTMLElement; target: HTMLElement } {
    document.body.innerHTML = `<div>a<span id="target">b</span>c</div>`;
    return {
        root: document.body.firstElementChild as HTMLElement,
        target: document.getElementById("target")!,
    };
}

afterEach(() => {
    delete (document as any).execCommand;
});

test("selects the node and deletes it through execCommand", () => {
    const { root, target } = setup();
    const exec = vi.fn((command: string) => {
        expect(command).toBe("delete");
        const range = document.getSelection()!.getRangeAt(0);
        expect(range.startContainer).toBe(root);
        expect(range.startOffset).toBe(1);
        expect(range.endOffset).toBe(2);
        target.remove();
        return true;
    });
    document.execCommand = exec;

    deleteNodeUndoably(target);

    expect(exec).toHaveBeenCalledTimes(1);
    expect(root.textContent).toBe("ac");
});

test("falls back to remove() if execCommand is unavailable", () => {
    const { root, target } = setup();

    deleteNodeUndoably(target);

    expect(root.textContent).toBe("ac");
});

test("falls back to remove() if execCommand does not delete the node", () => {
    const { root, target } = setup();
    document.execCommand = vi.fn(() => false);

    deleteNodeUndoably(target);

    expect(root.textContent).toBe("ac");
});
