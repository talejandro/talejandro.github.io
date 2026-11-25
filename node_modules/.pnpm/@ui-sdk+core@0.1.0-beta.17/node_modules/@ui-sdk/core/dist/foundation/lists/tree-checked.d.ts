import type { TreeCollection } from "./tree-collection.js";
/**
 * Which nodes a tree's checked value lists, and whether checks cascade.
 * - `"leaf"`: the checked leaves. A branch is checked when all its leaves are.
 * - `"trunk"`: the outermost fully checked nodes, so a checked folder stands for everything in it.
 * - `"branch"`: every fully checked node, branches and leaves.
 * - `"independent"`: each node on its own, with no cascading and no mixed state.
 * @stable
 */
type TreeCheckStrategy = "leaf" | "trunk" | "branch" | "independent";
/**
 * A node's checkbox: checked, unchecked, or `"indeterminate"` while only some of a branch is checked.
 * @stable
 */
type TreeCheckedState = boolean | "indeterminate";
/**
 * Every node's checkbox for a checked value, from one pass over the tree, so
 * reading a node is a map lookup however big its branch is.
 * @stable
 */
declare function treeCheckedStates(tree: TreeCollection, value: readonly string[], strategy?: TreeCheckStrategy): (key: string) => TreeCheckedState;
/**
 * The checked value after a node's checkbox is pressed. A branch whose
 * checkable leaves are all checked unchecks them, and any other checks them;
 * nodes `checkable` refuses, like disabled ones, keep their state.
 * @stable
 */
declare function toggleTreeChecked(tree: TreeCollection, value: readonly string[], key: string, { strategy, checkable, }?: {
    strategy?: TreeCheckStrategy;
    checkable?: (key: string) => boolean;
}): string[];
export { toggleTreeChecked, type TreeCheckedState, treeCheckedStates, type TreeCheckStrategy, };
