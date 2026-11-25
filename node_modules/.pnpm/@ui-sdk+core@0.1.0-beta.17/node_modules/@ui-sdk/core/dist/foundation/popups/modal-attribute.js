// src/foundation/popups/modal-attribute.ts
function modalAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  if (attribute === "false") {
    return false;
  }
  if (attribute === "pointer" || attribute === "trap-focus") {
    return attribute;
  }
  return true;
}
function pointerModalAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  if (attribute === "false") {
    return false;
  }
  if (attribute === "pointer") {
    return "pointer";
  }
  return true;
}
export {
  modalAttribute,
  pointerModalAttribute
};
