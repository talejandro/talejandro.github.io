// src/components/slider/slider-api.ts
import { orientationOf } from "../../foundation/focus/collection.js";
import { createDragSession } from "../../foundation/drag-and-drop/pointer.js";
import { isRTL } from "../../foundation/platform/env.js";
import {
  dispatchChange,
  formInternals,
  isDisabled
} from "../../foundation/forms/form.js";
import {
  displayOptions,
  formatNumber
} from "../../foundation/number/format.js";
import { parseRange } from "../../foundation/number/parse.js";
import { clamp } from "../../foundation/number/steps.js";
import { localeOf } from "../../foundation/text/locale.js";
import { heldState, sameValue } from "../../foundation/kernel/store.js";
import { deriveFromOptions, deriveState } from "../../foundation/kernel/derive.js";
import {
  fractionAlong,
  keyTarget,
  moveThumb,
  normalizeValues,
  stackAt,
  thumbBounds,
  thumbForDirection,
  thumbForPress,
  valueAt
} from "./slider-values.js";
import {
  createChange,
  createCommit
} from "../../foundation/kernel/input-source.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
var isLocked = (state) => isDisabled(state) || state.readOnly;
var valuesOf = (value) => Array.isArray(value) ? value : [value];
function thumbValuesOf(value) {
  const record = {};
  valuesOf(value).forEach((item, index) => record[index] = item);
  return record;
}
function holdsValue(thumbValues, value) {
  if (!Array.isArray(value)) {
    return Object.is(thumbValues[0], value) && thumbValues[1] === void 0;
  }
  return thumbValues[value.length] === void 0 && value.every((item, index) => Object.is(thumbValues[index], item));
}
var shaped = (values, like) => Array.isArray(like) ? values : values[0];
function rangeOf(state) {
  return {
    min: state.min,
    max: state.max,
    step: state.step,
    largeStep: state.largeStep,
    minStepsBetweenThumbs: state.minStepsBetweenThumbs
  };
}
function bounds(options) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step && options.step > 0 ? options.step : 1;
  return { min, max, step };
}
function normalized(value, options) {
  const range = bounds(options);
  return Array.isArray(value) ? normalizeValues(value, range) : clamp(value, range.min, range.max);
}
function settings(options) {
  const range = bounds(options);
  return {
    ...range,
    largeStep: options.largeStep ?? range.step * 10,
    minStepsBetweenThumbs: options.minStepsBetweenThumbs ?? 0,
    orientation: orientationOf(options.orientation, "horizontal"),
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    format: options.format,
    locale: options.locale
  };
}
function formatValue(value, state) {
  const format = typeof state.format === "function" ? state.format : displayOptions(state.format, state.step);
  return formatNumber(value, localeOf(state), format);
}
function formatRange(values) {
  return values.join("/");
}
function submitted(state) {
  return Array.isArray(state.value) ? formatRange(state.value) : String(state.value);
}
function sliderApiBody(context) {
  const { store, options, element } = context;
  const change = createChange(context);
  const commitValue = createCommit(context);
  const drags = createDragSession(context.onDestroy);
  let gesture;
  let keys;
  const range = () => rangeOf(store.get());
  const values = () => valuesOf(store.get().value);
  const formElement = () => {
    const root = element("root");
    return formInternals(root) ? root : element("input");
  };
  function setValues(next, reason, event, thumb, notify = true) {
    if (next === values()) {
      return false;
    }
    const done = change("value", shaped(next, store.get().value), {
      reason,
      event,
      thumb
    });
    if (done) {
      if (thumb !== null) {
        store.set({ last: thumb });
      }
      if (notify) {
        dispatchChange(formElement(), ["input"]);
      }
    }
    return done;
  }
  function commit(start, reason, event, thumb = null, notify = true) {
    const value = store.get().value;
    if (sameValue(start, value)) {
      return;
    }
    commitValue("value", value, { reason, event, thumb });
    if (notify) {
      dispatchChange(formElement(), ["change"]);
    }
  }
  const thumbInput = (index) => element("thumb-input", String(index));
  function setValue(value, reason, event) {
    const sorted = valuesOf(normalized(value, options()));
    const next = sorted.reduce(
      (result, item, index) => moveThumb(result, index, item, range()),
      sorted
    );
    if (sameValue(next, values())) {
      return false;
    }
    return change("value", shaped(next.slice(), store.get().value), {
      reason,
      event,
      thumb: null
    });
  }
  const api = {
    getValue: () => store.get().value,
    setValue: (value, { reason = "imperative", event } = {}) => !isLocked(store.get()) && setValue(value, reason, event),
    focus: (thumb = 0) => thumbInput(thumb)?.focus(),
    internal: {
      // A press on the web: the track's box is read once, so moves never read layout.
      press(event, control) {
        if (!drags.accepts(event) || isLocked(store.get()) || gesture) {
          return;
        }
        const rect = (element("track") ?? control).getBoundingClientRect();
        const rtl = isRTL(control);
        const vertical = store.get().orientation === "vertical";
        const at = (x, y) => valueAt(fractionAlong({ x, y }, rect, { rtl, vertical }), range());
        const pressedThumb = event.target.closest(
          '[data-slot="slider-thumb"]'
        );
        const thumb = pressedThumb && control.contains(pressedThumb) ? Number(pressedThumb.getAttribute("data-index") ?? 0) : null;
        event.preventDefault();
        const focused = api.internal.begin(
          at(event.clientX, event.clientY),
          thumb,
          event
        );
        thumbInput(focused)?.focus({ preventScroll: true });
        drags.start(control, event, {
          onMove: (sample) => api.internal.move(at(sample.x, sample.y), sample.event),
          onEnd: (end) => api.internal.end(end)
        });
      },
      // Starts a drag at a value: on a thumb, which keeps its offset from the
      // press and doesn't move, or on the track, which moves the nearest thumb
      // there. Returns the thumb that takes focus.
      begin(pressed, thumb, event) {
        const start = store.get().value;
        let index;
        let stack;
        let offset = 0;
        if (thumb !== null) {
          stack = stackAt(values(), thumb);
          index = stack.length > 1 ? null : thumb;
          offset = pressed - values()[thumb];
        } else {
          ;
          ({ index, stack } = thumbForPress(values(), pressed));
          if (index !== null) {
            setValues(
              moveThumb(values(), index, pressed, range()),
              "track-press",
              event,
              index
            );
          }
        }
        const focused = index ?? stack[0];
        gesture = { index, stack, offset, start, reason: "track-press", event };
        store.set({ active: focused });
        return focused;
      },
      move(pressed, event) {
        if (!gesture) {
          return;
        }
        const target = pressed - gesture.offset;
        if (gesture.index === null) {
          const direction = Math.sign(target - values()[gesture.stack[0]]);
          if (direction === 0) {
            return;
          }
          gesture.index = thumbForDirection(gesture.stack, direction);
          thumbInput(gesture.index)?.focus({ preventScroll: true });
          store.set({ active: gesture.index });
        }
        if (setValues(
          moveThumb(values(), gesture.index, target, range()),
          "drag",
          event,
          gesture.index
        )) {
          gesture.reason = "drag";
          gesture.event = event;
        }
      },
      end(event) {
        const ended = gesture;
        gesture = void 0;
        store.set({ active: null });
        if (ended) {
          commit(ended.start, ended.reason, event, ended.index);
        }
      },
      // A screen reader's adjustment through the thumb's native range input,
      // like a swipe on iOS. It commits at once.
      adjust(index, target, event) {
        if (store.get().readOnly) {
          return;
        }
        const start = store.get().value;
        setValues(
          moveThumb(values(), index, target, range()),
          "accessibility-adjust",
          event,
          index,
          false
        );
        commit(start, "accessibility-adjust", event, index, false);
      },
      keydown(event, index, input) {
        const state = store.get();
        if (isDisabled(state)) {
          return;
        }
        const current = values()[index] ?? state.min;
        const target = keyTarget(
          event.key,
          {
            shiftKey: event.shiftKey,
            rtl: isRTL(input),
            orientation: state.orientation
          },
          current,
          thumbBounds(values(), index, range()),
          range()
        );
        if (target === null) {
          return;
        }
        event.preventDefault();
        if (state.readOnly) {
          return;
        }
        keys ??= { start: state.value, thumb: index };
        keys.event = event;
        setValues(
          moveThumb(values(), index, target, range()),
          "step-key",
          event,
          index
        );
      },
      // The key came up, or focus left while it was down, so its keyup goes
      // elsewhere and the last keydown stands for it.
      commitKeys(event) {
        if (!keys) {
          return;
        }
        const { start, thumb, event: last } = keys;
        keys = void 0;
        commit(start, "step-key", event ?? last, thumb);
      },
      reset() {
        if (keepsValueOnReset(options().value, options().defaultValue)) {
          return;
        }
        change("value", store.get().initial, { reason: "reset", thumb: null });
      },
      // The browser restores a disabled or read-only control too, as a native one.
      restore(saved) {
        const parsed = parseRange(saved);
        if (parsed) {
          setValue(shaped(parsed, store.get().value), "restore");
        }
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      submitted: () => store.get().name === void 0 ? null : submitted(store.get()),
      // Writes what the framework's attributes would, before they render, so
      // a native range never clamps a value to stale bounds. Only what
      // changed, since every write is a mutation the page restyles for.
      syncInput(input, index) {
        const { lower, upper } = thumbBounds(values(), index, range());
        const min = String(lower);
        const max = String(upper);
        const value = String(values()[index] ?? store.get().min);
        if (input.min !== min) {
          input.min = min;
        }
        if (input.max !== max) {
          input.max = max;
        }
        if (input.value !== value) {
          input.value = value;
        }
      }
    }
  };
  deriveFromOptions(context, ["value"], (synced, state, arriving) => {
    const { min, max } = bounds(arriving);
    if (arriving.value !== void 0 || !(min <= max)) {
      return;
    }
    const value = normalized(state.value, arriving);
    if (!sameValue(value, state.value)) {
      return { value };
    }
  });
  let made = { value: store.get().value, thumbValues: store.get().thumbValues };
  deriveState(context, ["thumbValues"], ({ value }) => {
    if (holdsValue(heldState(store).thumbValues, value)) {
      return;
    }
    if (!sameValue(value, made.value)) {
      made = { value, thumbValues: thumbValuesOf(value) };
    }
    return { thumbValues: made.thumbValues };
  });
  store.subscribe(() => {
    if (!gesture || !isLocked(store.get())) {
      return;
    }
    drags.cancel();
    api.internal.end();
  });
  return api;
}
var sliderApi = sliderApiBody;
export {
  formatRange,
  formatValue,
  isDisabled,
  normalized,
  rangeOf,
  settings,
  shaped,
  sliderApi,
  submitted,
  thumbValuesOf,
  valuesOf
};
