// src/foundation/lists/listbox-keys.ts
import { idPart } from "../kernel/attrs.js";
var SELECT_ALL = "\0select-all";
var selectAllKey = (group) => group === void 0 ? SELECT_ALL : `${SELECT_ALL}:${group}`;
var isSelectAll = (key) => key.startsWith(SELECT_ALL);
function optionId(id, key) {
  if (!key.startsWith("\0")) {
    return `${id}-option-${idPart(key)}`;
  }
  return `${id}-${key.slice(1).replace(/[^\w-]/g, "-")}`;
}
export {
  SELECT_ALL,
  isSelectAll,
  optionId,
  selectAllKey
};
