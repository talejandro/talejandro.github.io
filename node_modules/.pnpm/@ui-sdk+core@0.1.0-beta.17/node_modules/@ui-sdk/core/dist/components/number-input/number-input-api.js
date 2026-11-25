// src/components/number-input/number-input-api.ts
import {
  createDragSession,
  isDrag
} from "../../foundation/drag-and-drop/pointer.js";
import { bindRepeatPresses } from "../../foundation/direct-manipulation/repeat.js";
import { isBrowser, isIOS } from "../../foundation/platform/env.js";
import {
  dispatchChange,
  formInternals,
  isDisabled
} from "../../foundation/forms/form.js";
import {
  displayOptions,
  formatNumber,
  numberFormatter
} from "../../foundation/number/format.js";
import { stepFromKey } from "../../foundation/number/keys.js";
import {
  clamp,
  decimalsOf,
  maxOnGrid,
  roundTo,
  snapToStep,
  stepValue
} from "../../foundation/number/steps.js";
import { localeOf } from "../../foundation/text/locale.js";
import { isPartialNumber, parseNumber } from "../../foundation/number/parse.js";
import { sameValue } from "../../foundation/kernel/store.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import {
  createChange,
  createCommit
} from "../../foundation/kernel/input-source.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
function settings(options) {
  const { style, maximumFractionDigits, minimumFractionDigits } = options.format ?? {};
  const fallback = style === "percent" ? 10 ** -(2 + (maximumFractionDigits ?? minimumFractionDigits ?? 0)) : 1;
  const step = options.step && options.step > 0 ? options.step : fallback;
  return {
    min: options.min ?? -Infinity,
    max: options.max ?? Infinity,
    step,
    largeStep: options.largeStep && options.largeStep > 0 ? options.largeStep : step * 10,
    smallStep: options.smallStep && options.smallStep > 0 ? options.smallStep : roundTo(step / 10, decimalsOf(step) + 1),
    format: options.format,
    locale: options.locale,
    wheel: !!options.wheel,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form
  };
}
var rangeOf = (state) => ({
  min: state.min,
  max: state.max,
  step: state.step
});
var readFormat = (state) => displayOptions(state.format, state.step);
var display = (value, state) => formatNumber(value, localeOf(state), readFormat(state));
var isLocked = (state) => isDisabled(state) || state.readOnly;
function inputMode(state) {
  const negative = state.min < 0;
  const decimal = decimalsOf(state.step) > 0 || state.format !== void 0 && (numberFormatter(localeOf(state), state.format).resolvedOptions().maximumFractionDigits ?? 0) > 0;
  if (state.platform === "ios" && negative) {
    return "text";
  }
  if (state.platform === "android" && negative) {
    return "numeric";
  }
  return decimal ? "decimal" : "numeric";
}
function canStep(state, direction, step = state.step) {
  return !isLocked(state) && !atBound(state, direction, step);
}
function atBound(state, direction, step = state.step) {
  if (state.value === null) {
    return false;
  }
  return direction > 0 ? state.value >= maxOnGrid({ ...rangeOf(state), step }) : state.value <= state.min;
}
function stepSize(event) {
  return event.shiftKey ? "large" : event.altKey ? "small" : "step";
}
function isAndroid() {
  return isBrowser && /Android/i.test(navigator.userAgent);
}
function numberInputApiBody(context) {
  const { store, element, options } = context;
  const drags = createDragSession(context.onDestroy);
  const change = createChange(context);
  const commitValue = createCommit(context);
  let startValue = store.get().value;
  let pending;
  let wheelTimer;
  let edited = false;
  const input = () => element("control");
  const formElement = () => {
    const root = element("root");
    return formInternals(root) ? root : element("hidden-input");
  };
  const current = () => {
    const state = store.get();
    if (state.text.trim() === "") {
      return null;
    }
    return parseNumber(state.text, localeOf(state), readFormat(state)) ?? state.value;
  };
  const showValue = () => store.set({ text: display(store.get().value, store.get()) });
  function setValue(value, reason, event) {
    const before = store.get().value;
    const done = change("value", value, { reason, event });
    if (done) {
      if (!pending) {
        startValue = before;
      }
      pending = { reason, event };
      dispatchChange(formElement(), ["input"]);
    }
    return done;
  }
  function commit(end, value = store.get().value) {
    clearTimeout(wheelTimer);
    const last = pending;
    pending = void 0;
    if (sameValue(startValue, value) || !last) {
      return;
    }
    const event = end && end.constructor === last.event?.constructor ? end : last.event;
    commitValue("value", value, { reason: last.reason, event });
    dispatchChange(formElement(), ["change"]);
  }
  function stepBy(steps, size, reason, event) {
    const state = store.get();
    if (!canStep(state, steps, size === "small" ? state.smallStep : state.step)) {
      return false;
    }
    const range = rangeOf(state);
    const from = current();
    const next = from === null ? stepValue(0, steps, range) : size === "large" ? snapToStep(
      clamp(from + steps * state.largeStep, state.min, state.max),
      range
    ) : size === "small" ? stepValue(from, steps, { ...range, step: state.smallStep }) : stepValue(from, steps, range);
    const done = setValue(next, reason, event);
    edited = false;
    showValue();
    return done;
  }
  function stepFromCode(steps, size, reason, event) {
    const interaction = pending;
    const done = stepBy(steps, size, reason, event);
    pending = interaction;
    return done;
  }
  const api = {
    getValue: () => store.get().value,
    setValue(value, { reason = "imperative", event } = {}) {
      const state = store.get();
      const next = value === null ? null : snapToStep(clamp(value, state.min, state.max), rangeOf(state));
      return change("value", next, { reason, event });
    },
    increment: ({
      reason = "imperative",
      event,
      large = false
    } = {}) => stepFromCode(1, large ? "large" : "step", reason, event),
    decrement: ({
      reason = "imperative",
      event,
      large = false
    } = {}) => stepFromCode(-1, large ? "large" : "step", reason, event),
    focus: () => input()?.focus(),
    internal: {
      // Refuses an edit that couldn't become a number, like a letter. Deleting is always allowed.
      beforeinput(event, el) {
        if (event.isComposing || !event.inputType.startsWith("insert") || event.data === null) {
          return;
        }
        const state = store.get();
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? start;
        const next = el.value.slice(0, start) + event.data + el.value.slice(end);
        if (!isPartialNumber(next, localeOf(state), readFormat(state), {
          allowNegative: state.min < 0
        })) {
          event.preventDefault();
        }
      },
      // The value follows the text while it's a number within the bounds.
      // Committing clamps and snaps it.
      type(text, event) {
        const state = store.get();
        edited = true;
        store.set({ text });
        if (text.trim() === "") {
          return setValue(null, "input-change", event);
        }
        const parsed = parseNumber(text, localeOf(state), readFormat(state));
        if (parsed !== null && parsed >= state.min && parsed <= state.max) {
          setValue(parsed, "input-change", event);
        }
      },
      // Enter or leaving the field: parse, clamp, snap and format what's typed.
      // Text that isn't a number goes back to the last value.
      commitText(event) {
        const state = store.get();
        if (isLocked(state)) {
          return;
        }
        if (!edited) {
          store.set({ text: display(state.value, state) });
          return commit(event);
        }
        edited = false;
        let asked = state.value;
        const isEmpty = state.text.trim() === "";
        const parsed = isEmpty ? null : parseNumber(state.text, localeOf(state), readFormat(state));
        const next = parsed !== null ? snapToStep(clamp(parsed, state.min, state.max), rangeOf(state)) : isEmpty ? null : asked;
        if (!sameValue(next, asked) && setValue(next, "input-commit", event)) {
          asked = next;
        }
        showValue();
        commit(event, options().value === void 0 ? void 0 : asked);
      },
      keydown(event) {
        const state = store.get();
        if (event.key === "Enter") {
          return api.internal.commitText(event);
        }
        if (event.ctrlKey || event.metaKey) {
          return;
        }
        const move = stepFromKey(event, { arrows: "vertical" });
        if (!move || event.altKey && !event.key.startsWith("Arrow")) {
          return;
        }
        if (!("bound" in move)) {
          event.preventDefault();
          return stepBy(move.direction, move.size, "step-key", event);
        }
        const bound = move.bound === "min" ? state.min : maxOnGrid(rangeOf(state));
        if (!Number.isFinite(bound) || isLocked(state)) {
          return;
        }
        event.preventDefault();
        setValue(bound, "step-key", event);
        showValue();
      },
      keyup: (event) => {
        if (pending?.reason === "step-key") {
          commit(event);
        }
      },
      wheel(event, el) {
        const state = store.get();
        if (!state.wheel || el.ownerDocument.activeElement !== el || event.ctrlKey) {
          return;
        }
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) {
          return;
        }
        event.preventDefault();
        stepBy(event.deltaY < 0 ? 1 : -1, stepSize(event), "wheel", event);
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => commit(event), 300);
      },
      bindButton(el, direction, disabled) {
        const reason = direction > 0 ? "increment-press" : "decrement-press";
        return bindRepeatPresses(el, {
          keys: [],
          disabled: () => disabled() || el.hasAttribute("disabled"),
          onPress: (press) => {
            const event = press.event;
            if (!drags.accepts(event) || !canStep(store.get(), direction)) {
              return false;
            }
            event.preventDefault();
            if (press.input === "mouse") {
              input()?.focus({ preventScroll: true });
            }
          },
          onStep: ({ event }) => stepBy(
            direction,
            event.shiftKey ? "large" : "step",
            reason,
            event
          ) && canStep(store.get(), direction),
          onEnd: ({ event }) => commit(event)
        });
      },
      // Keyboard and screen reader presses, which carry no pointer.
      clickButton(event, direction) {
        if (event.detail !== 0) {
          return;
        }
        stepBy(
          direction,
          event.shiftKey ? "large" : "step",
          direction > 0 ? "increment-press" : "decrement-press",
          event
        );
        commit(event);
      },
      scrub(event, el, props) {
        if (!drags.accepts(event) || isLocked(store.get())) {
          return;
        }
        event.preventDefault();
        const doc = el.ownerDocument;
        const size = props.pixelsPerStep && props.pixelsPerStep > 0 ? props.pixelsPerStep : 2;
        const vertical = props.orientation === "vertical";
        let distance = 0;
        let dragged = false;
        const view = doc.defaultView ?? window;
        const cursor = { x: event.clientX, y: event.clientY };
        const blockSelection = (select) => select.preventDefault();
        doc.addEventListener("selectstart", blockSelection);
        store.set({ scrubbing: true });
        drags.start(el, event, {
          lock: true,
          onMove: (sample) => {
            dragged ||= isDrag(sample.x - event.clientX, sample.y - event.clientY) || sample.locked;
            if (sample.locked) {
              cursor.x = wrap(cursor.x + sample.movementX, view.innerWidth);
              cursor.y = wrap(cursor.y + sample.movementY, view.innerHeight);
              store.set({ cursor: { ...cursor } });
            } else {
              cursor.x = sample.x;
              cursor.y = sample.y;
            }
            distance += vertical ? -sample.movementY : sample.movementX;
            const steps = Math.trunc(distance / size);
            if (steps === 0) {
              return;
            }
            distance -= steps * size;
            stepBy(steps, stepSize(sample.event), "scrub", sample.event);
          },
          onEnd: (end, canceled) => {
            doc.removeEventListener("selectstart", blockSelection);
            store.set({ scrubbing: false, cursor: null });
            commit(end);
            if (!dragged && !canceled) {
              api.internal.focusAndSelect();
            }
          }
        });
      },
      focusAndSelect() {
        const el = input();
        if (!el) {
          return;
        }
        el.focus({ preventScroll: true });
        el.select();
      },
      reset() {
        if (keepsValueOnReset(options().value, options().defaultValue)) {
          return;
        }
        edited = false;
        pending = void 0;
        change("value", store.get().initial, { reason: "reset" });
        showValue();
      },
      restore(saved) {
        const value = saved === "" ? null : Number(saved);
        if (value === null || Number.isFinite(value)) {
          api.setValue(value, { reason: "restore" });
        }
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      // Read from the browser once bound, since the server renders "other".
      readPlatform() {
        store.set({
          platform: isIOS() ? "ios" : isAndroid() ? "android" : "other"
        });
      },
      submitted: () => {
        const { value, name } = store.get();
        return name === void 0 ? null : value === null ? "" : String(value);
      }
    }
  };
  const formatKey = (state) => JSON.stringify([state.format, localeOf(state), state.step]);
  deriveFromOptions(context, ["text"], (synced, state) => {
    if (!("value" in synced) || sameValue(synced.value, state.value)) {
      return;
    }
    const next = { ...state, ...synced };
    const typed = next.text.trim() === "" ? null : parseNumber(next.text, localeOf(next), readFormat(next));
    if (!sameValue(typed, next.value)) {
      return { text: display(next.value, next) };
    }
  });
  let shown = store.get().value;
  let shownState = store.get();
  let shownFormat = formatKey(shownState);
  store.subscribe(() => {
    const state = store.get();
    const settingsChanged = state.format !== shownState.format || localeOf(state) !== localeOf(shownState) || state.step !== shownState.step;
    shownState = state;
    const format = settingsChanged ? formatKey(state) : shownFormat;
    if (format !== shownFormat) {
      shownFormat = format;
      if (!edited) {
        return showValue();
      }
    }
    if (sameValue(state.value, shown)) {
      return;
    }
    shown = state.value;
    const typed = state.text.trim() === "" ? null : parseNumber(state.text, localeOf(state), readFormat(state));
    if (!sameValue(typed, state.value)) {
      store.set({ text: display(state.value, state) });
    }
  });
  context.onDestroy(() => clearTimeout(wheelTimer));
  return api;
}
var numberInputApi = numberInputApiBody;
function wrap(position, size) {
  return (position % size + size) % size;
}
export {
  atBound,
  canStep,
  display,
  inputMode,
  isDisabled,
  isLocked,
  numberInputApi,
  rangeOf,
  settings
};
