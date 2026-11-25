/**
 * One node of a tree, as `createTreeCollection` reads it.
 * @stable
 */
type TreeCollectionNode = {
    /** The node's key, unique in the tree. */
    key: string;
    /** The key of the node it's nested in, or `null` at the top level. */
    parent: string | null;
    /** Whether it has children, or can load them, even while none are known yet. */
    branch?: boolean;
};
/**
 * A tree's structure from its nodes, listed parents before children and
 * siblings in order. A node whose parent isn't listed sits at the top level.
 * Every lookup is a map read or a walk up the node's ancestors; `visible`
 * keeps its last answer while the expanded keys stay the same.
 *
 * ```ts
 * const tree = createTreeCollection([
 *   { key: "src", parent: null },
 *   { key: "src/index.ts", parent: "src" },
 *   { key: "README.md", parent: null },
 * ])
 * tree.level("src/index.ts") // 2
 * tree.position("README.md") // { index: 2, size: 2 }
 * tree.visible([]) // ["src", "README.md"]
 * ```
 * @stable
 */
declare function createTreeCollection(nodes: Iterable<TreeCollectionNode>): {
    /** How many nodes the tree has. */
    size: number;
    /** Whether the tree has a node with this key. */
    has: (key: string) => boolean;
    /** The key of the node `key` is nested in, or `null` at the top level. */
    parent: (key: string) => string | null;
    /** The keys of a node's children in order, or of the top-level nodes for `null`. */
    children: (key: string | null) => readonly string[];
    /** Whether a node has children, or was listed as a branch. */
    isBranch: (key: string) => boolean;
    /** A node's depth: 1 at the top level, as `aria-level` counts. */
    level: (key: string) => number;
    /** A node's place among its siblings, both counted from 1, as `aria-posinset` and `aria-setsize` count. */
    position(key: string): {
        index: number;
        size: number;
    };
    /** The keys of a node's ancestors, outermost first. */
    ancestors: (key: string) => string[];
    /** The keys of every node under `key`, in order. */
    descendants: (key: string) => string[];
    /** Every key in order, parents before their children. */
    keys: () => string[];
    /**
     * The keys that show when only the branches in `expanded` are open: the
     * top-level nodes, and the children of every expanded branch whose
     * ancestors are expanded too, in order. Kept while `expanded` holds the
     * same keys, even when it's the same array changed in place.
     */
    visible(expanded: readonly string[]): readonly string[];
};
/**
 * What `createTreeCollection` returns.
 * @stable
 */
type TreeCollection = ReturnType<typeof createTreeCollection>;
/**
 * A node of tree data: a value, the text it shows, and its children.
 * @stable
 */
type TreeItemData = {
    /** Identifies the item. Unique in the tree. */
    value: string;
    /** What it shows, and what typeahead matches. */
    label: string;
    /** Its children. Leave it out for a leaf. An empty array is a branch with no children, or one whose children load when it opens. */
    children?: TreeItemData[];
    /** Whether it can't be selected, checked or activated. It can still take focus. */
    disabled?: boolean;
    /** Makes the item a link to this address. */
    href?: string;
};
/**
 * Lists tree data as collection nodes, parents before children.
 * @stable
 */
declare function treeDataNodes(items: readonly TreeItemData[]): (TreeCollectionNode & {
    item: TreeItemData;
})[];
/**
 * Tree data from a list of file paths, like `["src/index.ts", "README.md"]`.
 * Each folder becomes a branch whose value is its path, and each file a leaf.
 * A path ending in `/` is an empty folder. Folders come first, then files,
 * each in the order the list gives.
 * @stable
 */
declare function treeFromPaths(paths: readonly string[]): TreeItemData[];
/**
 * One row of tree data that shows, with what a flat rendering needs to place it.
 * @stable
 */
type TreeRow = {
    /** The object from your data this row shows, the same one you passed in, children included. */
    item: TreeItemData;
    /** The value of the item it's nested in, or `null` at the top level. */
    parent: string | null;
    /** Its depth, 1 at the top level. */
    level: number;
    /** Its place among the rows that show, from 0, for a virtualized list. */
    index: number;
};
/**
 * The rows of tree data that show when the branches in `expanded` are open,
 * in order, for a flat rendering such as a virtualized list. Render each as
 * a `TreeItem` with its `value`: the tree reads its level, place and children from the data.
 * @stable
 */
declare function visibleTreeRows(items: readonly TreeItemData[], expanded: readonly string[]): TreeRow[];
export { createTreeCollection, type TreeCollection, type TreeCollectionNode, treeDataNodes, treeFromPaths, type TreeItemData, type TreeRow, visibleTreeRows, };
