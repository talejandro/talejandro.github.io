// src/foundation/lists/field-name.ts
import { later } from "../kernel/bound-keys.js";
function fieldNameOf(el, id) {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy && labelledBy !== `${id}-label`) {
    return { labelledBy };
  }
  const labels = [...el.labels ?? []].map((label2) => label2.id).filter(Boolean);
  if (labels.length) {
    return { labelledBy: labels.join(" ") };
  }
  const label = el.getAttribute("aria-label");
  return label ? { label } : null;
}
function bindFieldName(el, store, id) {
  later(store, (draft) => {
    const next = fieldNameOf(el, id);
    if (JSON.stringify(next) !== JSON.stringify(store.get().fieldName)) {
      draft.fieldName = next;
    }
  });
}
function listName(state, id) {
  const named = state.labeled ? null : state.fieldName;
  return {
    "aria-labelledby": state.labeled ? `${id}-label` : named && "label" in named ? void 0 : named?.labelledBy ?? `${id}-input`,
    "aria-label": named && "label" in named ? named.label : void 0
  };
}
export {
  bindFieldName,
  listName
};
