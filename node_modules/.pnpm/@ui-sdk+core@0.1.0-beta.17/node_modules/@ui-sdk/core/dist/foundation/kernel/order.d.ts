/** Whether `later` comes after `node` in the document. */
declare const isAfter: (node: Node, later: Node) => boolean;
/** Compares two nodes for a sort into document order. */
declare const documentOrder: (a: Node, b: Node) => 1 | -1;
declare function inDocumentOrder<Entry extends {
    el: HTMLElement;
}>(entries: Entry[]): Entry[];
/**
 * Keyed items in document order: sorted once, and kept after that. Items that
 * join take their places in the kept list by binary search, and items that
 * leave drop out, so a branch expanding in a long tree costs its own items,
 * not the whole list. Only a move sorts again. Menus, roving groups, toggle
 * groups and listboxes share it, so a key press reads a cached list instead
 * of sorting every item. `elements()` sorts on every call instead, so
 * components without a collection don't ship this.
 */
declare function createOrder<Entry extends {
    key: string;
    el: HTMLElement;
}>(): {
    /** The entries in the page, in document order. Shared until one is added, removed or moved. */
    list(): readonly Entry[];
    /** Adds an entry, or replaces the one with its key. Returns its removal. */
    add(entry: Entry): () => void;
    get: (key: string) => Entry | undefined;
    size: () => number;
};
export { createOrder, documentOrder, inDocumentOrder, isAfter };
