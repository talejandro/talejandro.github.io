// src/components/radio/radio.ts
import { animateIn, animateOut } from "../../foundation/motion/presence.js";
import { isDisabled } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { selects } from "../../foundation/kernel/selects.js";
import { subscribe } from "../../foundation/kernel/part.js";
import {
  itemData,
  itemState,
  radioGroupApi,
  radioGroupState,
  syncRadioGroup
} from "./radio-api.js";
import { radioSlots } from "./radio-parts.js";
function createRadioGroupController() {
  return createController();
}
var radioGroupPrimitive = /* @__PURE__ */ definePrimitive({
  name: "radio",
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
    controller: "value"
  },
  state: radioGroupState,
  sync: syncRadioGroup,
  api: (context) => radioGroupApi(context),
  slots: (slot) => {
    const { group, item, input } = radioSlots(slot, (state) => ({
      value: state.value,
      disabled: isDisabled(state),
      readOnly: state.readOnly,
      required: state.required
    }));
    return {
      group,
      root: item,
      input,
      indicator: slot({
        props: {
          value: { kind: "string", from: "root" },
          keepMounted: "boolean"
        },
        // Every renderer fills the value from the item around it. Indicators skip
        // the tab stop, which moves with every arrow key, and only ask whether
        // their own value is exiting.
        selects: selects({
          value: ({ props }) => [props.value],
          stop: [],
          exiting: ({ props }) => [props.value]
        }),
        present: (state, { props: { value, keepMounted } }) => !!keepMounted || state.value === value || state.exiting.includes(value),
        state: (state, { props: { value }, api }) => itemState(state, value, api.internal.itemProps(value)),
        attrs: (state, { props: { value }, api }) => itemData(state, value, api.internal.itemProps(value)),
        bind(el, part) {
          const { api, store, props } = part;
          const key = props.value;
          let stop;
          let shown = store.get().value === key;
          if (shown && api.isChanged()) {
            stop = animateIn(el);
          }
          const unsubscribe = subscribe(part, () => {
            const { value, exiting } = store.get();
            if (value === key === shown) {
              return;
            }
            shown = value === key;
            stop?.();
            stop = void 0;
            el.toggleAttribute("data-checked", shown);
            el.toggleAttribute("data-unchecked", !shown);
            if (shown) {
              stop = animateIn(el);
            } else if (exiting.includes(key) || props.keepMounted) {
              stop = animateOut(el, () => {
                stop = void 0;
                api.internal.finishExit(key);
              });
            }
          });
          return () => {
            unsubscribe();
            stop?.();
          };
        }
      })
    };
  },
  agent: { actions: ["setValue"], closed: true }
});
var radioGroup = radioGroupPrimitive;
export {
  createRadioGroupController,
  radioGroup
};
