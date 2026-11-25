// src/components/slider/slider.ts
import { bindValueInput, bindInternals } from "../../foundation/forms/form.js";
import { css } from "../../foundation/kernel/inline-style.js";
import { bindPageLocale } from "../../foundation/text/locale.js";
import "../../foundation/number/format.js";
import { parseRange } from "../../foundation/number/parse.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  isDisabled,
  normalized,
  rangeOf,
  settings,
  sliderApi,
  submitted,
  formatValue,
  thumbValuesOf,
  valuesOf
} from "./slider-api.js";
import { boundsBetween, percentOf } from "./slider-values.js";
import { selects } from "../../foundation/kernel/selects.js";
import { subscribe } from "../../foundation/kernel/part.js";
function createSliderController() {
  return createController();
}
function valueAttribute(attribute) {
  const values = attribute === null ? null : parseRange(attribute);
  if (!values) {
    return void 0;
  }
  return values.length === 1 ? values[0] : values;
}
function sliderState(state) {
  return { value: state.value, ...sharedState(state) };
}
function sharedState(state) {
  return {
    disabled: isDisabled(state),
    readOnly: state.readOnly,
    required: state.required,
    dragging: state.active !== null,
    orientation: state.orientation
  };
}
var thumbValue = (state, index) => state.thumbValues[index] ?? state.min;
function dataAttrs(state) {
  return {
    "data-orientation": state.orientation,
    "data-disabled": isDisabled(state) ? "" : void 0,
    "data-readonly": state.readOnly ? "" : void 0,
    "data-required": state.required ? "" : void 0,
    "data-dragging": state.active !== null ? "" : void 0
  };
}
function thumbStyle(state, index, percent) {
  percent ||= 0;
  const vertical = state.orientation === "vertical";
  return css({
    position: "absolute",
    ...vertical ? { bottom: `${percent}%`, left: "50%", translate: "-50% 50%" } : {
      "inset-inline": `calc(${percent}% - 50%) calc(50% - ${percent}%)`,
      "margin-inline": "auto",
      "justify-self": "center",
      top: "50%",
      translate: "0 -50%"
    },
    "z-index": state.active === index ? 2 : state.last === index ? 1 : void 0,
    "--slider-thumb-position": `${percent}%`
  });
}
function indicatorStyle(state) {
  const range = rangeOf(state);
  const all = valuesOf(state.value);
  const start = all.length > 1 ? percentOf(all[0], range) : 0;
  const end = percentOf(all[all.length - 1], range);
  const size = Math.round((end - start) * 1e4) / 1e4;
  const vertical = state.orientation === "vertical";
  return css({
    position: "absolute",
    [vertical ? "bottom" : "inset-inline-start"]: `${start}%`,
    [vertical ? "height" : "width"]: `${size}%`,
    ...vertical ? { left: 0, right: 0 } : { top: 0, bottom: 0 },
    "--slider-indicator-start": `${start}%`,
    "--slider-indicator-size": `${size}%`
  });
}
var rangeInputStyle = css({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  padding: 0,
  border: 0,
  opacity: 0,
  overflow: "hidden",
  "clip-path": "inset(50%)",
  "white-space": "nowrap",
  "pointer-events": "none"
});
var thumbInputId = (state, id, index) => index === 0 && state.thumbInputId || `${id}-thumb-${index}`;
var sliderPrimitive = /* @__PURE__ */ definePrimitive({
  name: "slider",
  options: {
    value: valueAttribute,
    defaultValue: valueAttribute,
    onValueChange: "callback",
    onValueCommit: "callback",
    min: "number",
    max: "number",
    step: "number",
    largeStep: "number",
    minStepsBetweenThumbs: "number",
    orientation: "string",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    format: "value",
    locale: "string",
    controller: "value",
    // Internal: passed by renderers.
    thumbInputId: "string"
  },
  state: (options) => {
    const initial = normalized(
      options.value ?? options.defaultValue ?? options.min ?? 0,
      options
    );
    return {
      ...settings(options),
      value: initial,
      initial: normalized(options.defaultValue ?? initial, options),
      formDisabled: false,
      pageLocale: null,
      active: null,
      last: null,
      thumbValues: thumbValuesOf(initial),
      thumbInputId: options.thumbInputId ?? null
    };
  },
  sync: (options) => ({
    ...settings(options),
    // Like `defaultChecked`, changing it changes what a reset returns to.
    ...options.defaultValue === void 0 ? {} : { initial: normalized(options.defaultValue, options) },
    ...options.value === void 0 ? {} : { value: normalized(options.value, options) },
    ...options.thumbInputId === void 0 ? {} : { thumbInputId: options.thumbInputId }
  }),
  commits: ["value"],
  api: sliderApi,
  slots: (slot) => ({
    root: slot({
      role: "group",
      state: sliderState,
      attrs: (state, { id }) => ({
        id: state.thumbInputId && valuesOf(state.value).length > 1 ? `${id}-group` : void 0,
        ...dataAttrs(state)
      }),
      bind: (el, { api, store }) => {
        bindPageLocale(el, (pageLocale) => store.set({ pageLocale }));
        return bindInternals(el, {
          value: api.internal.submitted,
          state: () => submitted(store.get()),
          restore: api.internal.restore,
          valueMissing: () => false,
          message: () => "",
          anchor: () => el.querySelector('[data-slot="slider-thumb-input"]') ?? el,
          focus: () => api.focus(),
          reset: api.internal.reset,
          disabled: api.internal.setFormDisabled,
          subscribe: store.subscribe
        });
      }
    }),
    // Where presses land. A press on the track moves the nearest thumb there.
    control: slot({
      state: sliderState,
      attrs: (state) => ({ ...dataAttrs(state), style: "touch-action:none" }),
      on: {
        pointerdown: (event, { api, el }) => el && api.internal.press(event, el)
      }
    }),
    // The rail the thumbs move along. Positions are percentages of it.
    track: slot({
      state: sliderState,
      attrs: (state) => ({ ...dataAttrs(state), style: "position:relative" })
    }),
    indicator: slot({
      state: sliderState,
      attrs: (state) => ({ ...dataAttrs(state), style: indicatorStyle(state) })
    }),
    thumb: slot({
      props: { index: "number" },
      selects: selects({
        value: [],
        thumbValues: ({ props }) => [String(props.index ?? 0)],
        last: ({ props }) => [props.index ?? 0]
      }),
      state: (state, { props }) => {
        const index = props.index ?? 0;
        const value = thumbValue(state, index);
        return {
          ...sharedState(state),
          index,
          thumbValue: value,
          percent: percentOf(value, rangeOf(state))
        };
      },
      attrs: (state, { props }) => {
        const index = props.index ?? 0;
        const percent = percentOf(thumbValue(state, index), rangeOf(state));
        return {
          ...dataAttrs(state),
          "data-index": String(index),
          "data-dragging": state.active === index ? "" : void 0,
          style: thumbStyle(state, index, percent)
        };
      }
    }),
    // The native range input inside each thumb, which takes focus. Screen
    // readers on phones adjust it with their own gestures. It takes its thumb's index.
    "thumb-input": slot({
      role: "slider",
      focus: "native",
      // Every arrow moves it whatever its orientation, as a native range's do.
      keys: [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "shift+ArrowUp",
        "shift+ArrowDown",
        "shift+ArrowLeft",
        "shift+ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End"
      ],
      props: { index: { kind: "number", from: "thumb" } },
      // Its range ends at its neighbours, so it hears their moves and its own.
      selects: selects({
        value: [],
        thumbValues: ({ props }) => {
          const index = props.index ?? 0;
          return [String(index - 1), String(index), String(index + 1)];
        },
        active: [],
        last: []
      }),
      attrs: (state, { id, props }) => {
        const index = props.index ?? 0;
        const value = thumbValue(state, index);
        const { lower, upper } = boundsBetween(
          state.thumbValues[index - 1],
          state.thumbValues[index + 1],
          rangeOf(state)
        );
        return {
          type: "range",
          id: thumbInputId(state, id, index),
          min: String(lower),
          max: String(upper),
          step: String(state.step),
          value: String(value),
          // The range input's value says it, without another write per move.
          "aria-valuenow": void 0,
          "aria-valuetext": formatValue(value, state),
          "aria-orientation": state.orientation,
          disabled: isDisabled(state) ? "" : void 0,
          // A native range ignores `readonly`, so only its role says it.
          "aria-readonly": state.readOnly ? "true" : void 0,
          "data-disabled": isDisabled(state) ? "" : void 0,
          "data-readonly": state.readOnly ? "" : void 0,
          style: rangeInputStyle
        };
      },
      on: {
        keydown: (event, { api, el, props }) => el && api.internal.keydown(event, props.index ?? 0, el),
        keyup: (event, { api }) => api.internal.commitKeys(event),
        focusout: (_, { api }) => api.internal.commitKeys(),
        input: (event, { api, el, props }) => {
          const input = el;
          api.internal.adjust(props.index ?? 0, input.valueAsNumber, event);
          api.internal.syncInput(input, props.index ?? 0);
        }
      },
      bind: (el, part) => {
        const { api, props } = part;
        const input = el;
        const index = props.index ?? 0;
        const write = () => api.internal.syncInput(input, index);
        write();
        const cleanups = [subscribe(part, write)];
        return () => cleanups.forEach((cleanup) => cleanup());
      }
    }),
    // The formatted value. An <output> tied to the thumbs, never announced on
    // its own, since each thumb already says its value.
    value: slot({
      // An <output> is a status already. Other elements, like a custom element, say so.
      role: "status",
      state: (state) => ({
        ...sliderState(state),
        text: valuesOf(state.value).map((value) => formatValue(value, state)).join(" \u2013 ")
      }),
      attrs: (state, { id }) => ({
        for: valuesOf(state.value).map((_, index) => thumbInputId(state, id, index)).join(" "),
        "aria-live": "off",
        ...dataAttrs(state)
      })
    }),
    // React and Vue: the hidden input the form submits.
    input: slot({
      attrs: (state) => ({
        type: "hidden",
        name: state.name,
        value: submitted(state),
        form: state.form,
        disabled: state.disabled ? "" : void 0
      }),
      bind: (el, { api, store }) => bindValueInput(el, {
        value: () => submitted(store.get()),
        subscribe: store.subscribe,
        focus: () => api.focus(),
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled
      })
    })
  }),
  agent: { actions: ["setValue"] }
});
var slider = sliderPrimitive;
export {
  createSliderController,
  slider
};
