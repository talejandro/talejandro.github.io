// src/foundation/lists/tree-checked.ts
var isLeaf = (tree, key) => tree.children(key).length === 0;
function checkedLeaves(tree, value) {
  const leaves = /* @__PURE__ */ new Set();
  for (const key of value) {
    if (!tree.has(key)) {
      continue;
    }
    if (isLeaf(tree, key)) {
      leaves.add(key);
    } else {
      for (const below of tree.descendants(key)) {
        if (isLeaf(tree, below)) {
          leaves.add(below);
        }
      }
    }
  }
  return leaves;
}
function treeCheckedStates(tree, value, strategy = "leaf") {
  const states = /* @__PURE__ */ new Map();
  if (strategy === "independent") {
    for (const key of value) {
      states.set(key, true);
    }
    return (key) => states.get(key) ?? false;
  }
  const leaves = checkedLeaves(tree, value);
  const count = (key) => {
    if (isLeaf(tree, key)) {
      const checked2 = leaves.has(key);
      if (checked2) {
        states.set(key, true);
      }
      return [1, checked2 ? 1 : 0];
    }
    let total = 0;
    let checked = 0;
    for (const child of tree.children(key)) {
      const [childTotal, childChecked] = count(child);
      total += childTotal;
      checked += childChecked;
    }
    if (checked) {
      states.set(key, checked === total ? true : "indeterminate");
    }
    return [total, checked];
  };
  for (const root of tree.children(null)) {
    count(root);
  }
  return (key) => states.get(key) ?? false;
}
function report(tree, leaves, strategy) {
  const state = treeCheckedStates(tree, [...leaves], "leaf");
  const keys = tree.keys();
  if (strategy === "leaf") {
    return keys.filter((key) => leaves.has(key));
  }
  if (strategy === "branch") {
    return keys.filter((key) => state(key) === true);
  }
  return keys.filter((key) => {
    if (state(key) !== true) {
      return false;
    }
    const parent = tree.parent(key);
    return parent === null || state(parent) !== true;
  });
}
function toggleTreeChecked(tree, value, key, {
  strategy = "leaf",
  checkable = () => true
} = {}) {
  if (!checkable(key)) {
    return [...value];
  }
  if (strategy === "independent") {
    return value.includes(key) ? value.filter((checked) => checked !== key) : [...value, key];
  }
  const leaves = checkedLeaves(tree, value);
  const below = isLeaf(tree, key) ? [key] : tree.descendants(key).filter((node) => isLeaf(tree, node));
  const depth = tree.ancestors(key).length + 1;
  const affected = below.filter(
    (leaf) => checkable(leaf) && tree.ancestors(leaf).slice(depth).every((node) => checkable(node))
  );
  const check = !affected.every((leaf) => leaves.has(leaf));
  for (const leaf of affected) {
    if (check) {
      leaves.add(leaf);
    } else {
      leaves.delete(leaf);
    }
  }
  return report(tree, leaves, strategy);
}
export {
  toggleTreeChecked,
  treeCheckedStates
};
