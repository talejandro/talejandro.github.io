// src/components/otp-input/otp-input.ts
import { warn } from "#dev";
import { css } from "../../foundation/kernel/inline-style.js";
import {
  badgeSpace,
  cleanCode,
  otpInputApi,
  isDisabled,
  settings
} from "./otp-input-api.js";
import {
  inputModeFor,
  patternAttribute,
  slotsOf
} from "./otp-input-model.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createOTPInputController() {
  return createController();
}
function readPattern(attribute) {
  if (attribute === null) {
    return void 0;
  }
  if (attribute === "digits" || attribute === "letters" || attribute === "alphanumeric") {
    return attribute;
  }
  try {
    return new RegExp(attribute);
  } catch {
    warn(
      `pattern "${attribute}" isn't a valid regular expression, so it takes digits.`,
      {
        component: "otp-input"
      }
    );
    return "digits";
  }
}
var slotCache = /* @__PURE__ */ new WeakMap();
function slotsFor(state) {
  let slots = slotCache.get(state);
  if (!slots) {
    slots = slotsOf(
      state.value,
      state.maxLength,
      state.focused ? state.selection : null
    );
    slotCache.set(state, slots);
  }
  return slots;
}
function rootState(state) {
  return {
    value: state.value,
    slots: slotsFor(state),
    focused: state.focused,
    complete: state.value.length === state.maxLength,
    disabled: isDisabled(state)
  };
}
function rootAttrs(state) {
  return {
    "data-focused": state.focused ? "" : void 0,
    "data-complete": state.value.length === state.maxLength ? "" : void 0,
    "data-filled": state.value ? "" : void 0,
    "data-disabled": isDisabled(state) ? "" : void 0
  };
}
function inputStyle(state) {
  return css({
    position: "absolute",
    inset: 0,
    width: state.pushBadge ? `calc(100% + ${badgeSpace}px)` : "100%",
    height: "100%",
    "clip-path": state.pushBadge ? `inset(0 ${badgeSpace}px 0 0)` : void 0,
    margin: 0,
    padding: 0,
    border: 0,
    outline: "none",
    "box-shadow": "none",
    appearance: "none",
    background: "transparent",
    color: "transparent",
    "-webkit-text-fill-color": "transparent",
    "caret-color": "transparent",
    "font-size": "16px",
    "font-family": "monospace",
    "letter-spacing": "-0.5em",
    "text-align": state.textAlign
  });
}
var otpInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "otp-input",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    onValueCommit: "callback",
    maxLength: "number",
    pattern: readPattern,
    inputMode: "string",
    textAlign: "string",
    autoComplete: "string",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value"
  },
  state: (options) => {
    const base = settings(options);
    return {
      ...base,
      value: cleanCode(
        options.value ?? options.defaultValue ?? "",
        base.pattern,
        base.maxLength
      ),
      initial: cleanCode(
        options.defaultValue ?? "",
        base.pattern,
        base.maxLength
      ),
      formDisabled: false,
      tooShort: false,
      focused: false,
      selection: { start: 0, end: 0 },
      pushBadge: false
    };
  },
  sync: (options) => {
    const base = settings(options);
    return {
      ...base,
      ...options.defaultValue === void 0 ? {} : {
        initial: cleanCode(
          options.defaultValue,
          base.pattern,
          base.maxLength
        )
      },
      ...options.value === void 0 ? {} : { value: cleanCode(options.value, base.pattern, base.maxLength) }
    };
  },
  api: otpInputApi,
  slots: (slot) => ({
    // Holds the slots and the input over them.
    root: slot({
      state: rootState,
      attrs: (state) => ({ ...rootAttrs(state), style: "position:relative" })
    }),
    // The real input, which takes focus, holds the code and submits it.
    control: slot({
      state: rootState,
      attrs: (state) => ({
        type: "text",
        value: state.value,
        maxlength: String(state.maxLength),
        // A partial code is too short to submit.
        minlength: String(state.maxLength),
        pattern: patternAttribute(
          state.pattern,
          state.maxLength,
          state.tooShort
        ),
        inputmode: state.inputMode ?? inputModeFor(state.pattern),
        autocomplete: state.autoComplete,
        autocorrect: "off",
        autocapitalize: "off",
        spellcheck: "false",
        name: state.name,
        form: state.form,
        disabled: state.disabled ? "" : void 0,
        readonly: state.readOnly ? "" : void 0,
        required: state.required ? "" : void 0,
        ...rootAttrs(state),
        style: inputStyle(state)
      }),
      bind: (el, { api }) => api.internal.bind(el)
    }),
    // Lays out a run of slots. Like the slots, it's only drawn: the input is what's announced.
    group: slot({
      state: rootState,
      attrs: (state) => ({ "aria-hidden": "true", ...rootAttrs(state) })
    }),
    slot: slot({
      props: { index: "number" },
      state: (state, { props }) => {
        const index = props.index ?? 0;
        return {
          ...slotsFor(state)[index] ?? {
            char: null,
            active: false,
            hasFakeCaret: false
          },
          index,
          focused: state.focused,
          disabled: isDisabled(state)
        };
      },
      attrs: (state, { props }) => {
        const data = slotsFor(state)[props.index ?? 0];
        return {
          "aria-hidden": "true",
          "data-active": data?.active ? "" : void 0,
          "data-filled": data?.char ? "" : void 0,
          "data-fake-caret": data?.hasFakeCaret ? "" : void 0,
          "data-disabled": isDisabled(state) ? "" : void 0
        };
      }
    }),
    // Drawn between groups, like a dash.
    separator: slot({
      state: rootState,
      attrs: (state) => ({
        "aria-hidden": "true",
        "data-disabled": isDisabled(state) ? "" : void 0
      })
    })
  }),
  agent: { actions: ["setValue", "clear"], secret: true }
});
var otpInput = otpInputPrimitive;
export {
  createOTPInputController,
  otpInput
};
