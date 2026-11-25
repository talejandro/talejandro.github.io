// src/foundation/lists/tree-collection.ts
import { sameValue } from "../kernel/store.js";
function createTreeCollection(nodes) {
  const entries = /* @__PURE__ */ new Map();
  const roots = [];
  for (const node of nodes) {
    if (entries.has(node.key)) {
      continue;
    }
    entries.set(node.key, {
      parent: node.parent,
      children: [],
      branch: !!node.branch,
      index: 0
    });
  }
  for (const [key, entry] of entries) {
    const parent2 = entry.parent === null ? void 0 : entries.get(entry.parent);
    if (!parent2) {
      entry.parent = null;
    }
    const siblings = parent2 ? parent2.children : roots;
    entry.index = siblings.push(key);
  }
  const none = [];
  const children = (key) => key === null ? roots : entries.get(key)?.children ?? none;
  const parent = (key) => entries.get(key)?.parent ?? null;
  function ancestors(key) {
    const found = [];
    for (let up = parent(key); up !== null; up = parent(up)) {
      found.unshift(up);
    }
    return found;
  }
  function walk(key, enter, into) {
    for (const child of children(key)) {
      into.push(child);
      if (enter(child)) {
        walk(child, enter, into);
      }
    }
    return into;
  }
  let lastExpanded;
  let lastVisible = none;
  return {
    /** How many nodes the tree has. */
    size: entries.size,
    /** Whether the tree has a node with this key. */
    has: (key) => entries.has(key),
    /** The key of the node `key` is nested in, or `null` at the top level. */
    parent,
    /** The keys of a node's children in order, or of the top-level nodes for `null`. */
    children,
    /** Whether a node has children, or was listed as a branch. */
    isBranch: (key) => {
      const entry = entries.get(key);
      return !!entry && (entry.branch || entry.children.length > 0);
    },
    /** A node's depth: 1 at the top level, as `aria-level` counts. */
    level: (key) => ancestors(key).length + 1,
    /** A node's place among its siblings, both counted from 1, as `aria-posinset` and `aria-setsize` count. */
    position(key) {
      const entry = entries.get(key);
      if (!entry) {
        return { index: 0, size: 0 };
      }
      return { index: entry.index, size: children(entry.parent).length };
    },
    /** The keys of a node's ancestors, outermost first. */
    ancestors,
    /** The keys of every node under `key`, in order. */
    descendants: (key) => walk(key, () => true, []),
    /** Every key in order, parents before their children. */
    keys: () => walk(null, () => true, []),
    /**
     * The keys that show when only the branches in `expanded` are open: the
     * top-level nodes, and the children of every expanded branch whose
     * ancestors are expanded too, in order. Kept while `expanded` holds the
     * same keys, even when it's the same array changed in place.
     */
    visible(expanded) {
      if (lastExpanded && sameValue(lastExpanded, expanded)) {
        return lastVisible;
      }
      const open = new Set(expanded);
      lastExpanded = [...expanded];
      return lastVisible = walk(null, (key) => open.has(key), []);
    }
  };
}
function treeDataNodes(items) {
  const nodes = [];
  const add = (list, parent) => {
    for (const item of list) {
      nodes.push({
        key: item.value,
        parent,
        branch: item.children !== void 0,
        item
      });
      if (item.children) {
        add(item.children, item.value);
      }
    }
  };
  add(items, null);
  return nodes;
}
function treeFromPaths(paths) {
  const top = [];
  const folders = /* @__PURE__ */ new Map();
  const folder = (path, label, into) => {
    let children = folders.get(path);
    if (!children) {
      folders.set(path, children = []);
      into.push({ value: path, label, children });
    }
    return children;
  };
  for (const path of paths) {
    const segments = path.split("/");
    const isFolder = segments.at(-1) === "";
    if (isFolder) {
      segments.pop();
    }
    let into = top;
    let prefix = "";
    segments.forEach((segment, index) => {
      prefix = prefix ? `${prefix}/${segment}` : segment;
      if (index < segments.length - 1 || isFolder) {
        into = folder(prefix, segment, into);
      } else if (!into.some((item) => item.value === prefix)) {
        into.push({ value: prefix, label: segment });
      }
    });
  }
  const foldersFirst = (items) => [
    ...items.filter((item) => item.children),
    ...items.filter((item) => !item.children)
  ].map(
    (item) => item.children ? { ...item, children: foldersFirst(item.children) } : item
  );
  return foldersFirst(top);
}
function visibleTreeRows(items, expanded) {
  const open = new Set(expanded);
  const rows = [];
  const add = (list, parent, level) => {
    for (const item of list) {
      rows.push({ item, parent, level, index: rows.length });
      if (item.children && open.has(item.value)) {
        add(item.children, item.value, level + 1);
      }
    }
  };
  add(items, null, 1);
  return rows;
}
export {
  createTreeCollection,
  treeDataNodes,
  treeFromPaths,
  visibleTreeRows
};
