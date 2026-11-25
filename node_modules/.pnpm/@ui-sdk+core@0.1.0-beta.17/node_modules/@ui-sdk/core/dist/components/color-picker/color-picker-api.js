// src/components/color-picker/color-picker-api.ts
import {
  createArea
} from "../../foundation/direct-manipulation/area.js";
import { createDragSession } from "../../foundation/drag-and-drop/pointer.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import { moveIndex, radioStep } from "../../foundation/focus/collection.js";
import { colorDistance } from "../../foundation/color/compare.js";
import { formatColor } from "../../foundation/color/format.js";
import {
  isInGamut,
  toGamut
} from "../../foundation/color/gamut.js";
import {
  dispatchChange,
  formInternals,
  isDisabled
} from "../../foundation/forms/form.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import {
  createChange,
  createCommit
} from "../../foundation/kernel/input-source.js";
import { snapToStep } from "../../foundation/number/steps.js";
import { isRTL } from "../../foundation/platform/env.js";
import {
  black,
  channelOf,
  colorIn,
  defaultAxes,
  inSpace,
  readChannel,
  shown,
  spaceOf,
  withChannel
} from "./color-picker-channels.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
var formatFor = (space, format) => format ?? (space === "hsv" ? "hex" : space);
function settings(options) {
  const space = spaceOf(options.space);
  return {
    space,
    format: formatFor(space, options.format),
    gamut: options.gamut ?? "srgb",
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form
  };
}
var output = (color, state) => formatColor(shown(color, state.gamut), state.format);
function initialState(options) {
  const base = settings(options);
  const given = options.value ?? options.defaultValue;
  const color = given !== void 0 && colorIn(given, base.space) || black(base.space);
  const value = given ?? output(color, base);
  return {
    ...base,
    value,
    initial: options.defaultValue ?? value,
    color,
    formDisabled: false,
    text: null,
    rtl: false,
    eyeDropper: null,
    stop: null
  };
}
function syncState(options) {
  return {
    ...settings(options),
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.value === void 0 ? {} : { value: options.value }
  };
}
var isLocked = (state) => isDisabled(state) || state.readOnly;
var isSameColor = (first, second) => colorDistance(first, second) < 2e-3 && Math.abs(first.alpha - second.alpha) < 5e-3;
function colorPickerApiBody(context) {
  const { store, element } = context;
  const change = createChange(context);
  const commitValue = createCommit(context);
  const drags = createDragSession(context.onDestroy);
  const areas = /* @__PURE__ */ new Map();
  let start;
  let changed;
  const begin = () => {
    start = store.get().value;
    changed = void 0;
  };
  const channel = (name) => channelOf(store.get().space, name);
  const formElement = () => {
    const root = element("root");
    return formInternals(root) ? root : element("hidden-input");
  };
  const publicColor = (color) => shown(color, store.get().gamut);
  function setColor(color, details, notify = true) {
    const state = store.get();
    const value = output(color, state);
    const before = state.color;
    store.set({ color });
    if (value === state.value) {
      return true;
    }
    const done = change("value", value, {
      ...details,
      color: publicColor(color)
    });
    if (!done) {
      store.set({ color: before });
    } else {
      changed = value;
      if (notify) {
        dispatchChange(formElement(), ["input"]);
      }
    }
    return done;
  }
  function commit(details) {
    const from = start;
    start = void 0;
    const state = store.get();
    if (state.gamut && !isInGamut(state.color, state.gamut)) {
      store.set({ color: toGamut(state.color, state.gamut) });
    }
    const value = changed ?? store.get().value;
    changed = void 0;
    if (from === void 0 || from === value) {
      return;
    }
    commitValue("value", value, {
      ...details,
      color: publicColor(store.get().color)
    });
    dispatchChange(formElement(), ["change"]);
  }
  function choose(color, details) {
    if (isLocked(store.get())) {
      return false;
    }
    begin();
    const done = setColor(color, details);
    commit(details);
    return done;
  }
  function area(x, y) {
    const key = `${x}/${y}`;
    let made = areas.get(key);
    if (made) {
      return made;
    }
    const axes = () => {
      const { space } = store.get();
      return {
        x: channelOf(space, x ?? defaultAxes[space].x),
        y: channelOf(space, y ?? defaultAxes[space].y)
      };
    };
    const axis = (spec) => ({
      min: 0,
      max: spec.max,
      step: spec.step,
      label: spec.label
    });
    made = createArea(context, {
      value: (state) => {
        const { x: x2, y: y2 } = axes();
        return {
          x: readChannel(state.color, x2),
          y: readChannel(state.color, y2)
        };
      },
      set: (value, details) => {
        const { x: x2, y: y2 } = axes();
        return setColor(
          withChannel(withChannel(store.get().color, x2, value.x), y2, value.y),
          details
        );
      },
      x: () => axis(axes().x),
      y: () => axis(axes().y),
      valueText: (value) => {
        const { x: x2, y: y2 } = axes();
        return `${x2.label} ${valueText(value.x, x2)}, ${y2.label} ${valueText(value.y, y2)}`;
      },
      onCommit: (_value, details) => commit(details),
      disabled: () => isLocked(store.get())
    });
    areas.set(key, made);
    return made;
  }
  function isSelected(value) {
    const color = value === void 0 ? null : colorIn(value, store.get().space);
    return !!color && isSameColor(publicColor(color), publicColor(store.get().color));
  }
  const roving = createRovingFocus(context, {
    slot: "swatch-item",
    key: "stop",
    remember: false,
    disabled: () => isLocked(store.get()),
    preferred: (item) => isSelected(item.props?.value),
    move(event, { from, items, rtl }) {
      if (event.shiftKey) {
        return;
      }
      const step = radioStep(event.key, rtl);
      if (step !== void 0) {
        return items[moveIndex(items.indexOf(from), step, items.length, false)].key;
      }
      if (event.key === "Home") {
        return items[0]?.key;
      }
      if (event.key === "End") {
        return items[items.length - 1]?.key;
      }
    }
  });
  const sliderValue = (channelName) => readChannel(store.get().color, channel(channelName));
  function setChannel(channelName, value, details) {
    const spec = channel(channelName);
    const snapped = snapToStep(value, {
      min: 0,
      max: spec.max,
      step: spec.step
    });
    if (snapped === sliderValue(channelName)) {
      return false;
    }
    return setColor(withChannel(store.get().color, spec, snapped), details);
  }
  const api = {
    getValue: () => store.get().value,
    setValue(value, { reason = "imperative", event } = {}) {
      const color = colorIn(value, store.get().space);
      if (!color) {
        return false;
      }
      return setColor(color, { reason, event }, false);
    },
    focus() {
      const target = element("area-thumb") ?? element("slider-thumb") ?? element("input");
      target?.focus();
    },
    internal: {
      area,
      channel,
      sliderValue,
      roving,
      output: (color) => output(color, store.get()),
      isSelected,
      setRTL: (el) => store.set({ rtl: isRTL(el) }),
      areaPointerdown(event, el, x, y) {
        begin();
        area(x, y).pointerdown(event, el);
      },
      areaKeydown(event, x, y) {
        begin();
        area(x, y).keydown(event);
      },
      // A press on a slider's track moves its thumb there and follows the pointer.
      sliderPointerdown(event, el, name, orientation) {
        if (!drags.accepts(event) || isLocked(store.get())) {
          return;
        }
        event.preventDefault();
        const vertical = orientation === "vertical";
        const rtl = isRTL(el);
        const rect = el.getBoundingClientRect();
        const at = (x, y) => {
          const length = vertical ? rect.height : rect.width;
          let fraction = length ? (vertical ? rect.bottom - y : x - rect.left) / length : 0;
          if (!vertical && rtl) {
            fraction = 1 - fraction;
          }
          return Math.min(1, Math.max(0, fraction)) * channel(name).max;
        };
        begin();
        let reason = "track-press";
        setChannel(name, at(event.clientX, event.clientY), { reason, event });
        el.querySelector('[role="slider"]')?.focus({
          preventScroll: true
        });
        const unsubscribe = store.subscribe(
          () => isLocked(store.get()) && drags.cancel()
        );
        drags.start(el, event, {
          onMove: (sample) => {
            if (setChannel(name, at(sample.x, sample.y), {
              reason: "drag",
              event: sample.event
            })) {
              reason = "drag";
            }
          },
          onEnd: (end) => {
            unsubscribe();
            commit({ reason, event: end });
          }
        });
      },
      // Arrows step, Shift ten steps, Page Up and Page Down a tenth of the
      // range, Home and End jump to the ends, as on a slider.
      sliderKeydown(event, name) {
        if (event.altKey || event.ctrlKey || event.metaKey || isLocked(store.get())) {
          return;
        }
        const spec = channel(name);
        const current = sliderValue(name);
        const rtl = event.target instanceof Element && isRTL(event.target);
        const steps = spec.step * (event.shiftKey ? 10 : 1);
        const keys = {
          ArrowUp: current + steps,
          ArrowDown: current - steps,
          ArrowRight: current + (rtl ? -steps : steps),
          ArrowLeft: current - (rtl ? -steps : steps),
          PageUp: current + spec.max / 10,
          PageDown: current - spec.max / 10,
          Home: 0,
          End: spec.max
        };
        if (!(event.key in keys)) {
          return;
        }
        event.preventDefault();
        begin();
        setChannel(name, keys[event.key], { reason: "step-key", event });
        commit({ reason: "step-key", event });
      },
      setChannelValue(name, value, event) {
        if (isLocked(store.get()) || !Number.isFinite(value)) {
          return;
        }
        begin();
        setChannel(name, value, { reason: "input-commit", event });
        commit({ reason: "input-commit", event });
      },
      setText(text) {
        store.set({ text });
      },
      // Reads the text typed into the input. Text that isn't a color goes back to the value.
      commitText(event) {
        const { text, space } = store.get();
        if (text === null) {
          return;
        }
        const color = colorIn(text, space);
        if (color && !isLocked(store.get())) {
          choose(color, { reason: "input-commit", event });
        }
        store.set({ text: null });
      },
      revertText() {
        store.set({ text: null });
      },
      choose: (value, details) => {
        const color = colorIn(value, store.get().space);
        return !!color && choose(color, details);
      },
      setEyeDropper: (el) => store.set({
        eyeDropper: !!el.ownerDocument.defaultView?.EyeDropper
      }),
      // The browser's EyeDropper, where it has one. Escape cancels it, which changes nothing.
      pickFromScreen(el, event) {
        const EyeDropper = el?.ownerDocument.defaultView?.EyeDropper;
        if (!EyeDropper || isLocked(store.get())) {
          return;
        }
        new EyeDropper().open().then(
          ({ sRGBHex }) => api.internal.choose(sRGBHex, { reason: "eye-dropper-pick", event })
        ).catch(() => {
        });
      },
      reset() {
        const { value, defaultValue } = context.options();
        if (keepsValueOnReset(value, defaultValue)) {
          return;
        }
        const color = colorIn(store.get().initial, store.get().space);
        if (color) {
          setColor(color, { reason: "reset" }, false);
        }
      },
      restore(saved) {
        api.setValue(saved, { reason: "restore" });
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      submitted: () => store.get().name === void 0 ? null : store.get().value
    }
  };
  deriveFromOptions(context, ["color"], (synced, state) => {
    const next = { ...state, ...synced };
    const kept = next.space === state.space ? state.color : inSpace(state.color, next.space);
    if (next.value === state.value) {
      return kept === state.color ? void 0 : { color: kept };
    }
    if (next.value === output(kept, next)) {
      return { color: kept };
    }
    return { color: colorIn(next.value, next.space) ?? kept };
  });
  return api;
}
var colorPickerApi = colorPickerApiBody;
var valueText = (value, spec) => {
  const decimals = spec.step < 1 ? String(spec.step).length - 2 : 0;
  const rounded = Number(value.toFixed(decimals));
  return spec.unit === "\xB0" ? `${rounded} degrees` : `${rounded}${spec.unit}`;
};
export {
  colorPickerApi,
  initialState,
  isLocked,
  output,
  syncState,
  valueText
};
