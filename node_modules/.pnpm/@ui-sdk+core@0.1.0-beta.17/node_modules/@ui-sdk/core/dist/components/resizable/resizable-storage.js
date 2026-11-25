// src/components/resizable/resizable-storage.ts
var storageKey = (autoSaveId) => `ui-sdk-resizable:${autoSaveId}`;
function defaultStorage() {
  try {
    return typeof localStorage === "undefined" ? void 0 : localStorage;
  } catch {
    return void 0;
  }
}
function entries(storage, key) {
  try {
    const saved = JSON.parse(storage.getItem(key) ?? "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}
function loadLayout(autoSaveId, ids, storage = defaultStorage()) {
  if (!storage) {
    return void 0;
  }
  const layout = entries(storage, storageKey(autoSaveId))[ids.join(",")];
  const valid = Array.isArray(layout) && layout.length === ids.length && layout.every((size) => typeof size === "number" && Number.isFinite(size));
  return valid ? layout : void 0;
}
function saveLayout(autoSaveId, ids, layout, storage = defaultStorage()) {
  if (!storage) {
    return;
  }
  const key = storageKey(autoSaveId);
  const saved = entries(storage, key);
  saved[ids.join(",")] = layout.map((size) => Math.round(size * 1e3) / 1e3);
  try {
    storage.setItem(key, JSON.stringify(saved));
  } catch {
  }
}
export {
  loadLayout,
  saveLayout,
  storageKey
};
