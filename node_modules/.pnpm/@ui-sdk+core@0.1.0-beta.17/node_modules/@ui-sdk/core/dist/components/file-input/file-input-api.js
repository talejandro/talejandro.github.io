// src/components/file-input/file-input-api.ts
import { dev } from "#dev";
import { announce } from "../../foundation/platform/announce.js";
import { isRTL } from "../../foundation/platform/env.js";
import { moveIndex, radioStep } from "../../foundation/focus/collection.js";
import {
  parseAccept,
  validateFiles
} from "../../foundation/forms/files.js";
import {
  keepsValueOnReset,
  writingFromScript
} from "../../foundation/forms/value.js";
import {
  associate,
  bindInternals,
  formInternals,
  isDisabled,
  valueMissingMessage
} from "../../foundation/forms/form.js";
import { on } from "../../foundation/kernel/events.js";
import { sameValue } from "../../foundation/kernel/store.js";
import { createDetails } from "../../foundation/kernel/details.js";
import {
  changeSource,
  createChange
} from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
var noFiles = [];
var noRejections = [];
function settings(options) {
  const accept = parseAccept(options.accept).join(",");
  return {
    disabled: !!options.disabled,
    required: !!options.required,
    name: options.name,
    form: options.form,
    accept: accept || void 0,
    multiple: !!options.multiple || !!options.directory,
    directory: !!options.directory,
    capture: options.capture || void 0
  };
}
var fileKeys = /* @__PURE__ */ new WeakMap();
var fileCount = 0;
function fileKey(file) {
  let key = fileKeys.get(file);
  if (!key) {
    fileKeys.set(file, key = `file-${++fileCount}`);
  }
  return key;
}
function setInputFiles(input, files) {
  const current = Array.from(input.files ?? []);
  if (current.length === files.length && current.every((file, index) => file === files[index])) {
    return;
  }
  if (typeof DataTransfer !== "function") {
    return;
  }
  const transfer = new DataTransfer();
  for (const file of files) {
    transfer.items.add(file);
  }
  input.files = transfer.files;
}
var noFile = () => new File([], "", { type: "application/octet-stream" });
var plural = (count) => `${count} ${count === 1 ? "file" : "files"}`;
function describeChange(details) {
  if (details.reason === "reset") {
    return null;
  }
  const parts = [];
  if (details.added.length) {
    parts.push(`${plural(details.added.length)} accepted.`);
  }
  if (details.rejected.length) {
    parts.push(`${plural(details.rejected.length)} rejected.`);
  }
  if (details.removed.length && !details.added.length) {
    parts.push(
      details.removed.length === 1 ? `${details.removed[0].name} removed.` : `${plural(details.removed.length)} removed.`
    );
  }
  return parts.length ? parts.join(" ") : null;
}
function fileInputApiBody(context) {
  const { id, store, options, element } = context;
  const change = createChange(context);
  const rules = () => {
    const { accept, maxFiles, maxSize, minSize, validate } = options();
    const { multiple, value } = store.get();
    const room = maxFiles !== void 0 && multiple ? Math.max(0, maxFiles - value.length) : maxFiles;
    return { accept, multiple, maxFiles: room, maxSize, minSize, validate };
  };
  const keepsFiles = () => {
    const { associated, name, required } = store.get();
    return !associated && (!!name || required);
  };
  const input = () => element("input");
  const formElement = () => {
    const root = element("root");
    return formInternals(root) ? root : input();
  };
  let echoing = false;
  function echoChange() {
    const el = formElement();
    if (el && writingFromScript(el)) {
      return;
    }
    queueMicrotask(() => {
      if (!el?.isConnected) {
        return;
      }
      echoing = true;
      el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      echoing = false;
    });
  }
  function writeInput() {
    const el = input();
    if (!el) {
      return;
    }
    if (keepsFiles()) {
      setInputFiles(el, store.get().value);
    } else {
      el.value = "";
    }
  }
  function commit(next, reason, event, {
    added = noFiles,
    removed = noFiles,
    rejected = noRejections
  } = {}) {
    const summary = {
      reason,
      added: [...added],
      removed: [...removed],
      rejected: [...rejected]
    };
    if (dev && options().debug) {
      console.debug(
        `[ui-sdk] file-input#${id} ${added.length} added, ${removed.length} removed, ${rejected.length} rejected (${reason})`
      );
    }
    const differs = !sameValue(store.get().value, next);
    const changed = differs && change("value", [...next], { event, ...summary });
    if (rejected.length) {
      options().onReject?.(
        summary.rejected,
        createDetails({ reason, event }, changeSource(reason, event), false)
      );
    }
    writeInput();
    if (differs && !changed) {
      return false;
    }
    if (changed && reason !== "picker" && reason !== "reset") {
      echoChange();
    }
    const { announcement } = options();
    const message = announcement ? announcement(summary) : describeChange(summary);
    if (message) {
      announce(message);
    }
    return changed;
  }
  function receive(files, reason, event) {
    const state = store.get();
    if (isDisabled(state)) {
      return false;
    }
    const { accepted, rejected } = validateFiles(files, rules());
    if (!state.multiple && !accepted.length) {
      return commit(state.value, reason, event, { rejected });
    }
    const current = state.multiple ? state.value : noFiles;
    const added = accepted.filter((file) => !current.includes(file));
    const removed = state.multiple ? noFiles : state.value.filter((file) => !added.includes(file));
    return commit([...current, ...added], reason, event, {
      added,
      removed,
      rejected
    });
  }
  function remove(file, reason = "imperative", event) {
    const state = store.get();
    if (isDisabled(state) || !state.value.includes(file)) {
      return false;
    }
    return commit(
      state.value.filter((item) => item !== file),
      reason,
      event,
      { removed: [file] }
    );
  }
  function replace(files, reason, event) {
    const { value } = store.get();
    return commit(files, reason, event, {
      added: files.filter((file) => !value.includes(file)),
      removed: value.filter((file) => !files.includes(file))
    });
  }
  const items = () => elements(context, "item");
  function removeItem(file, event) {
    const list = items();
    const index = list.findIndex(({ props }) => props.file === file);
    const hadFocus = list[index]?.el.contains(
      list[index].el.ownerDocument.activeElement
    );
    const neighbour = list[index + 1] ?? list[index - 1];
    if (!remove(file, "remove-press", event) || !hadFocus) {
      return;
    }
    const moveFocus = () => {
      if (store.get().value.includes(file)) {
        return;
      }
      if (neighbour?.el.isConnected) {
        neighbour.el.focus();
      } else {
        element("trigger")?.focus();
      }
    };
    if (options().value === void 0) {
      moveFocus();
    } else {
      queueMicrotask(moveFocus);
    }
  }
  function itemKeydown(event, el, file) {
    if (event.target !== el || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      return removeItem(file, event);
    }
    const list = items().map((item) => item.el);
    const step = radioStep(event.key, isRTL(el)) ?? (event.key === "Home" ? "first" : event.key === "End" ? "last" : void 0);
    if (step === void 0) {
      return;
    }
    const target = list[moveIndex(list.indexOf(el), step, list.length, false)];
    if (!target) {
      return;
    }
    event.preventDefault();
    target.focus();
  }
  const api = {
    getValue: () => store.get().value,
    setValue: (files, { reason = "imperative", event } = {}) => replace(files, reason, event),
    addFiles(files, { reason = "imperative", event } = {}) {
      return receive(Array.from(files), reason, event);
    },
    removeFile: (file, { reason = "imperative", event } = {}) => remove(file, reason, event),
    clear: ({ reason = "imperative", event } = {}) => api.setValue([], { reason, event }),
    open() {
      const state = store.get();
      if (isDisabled(state)) {
        return false;
      }
      const el = input();
      if (!el) {
        return false;
      }
      el.click();
      return true;
    },
    focus: () => element("trigger")?.focus(),
    isDragging: () => Object.keys(store.get().drags).length > 0,
    internal: {
      keyOf: (value) => value && typeof value === "object" ? fileKey(value) : String(value),
      receive,
      removeItem,
      itemKeydown,
      setActiveItem(key) {
        if (store.get().activeItem !== key) {
          store.set({ activeItem: key });
        }
      },
      setDrag(key, status) {
        const { [key]: current, ...rest } = store.get().drags;
        if (current === (status ?? void 0)) {
          return;
        }
        store.set({ drags: status ? { ...rest, [key]: status } : rest });
      },
      rules,
      dropzoneProps(key) {
        const props = context.props("dropzone", key) ?? {};
        return props;
      },
      reset() {
        if (!keepsValueOnReset(options().value, options().defaultValue)) {
          replace(store.get().initial, "reset");
        }
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      bindInput(el) {
        writeInput();
        let written = store.get();
        const cleanups = [
          on(el, "change", (event) => {
            if (!echoing) {
              receive(Array.from(el.files ?? []), "picker", event);
            }
          }),
          // A controlled value, a new name or a removal changes what the input holds.
          store.subscribe(() => {
            const state = store.get();
            if (state.value === written.value && state.name === written.name && state.required === written.required) {
              return;
            }
            written = state;
            writeInput();
          }),
          // The form already emptied the input, so there's nothing to write back.
          associate(el, {
            reset: api.internal.reset,
            disabled: api.internal.setFormDisabled,
            focus: api.focus,
            write: () => {
            }
          })
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      },
      // Custom elements submit their files through ElementInternals.
      bindRoot(el) {
        if (!formInternals(el)) {
          return () => {
          };
        }
        store.set({ associated: true });
        return bindInternals(el, {
          value: () => {
            const { name, value } = store.get();
            if (!name) {
              return null;
            }
            const data = new FormData();
            for (const file of value.length ? value : [noFile()]) {
              data.append(name, file);
            }
            return data;
          },
          state: () => "",
          // Files can't be restored after going back.
          restore: () => {
          },
          valueMissing: () => store.get().required && !store.get().value.length,
          message: () => valueMissingMessage("file"),
          anchor: () => element("trigger"),
          focus: api.focus,
          reset: api.internal.reset,
          disabled: api.internal.setFormDisabled,
          subscribe: store.subscribe
        });
      }
    }
  };
  return api;
}
var fileInputApi = fileInputApiBody;
export {
  describeChange,
  fileInputApi,
  fileKey,
  isDisabled,
  settings
};
