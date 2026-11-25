// src/foundation/kernel/controlled-lists.ts
import { callbackName, defaultName } from "./option-names.js";
import { schemaOf } from "./primitive.js";
import { isPlainObject, markChangedInPlace, sameValue } from "./store.js";
var keysByPrimitive = /* @__PURE__ */ new WeakMap();
function keysOf(primitive) {
  let keys = keysByPrimitive.get(primitive);
  if (keys) {
    return keys;
  }
  const options = schemaOf(primitive).options;
  const controlled = Object.keys(options).filter(
    (key) => defaultName(key) in options || callbackName(key, "Change") in options
  );
  const defaults = new Set(controlled.map(defaultName));
  const data = Object.keys(options).filter((key) => {
    const spec = options[key];
    const kind = typeof spec === "object" ? spec.kind : spec;
    return (kind === "value" || kind === "list") && !controlled.includes(key) && !defaults.has(key);
  });
  keys = { controlled, data };
  keysByPrimitive.set(primitive, keys);
  return keys;
}
function readAll(value, path) {
  if (typeof value !== "object" || value === null || path.includes(value)) {
    return;
  }
  path.push(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      readAll(value[index], path);
    }
  } else if (isPlainObject(value)) {
    for (const key in value) {
      readAll(value[key], path);
    }
  }
  path.pop();
}
function trackList(list, memo) {
  let read = false;
  return memo(() => {
    readAll(list, []);
    if (!read) {
      read = true;
      return list;
    }
    return markChangedInPlace([...list]);
  });
}
function createListSnapshots(primitive, memo) {
  const keys = keysOf(primitive);
  const snapshots = {};
  const trackers = {};
  return (options) => {
    const given = options;
    let swapped;
    for (const key of keys.controlled) {
      const list = given[key];
      if (!Array.isArray(list)) {
        continue;
      }
      const items = [...list];
      let snapshot = snapshots[key];
      if (!snapshot || !sameValue(snapshot, items)) {
        snapshots[key] = snapshot = items;
      }
      swapped ??= { ...given };
      swapped[key] = snapshot;
    }
    for (const key of keys.data) {
      const list = given[key];
      if (!Array.isArray(list)) {
        delete trackers[key];
        continue;
      }
      let tracker = trackers[key];
      if (tracker?.list !== list) {
        trackers[key] = tracker = { list, handed: trackList(list, memo) };
      }
      const handed = tracker.handed();
      if (handed === list) {
        continue;
      }
      swapped ??= { ...given };
      swapped[key] = handed;
    }
    return swapped ?? options;
  };
}
export {
  createListSnapshots
};
