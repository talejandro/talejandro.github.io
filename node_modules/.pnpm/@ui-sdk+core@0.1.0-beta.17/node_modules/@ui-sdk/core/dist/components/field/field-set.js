// src/components/field/field-set.ts
import { watchFieldsets } from "../../foundation/forms/form.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { descriptionId } from "./field-attrs.js";
function registerById(el, register) {
  let id = el.id;
  let unregister = register(id);
  if (typeof MutationObserver === "undefined") {
    return () => unregister();
  }
  const observer = new MutationObserver(() => {
    if (el.id === id) {
      return;
    }
    id = el.id;
    unregister();
    unregister = register(id);
  });
  observer.observe(el, { attributeFilter: ["id"] });
  return () => {
    observer.disconnect();
    unregister();
  };
}
var fieldSetState = (state) => ({
  disabled: state.disabled || state.inherited
});
var disabledAttrs = (state) => ({
  "data-disabled": state.disabled || state.inherited ? "" : void 0
});
var fieldSetPrimitive = /* @__PURE__ */ definePrimitive({
  name: "field",
  options: { disabled: "boolean" },
  state: (options) => ({
    disabled: !!options.disabled,
    inherited: false,
    legends: [],
    descriptions: []
  }),
  sync: (options) => ({ disabled: !!options.disabled }),
  api: ({ id, store, parts }) => ({
    descriptionId: (key) => descriptionId(parts(), id, key),
    // Parts register a microtask after they bind, since Vue binds them while hydrating.
    register(list, partId) {
      let active = true;
      queueMicrotask(() => {
        if (active) {
          store.set({
            [list]: [
              ...store.get()[list].filter((item) => item !== partId),
              partId
            ]
          });
        }
      });
      return () => {
        active = false;
        queueMicrotask(
          () => store.set({
            [list]: store.get()[list].filter((item) => item !== partId)
          })
        );
      };
    }
  }),
  slots: (slot) => ({
    set: slot({
      state: fieldSetState,
      attrs: (state) => ({
        disabled: state.disabled ? "" : void 0,
        // A <legend> that's the first child names it natively, before scripts
        // run. This also covers a legend rendered as another element.
        "aria-labelledby": state.legends.length ? state.legends.join(" ") : void 0,
        "aria-describedby": state.descriptions.length ? state.descriptions.join(" ") : void 0,
        ...disabledAttrs(state)
      }),
      bind: (el, { store }) => watchFieldsets(el, (inherited) => store.set({ inherited }))
    }),
    legend: slot({
      props: { id: "string" },
      state: fieldSetState,
      attrs: (state, { id, props }) => ({
        id: props.id ?? `${id}-legend`,
        ...disabledAttrs(state)
      }),
      bind: (el, { api }) => registerById(el, (id) => api.register("legends", id))
    }),
    // A FieldDescription right inside a FieldSet, outside any Field, describes the group.
    description: slot({
      props: { id: "string", value: { kind: "string", from: "field" } },
      state: fieldSetState,
      attrs: (state, { key, props, api }) => ({
        id: props.id ?? api.descriptionId(key),
        ...disabledAttrs(state)
      }),
      bind: (el, { api }) => registerById(el, (id) => api.register("descriptions", id))
    })
  }),
  agent: { shown: () => false }
});
var fieldSet = fieldSetPrimitive;
var fieldGroupPrimitive = /* @__PURE__ */ definePrimitive({
  name: "field",
  state: (_options) => ({}),
  // Nothing to set up. The parameter keeps TypeScript inferring the slots.
  api: (_context) => ({}),
  slots: (slot) => ({
    group: slot({ attrs: () => ({}) })
  }),
  agent: { shown: () => false }
});
var fieldGroup = fieldGroupPrimitive;
export {
  fieldGroup,
  fieldSet,
  registerById
};
