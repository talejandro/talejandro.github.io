// src/components/segmented-control/segmented-control.ts
import {
  orientationOf
} from "../../foundation/focus/collection.js";
import { isDisabled } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  bindIndicator,
  directionBetween
} from "../../foundation/selection/indicator.js";
import {
  radioGroupApi,
  radioGroupState,
  syncRadioGroup
} from "../radio/radio-api.js";
import { radioSlots } from "../radio/radio-parts.js";
function createSegmentedControlController() {
  return createController();
}
var slotNames = { group: "root", item: "item" };
var indicatorVariables = [
  "left",
  "right",
  "top",
  "bottom",
  "width",
  "height"
];
var orientation = (options) => orientationOf(options.orientation, "horizontal");
var segmentedControlPrimitive = /* @__PURE__ */ definePrimitive({
  name: "segmented-control",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    loop: "boolean",
    orientation: "string",
    controller: "value"
  },
  state: (options) => radioGroupState(options, {
    orientation: orientation(options),
    direction: "none"
  }),
  sync: (options) => ({
    ...syncRadioGroup(options),
    orientation: orientation(options)
  }),
  api: (context) => radioGroupApi(context, slotNames),
  slots: (slot) => {
    const { group, item, input } = radioSlots(slot, (state) => ({
      value: state.value,
      disabled: isDisabled(state),
      readOnly: state.readOnly,
      required: state.required,
      orientation: state.orientation ?? "horizontal"
    }));
    return {
      root: group,
      item,
      input,
      indicator: slot({
        role: "presentation",
        state: (state) => ({
          value: state.value,
          orientation: state.orientation ?? "horizontal",
          direction: state.direction ?? "none"
        }),
        attrs: (state) => ({
          "data-orientation": state.orientation,
          "data-activation-direction": state.direction ?? "none"
        }),
        bind(el, { api, store }) {
          let value = store.get().value;
          const rect = (key) => key === null ? void 0 : api.internal.radio(key)?.getBoundingClientRect();
          return bindIndicator({
            list: () => api.internal.group() ?? el.parentElement,
            active: () => {
              const { value: value2 } = store.get();
              return value2 === null ? void 0 : api.internal.radio(value2);
            },
            itemSelector: '[role="radio"]',
            subscribe: (remeasure) => store.subscribe(() => {
              if (store.get().value === value) {
                return;
              }
              const direction = directionBetween(
                rect(value),
                rect(store.get().value),
                store.get().orientation ?? "horizontal"
              );
              value = store.get().value;
              el.setAttribute("data-activation-direction", direction);
              store.set({ direction });
              remeasure();
            }),
            write(box) {
              for (const name of indicatorVariables) {
                if (box) {
                  el.style.setProperty(
                    `--segmented-control-indicator-${name}`,
                    `${box[name]}px`
                  );
                } else {
                  el.style.removeProperty(
                    `--segmented-control-indicator-${name}`
                  );
                }
              }
            }
          });
        }
      })
    };
  },
  agent: { actions: ["setValue"], closed: true }
});
var segmentedControl = segmentedControlPrimitive;
export {
  createSegmentedControlController,
  segmentedControl
};
