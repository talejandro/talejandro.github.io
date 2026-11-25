// src/components/file-input/file-input.ts
import {
  fileInputApi,
  fileKey,
  isDisabled,
  settings
} from "./file-input-api.js";
import { bindDropzone } from "./file-input-dropzone.js";
import { hiddenInputStyle } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { formatFileSize, relativePath } from "../../foundation/forms/files.js";
function createFileInputController() {
  return createController();
}
function captureAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  if (attribute === "" || attribute === "true") {
    return true;
  }
  return attribute === "false" ? false : attribute;
}
function rootState(state) {
  return {
    value: state.value,
    disabled: isDisabled(state),
    required: state.required,
    dragging: Object.keys(state.drags).length > 0
  };
}
function dropzoneState(state, key) {
  const status = state.drags[key];
  return {
    dragging: !!status,
    dragAccept: status === "accept",
    dragReject: status === "reject",
    disabled: isDisabled(state)
  };
}
var formAttrs = (state) => ({
  "data-disabled": isDisabled(state) ? "" : void 0,
  "data-required": state.required ? "" : void 0
});
function isActiveItem(state, key) {
  const active = state.activeItem;
  if (active && state.value.some((file) => fileKey(file) === active)) {
    return active === key;
  }
  return state.value.length > 0 && fileKey(state.value[0]) === key;
}
var fileInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "file-input",
  options: {
    accept: "string",
    maxFiles: "number",
    maxSize: "number",
    minSize: "number",
    validate: "value",
    value: "value",
    defaultValue: "value",
    onValueChange: "callback",
    onReject: "callback",
    multiple: "boolean",
    directory: "boolean",
    capture: captureAttribute,
    name: "string",
    form: "string",
    required: "boolean",
    disabled: "boolean",
    announcement: "value",
    controller: "value"
  },
  state: (options) => {
    const value = options.value ?? options.defaultValue ?? [];
    return {
      ...settings(options),
      value,
      initial: options.defaultValue ?? value,
      formDisabled: false,
      associated: false,
      drags: {},
      activeItem: null
    };
  },
  sync: (options) => ({
    ...settings(options),
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.value === void 0 ? {} : { value: options.value }
  }),
  api: fileInputApi,
  slots: (slot) => ({
    root: slot({
      state: rootState,
      attrs: (state) => ({
        ...formAttrs(state),
        "data-dragging": Object.keys(state.drags).length ? "" : void 0
      }),
      bind: (el, { api }) => api.internal.bindRoot(el)
    }),
    // The hidden input that opens the picker and, in React and Vue, holds the files the form submits.
    input: slot({
      attrs: (state) => ({
        type: "file",
        accept: state.accept,
        multiple: state.multiple ? "" : void 0,
        webkitdirectory: state.directory ? "" : void 0,
        capture: state.capture === true ? "" : state.capture,
        name: state.associated ? void 0 : state.name,
        form: state.associated ? void 0 : state.form,
        required: state.required && !state.associated ? "" : void 0,
        disabled: state.disabled ? "" : void 0,
        "aria-hidden": "true",
        tabindex: "-1",
        style: hiddenInputStyle
      }),
      bind: (el, { api }) => api.internal.bindInput(el)
    }),
    // Opens the picker. React and Vue render a button, and web components bind the button inside.
    trigger: slot({
      state: rootState,
      attrs: (state) => ({
        type: "button",
        // A trigger connected from outside a disabled <fieldset> isn't disabled by it natively.
        disabled: isDisabled(state) ? "" : void 0,
        ...formAttrs(state)
      }),
      press: ({ api }) => {
        api.open();
      }
    }),
    // Takes dropped and pasted files. It has no role and no tab stop.
    dropzone: slot({
      // Each zone is its own part, so it needs an id. `pasteTarget` is a
      // selector or "document" as an attribute, and may be an element too.
      props: {
        target: "string",
        pasteTarget: (attribute) => attribute,
        id: "id"
      },
      state: (state, { key }) => dropzoneState(state, key),
      attrs: (state, { key }) => {
        const { dragging, dragAccept, dragReject, disabled } = dropzoneState(
          state,
          key
        );
        return {
          "data-dragging": dragging ? "" : void 0,
          "data-drag-accept": dragAccept ? "" : void 0,
          "data-drag-reject": dragReject ? "" : void 0,
          "data-disabled": disabled ? "" : void 0
        };
      },
      bind: (el, { key, store, api }) => bindDropzone(el, {
        key,
        store,
        api,
        props: () => api.internal.dropzoneProps(key)
      })
    }),
    // The files, as a list. Adapters render its items, one per file.
    list: slot({
      role: "list",
      state: rootState,
      attrs: formAttrs
    }),
    // One file. It's focusable, with one tab stop for the list: arrow keys move
    // between items, and Backspace or Delete removes the focused one.
    item: slot({
      role: "listitem",
      focus: "roving",
      keys: [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Backspace",
        "Delete"
      ],
      props: { file: "value", value: "string" },
      state: (state, { props }) => ({
        file: props.file,
        index: state.value.indexOf(props.file),
        disabled: isDisabled(state)
      }),
      attrs: (state, { key }) => ({
        tabindex: isActiveItem(state, key) ? "0" : "-1",
        "data-disabled": isDisabled(state) ? "" : void 0
      }),
      on: {
        keydown: (event, { api, el, props }) => el && api.internal.itemKeydown(event, el, props.file),
        focusin: (_, { api, key }) => api.internal.setActiveItem(key)
      }
    }),
    // Removes its item's file. Out of the tab order, since Backspace on the item does the same.
    // Renderers fill `file` from the item around it, so it's set by now.
    "item-remove": slot({
      props: {
        file: { kind: "value", from: "item" },
        value: { kind: "string", from: "item" }
      },
      state: (state) => ({ disabled: isDisabled(state) }),
      attrs: (state, { props }) => ({
        type: "button",
        tabindex: "-1",
        "aria-label": `Remove ${props.file.name}`,
        disabled: isDisabled(state) ? "" : void 0,
        "data-disabled": isDisabled(state) ? "" : void 0
      }),
      press: ({ api, props }, event) => api.internal.removeItem(props.file, event)
    })
  }),
  agent: {
    actions: ["setValue", "addFiles", "removeFile", "clear", "open"],
    items: (api) => api.getValue().map((file) => ({ value: fileKey(file), label: file.name }))
  }
});
var fileInput = fileInputPrimitive;
export {
  createFileInputController,
  fileInput,
  formatFileSize,
  relativePath
};
