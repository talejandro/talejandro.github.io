// src/foundation/kernel/attrs.ts
function openAttrs(open) {
  return {
    "data-open": open ? "" : void 0,
    "data-closed": open ? void 0 : ""
  };
}
function checkedAttrs(checked) {
  return {
    "data-checked": checked === true ? "" : void 0,
    "data-unchecked": checked === false ? "" : void 0,
    "data-indeterminate": checked === "indeterminate" ? "" : void 0
  };
}
function idPart(value) {
  return value.replace(/[\s%]/g, encodeURIComponent);
}
export {
  checkedAttrs,
  idPart,
  openAttrs
};
