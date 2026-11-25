// src/components/rating/rating.ts
import { isDisabled } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  radioGroupApi,
  radioGroupState,
  syncRadioGroup
} from "../radio/radio-api.js";
import {
  bindRadioGroup,
  radioGroupAttrs,
  radioSlots
} from "../radio/radio-parts.js";
function createRatingController() {
  return createController();
}
var slotNames = { group: "root", item: "radio" };
var defaultLabel = (value) => value === 1 ? "1 star" : `${value} stars`;
var keyOf = (value) => value === void 0 ? void 0 : value === null ? null : String(value);
var scoreOf = (key) => key == null ? null : Number(key);
function ratingItemValues(index, step = 1) {
  const parts = partsPerStar(step);
  return Array.from(
    { length: parts },
    (_, part) => Number((index - 1 + (part + 1) / parts).toFixed(4))
  );
}
var partsPerStar = (step) => Math.max(1, Math.round(1 / step));
function radioOptions(options) {
  const { onValueChange } = options;
  return {
    value: keyOf(options.value),
    defaultValue: keyOf(options.defaultValue),
    onValueChange: onValueChange && ((key, details) => onValueChange(scoreOf(key), details)),
    disabled: options.disabled,
    readOnly: options.readOnly,
    required: options.required,
    name: options.name,
    form: options.form,
    loop: options.loop ?? false
  };
}
var fillOf = (state, index) => {
  const shown = scoreOf(state.highlighted) ?? scoreOf(state.value) ?? 0;
  return Math.min(1, Math.max(0, Number((shown - (index - 1)).toFixed(4))));
};
function itemState(state, index) {
  const highlighted = scoreOf(state.highlighted);
  return {
    index,
    fill: fillOf(state, index),
    checked: state.value !== null && Math.ceil(Number(state.value)) === index,
    highlighted: highlighted !== null && index <= Math.ceil(highlighted),
    disabled: isDisabled(state),
    readOnly: state.readOnly
  };
}
var labelSettings = (options) => ({
  max: options.max ?? 5,
  getValueLabel: options.getValueLabel
});
var labelOf = (state, value) => (state.getValueLabel ?? defaultLabel)(value, state.max);
var interactive = (state) => !isDisabled(state) && !state.readOnly;
function ratingApiBody(context) {
  const { store, options } = context;
  const radio = radioGroupApi(
    {
      ...context,
      options: () => radioOptions(options()),
      onOptions: (listener) => context.onOptions(
        (next, synced) => listener(radioOptions(next), synced)
      )
    },
    slotNames
  );
  return {
    ...radio,
    getValue: () => scoreOf(radio.getValue()),
    setValue: (value, details) => radio.setValue(keyOf(value) ?? null, details),
    internal: {
      ...radio.internal,
      check: (key, details) => radio.setValue(
        key === store.get().value && options().deselectable ? null : key,
        details
      ),
      highlight(key) {
        if (store.get().highlighted !== key) {
          store.set({ highlighted: key });
        }
      },
      max: () => options().max ?? 5,
      partsPerStar: () => partsPerStar(options().step ?? 1),
      values: (index) => ratingItemValues(index, options().step ?? 1)
    }
  };
}
var ratingApi = ratingApiBody;
var ratingPrimitive = /* @__PURE__ */ definePrimitive({
  name: "rating",
  options: {
    value: "number",
    defaultValue: "number",
    onValueChange: "callback",
    max: "number",
    step: "number",
    deselectable: "boolean",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    loop: "boolean",
    getValueLabel: "value",
    controller: "value"
  },
  state: (options) => ({
    ...radioGroupState(radioOptions(options), { highlighted: null }),
    ...labelSettings(options)
  }),
  sync: (options) => ({
    ...syncRadioGroup(radioOptions(options)),
    ...labelSettings(options)
  }),
  api: ratingApi,
  slots: (slot) => {
    const { item, input } = radioSlots(
      slot,
      () => ({}),
      (state, key, api) => {
        const parts = api.internal.partsPerStar();
        const value = Number(key);
        const part = Math.round((value - Math.ceil(value) + 1) * parts);
        return {
          "aria-label": labelOf(state, value),
          // The radios split their star between them, under its icon.
          style: `position:absolute;inset-block:0;inset-inline-start:${(part - 1) / parts * 100}%;width:${100 / parts}%;margin:0;padding:0;border:0;background:none`,
          // A read-only rating is one image, which names the score itself.
          ...state.readOnly ? { "aria-hidden": "true", tabindex: "-1" } : {}
        };
      }
    );
    return {
      root: slot({
        role: (state) => state.readOnly ? "img" : "radiogroup",
        roles: ["radiogroup", "img"],
        keys: {
          none: "Focus stays on a star's radio, whose keydown handles them."
        },
        state: (state) => ({
          value: scoreOf(state.value),
          highlighted: scoreOf(state.highlighted),
          disabled: isDisabled(state),
          readOnly: state.readOnly,
          required: state.required
        }),
        attrs: (state, { api }) => state.readOnly ? {
          "aria-label": labelOf(state, scoreOf(state.value) ?? 0),
          "data-readonly": "",
          "data-disabled": isDisabled(state) ? "" : void 0,
          "data-required": state.required ? "" : void 0
        } : radioGroupAttrs(state),
        on: {
          pointermove: (event, { api, store }) => {
            if (event.pointerType === "touch" || !interactive(store.get())) {
              return;
            }
            const radio = event.target.closest?.('[role="radio"]');
            const over = api.internal.roving.items().find((entry) => entry.el === radio);
            if (over && !api.internal.itemProps(over.key).disabled) {
              api.internal.highlight(over.key);
            }
          },
          pointerleave: (_event, { api }) => api.internal.highlight(null)
        },
        bind: (el, { api, store }) => bindRadioGroup(el, api, store)
      }),
      item: slot({
        props: { index: "number" },
        state: (state, { props }) => itemState(state, props.index),
        attrs: (state, { props }) => {
          const { fill, checked, highlighted, disabled, readOnly } = itemState(
            state,
            props.index
          );
          return {
            "data-filled": fill === 1 ? "" : void 0,
            "data-partial": fill > 0 && fill < 1 ? "" : void 0,
            "data-checked": checked ? "" : void 0,
            "data-highlighted": highlighted ? "" : void 0,
            "data-disabled": disabled ? "" : void 0,
            "data-readonly": readOnly ? "" : void 0,
            style: `position:relative;--rating-fill:${fill}`
          };
        }
      }),
      radio: item,
      input
    };
  },
  agent: { actions: ["setValue"], closed: true }
});
var rating = ratingPrimitive;
export {
  createRatingController,
  rating,
  ratingItemValues
};
