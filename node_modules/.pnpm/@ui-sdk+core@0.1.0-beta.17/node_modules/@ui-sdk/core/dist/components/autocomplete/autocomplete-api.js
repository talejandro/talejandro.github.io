// src/components/autocomplete/autocomplete-api.ts
import {
  createAutocompleteCore
} from "../../foundation/lists/autocomplete-core.js";
import {
  modalityOf,
  restoreFocus,
  trackModality
} from "../../foundation/kernel/modality.js";
import { deriveOpen } from "../../foundation/popups/popup.js";
import {
  createPopup,
  popupState
} from "../../foundation/popups/create-popup.js";
import { comboboxPreset } from "../../foundation/popups/popup-presets.js";
import { normalize } from "../../foundation/text/typeahead.js";
import { submitImplicitly } from "../../foundation/forms/form.js";
import { afterReset, keepsValueOnReset } from "../../foundation/forms/value.js";
import {
  highlightedValue,
  highlightFromCode
} from "../../foundation/lists/listbox.js";
import { noListing } from "../../foundation/lists/listbox-listing.js";
import { isDisabled } from "../../foundation/lists/listbox-parts.js";
import { listKeyDown } from "../../foundation/lists/listbox-keyboard.js";
import { opensIntoList } from "../../foundation/lists/listbox-search.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import { on } from "../../foundation/kernel/events.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
var controlSlots = ["input", "trigger", "clear", "label"];
function initialAutocompleteState(options) {
  const value = options.value ?? options.defaultValue ?? "";
  return {
    ...popupState(options),
    value,
    query: value,
    initial: options.defaultValue ?? "",
    highlighted: null,
    items: options.items,
    status: options.status ?? "idle",
    listed: false,
    labeled: false,
    fieldName: null,
    inline: !!options.inlineComplete,
    disabled: !!options.disabled,
    formDisabled: false,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    mounts: 0,
    settled: false,
    focusInList: false,
    groupLabels: [],
    presentation: "popover",
    listing: noListing
  };
}
function syncAutocompleteState(options) {
  return {
    items: options.items,
    status: options.status ?? "idle",
    inline: !!options.inlineComplete,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.open === void 0 ? {} : { open: options.open },
    ...options.value === void 0 ? {} : { value: options.value }
  };
}
function autocompleteApiBody(context) {
  const { id, store, options, element } = context;
  deriveOpen(
    context,
    ["highlighted", "focusInList"],
    (open) => open ? void 0 : { highlighted: null, focusInList: false }
  );
  const change = createChange(context);
  let requested = store.get().value;
  let openedBy = "imperative";
  let pendingHighlight = null;
  const inputElement = () => element("input");
  const contentElement = () => popup.element() ?? element("content");
  const editable = () => {
    const state = store.get();
    return !isDisabled(state) && !state.readOnly;
  };
  const completes = () => !!options().inlineComplete;
  function completionFor(text, listbox) {
    const needle = normalize(text);
    if (!needle) {
      return void 0;
    }
    return listbox.entries().find(
      (entry) => !listbox.disabled(entry) && normalize(entry.label).startsWith(needle)
    );
  }
  const core = createAutocompleteCore(context, {
    query: () => store.get().query,
    items: () => store.get().items,
    emptyItems: () => options().emptyItems,
    // Suggestions are strings, so a filter for them reads every item the engine passes.
    filter: () => options().filter ?? "contains",
    autoHighlight: () => options().autoHighlight || completes() ? "typing" : false,
    preferred: (listbox) => completes() ? completionFor(store.get().query, listbox)?.key : void 0,
    highlight(key, why) {
      core.listbox.highlight(key, { event: why?.event });
      if (key !== null && completes() && why?.reason === "list-navigation") {
        fillIn(key, why.event);
      }
    },
    open(event, edge) {
      if (!event.altKey) {
        pendingHighlight = edge;
      }
      show({ event, by: "keyboard" });
    },
    onHighlight: (key, index, event) => options().onHighlight?.(key, { index, event }),
    container: () => element("list") ?? contentElement(),
    scrollRoot: contentElement
  });
  deriveFromOptions(context, ["highlighted"], (synced, state) => {
    if (synced.items === state.items) {
      return;
    }
    return {
      highlighted: store.view(
        { ...state, ...synced },
        () => core.settledHighlight(false)
      )
    };
  });
  const ownsElement = (target) => controlSlots.some(
    (slot) => elements(context, slot).some(({ el }) => el.contains(target))
  );
  const kit = createPopup(context, {
    preset: comboboxPreset,
    rules: () => ({
      trigger: inputElement,
      // Focus stays in the field, whatever closes the list.
      returnFocus: false,
      dismiss: (reason, { event }) => hide({ reason, event }),
      contains: ownsElement,
      onOpenChange(open) {
        if (open) {
          return;
        }
        pendingHighlight = null;
        store.set({ highlighted: null, focusInList: false });
      },
      onShow() {
        const el = element("content");
        if (el) {
          return trackModality(el, modalityOf(openedBy), () => [inputElement()]);
        }
      },
      open({ event, by }, open) {
        if (!editable()) {
          return;
        }
        openedBy = by === "touch" && presentation.resolve() !== "sheet" ? "pointer" : by ?? "imperative";
        store.set({
          focusInList: opensIntoList(event) && event?.target !== inputElement()
        });
        open(openedBy);
      },
      // Focus is in the field already, unless it left or a screen reader moved it into the list.
      close(_, close) {
        const inList = store.get().focusInList && !!contentElement()?.contains(document.activeElement);
        close();
        const input = inputElement();
        if (inList && input && !store.get().open) {
          restoreFocus(input);
        }
      }
    })
  });
  const { control, popup } = kit.internal;
  const presentation = kit.internal.presentation;
  const { show, hide } = control;
  function setValue(value, reason, {
    event,
    query = value,
    item
  } = {}) {
    const state = store.get();
    if ((isDisabled(state) || state.readOnly) && reason !== "reset") {
      return false;
    }
    requested = value;
    core.cause(reason, event);
    if (value === state.value || change("value", value, { reason, event, ...item && { item } })) {
      if (requested === value) {
        store.set({ query });
      }
      return true;
    }
    const input = inputElement();
    if (input && input.value !== state.value) {
      input.value = state.value;
    }
    return false;
  }
  function typed(input, event) {
    if (!editable()) {
      return;
    }
    const text = input.value;
    const insertion = event;
    const completing = completes() && !insertion?.isComposing && !!insertion?.inputType?.startsWith("insert") && insertion.inputType !== "insertReplacementText" && input.selectionEnd === text.length;
    const match = completing ? completionFor(text, core.listbox) : void 0;
    const completed = match ? text + match.label.slice(text.length) : text;
    if (!setValue(completed, "input-change", { event, query: text })) {
      return;
    }
    if (match && completed !== text) {
      input.value = completed;
      input.setSelectionRange(text.length, completed.length);
    }
    if (!store.get().open && (event || input.matches(":focus"))) {
      if (text) {
        pendingHighlight = "first";
      }
      show({ event, by: "keyboard", reason: "input-change" });
    }
  }
  function fillIn(key, event) {
    const label = core.listbox.find(key)?.label;
    const input = inputElement();
    const { query } = store.get();
    if (label === void 0 || !setValue(label, "list-navigation", { event, query })) {
      return;
    }
    if (!input) {
      return;
    }
    input.value = label;
    const start = normalize(label).startsWith(normalize(query)) ? query.length : label.length;
    input.setSelectionRange(start, label.length);
  }
  function submit(event) {
    options().onSubmit?.(store.get().value, { event });
    return !event?.defaultPrevented;
  }
  function choose(key, event) {
    const entry = core.listbox.find(key);
    if (!entry || core.listbox.disabled(entry) || !editable()) {
      return false;
    }
    setValue(entry.label, "item-press", {
      event,
      item: { value: entry.key, label: entry.label }
    });
    const input = inputElement();
    if (input && input.value !== store.get().value) {
      input.value = store.get().value;
    }
    hide({ reason: "item-press", event });
    return true;
  }
  function press(key, event) {
    if (!choose(key, event) || !options().submitOnSelect) {
      return;
    }
    if (submit(event)) {
      submitImplicitly(inputElement()?.form);
    }
  }
  function onEnter(event) {
    const { open, highlighted } = store.get();
    if (open && highlighted !== null) {
      const el = core.listbox.element(highlighted);
      if (el?.matches("a[href]")) {
        event.preventDefault();
        return el.click();
      }
      if (!choose(highlighted, event)) {
        return event.preventDefault();
      }
      if (!options().submitOnSelect || !submit(event)) {
        event.preventDefault();
      }
      return;
    }
    if (open) {
      hide({ reason: "input-commit", event });
    }
    if (!submit(event)) {
      event.preventDefault();
    }
  }
  function onInputKeyDown(event) {
    if (core.navigate(event)) {
      return;
    }
    const { open, value, query } = store.get();
    switch (event.key) {
      case "ArrowUp":
        if (event.altKey && open) {
          event.preventDefault();
          hide({ reason: "escape-key", event });
        }
        return;
      case "ArrowDown":
        if (event.altKey && !open) {
          event.preventDefault();
          show({ event, by: "keyboard" });
        }
        return;
      case "Enter":
        return onEnter(event);
      case "ArrowRight":
      case "End":
        if (completes() && value !== query && !event.shiftKey) {
          core.cause("input-change", event);
          store.set({ query: value });
        }
        return;
      case "Escape":
        if (open && value !== query && setValue(query, "escape-key", { event })) {
          const input = inputElement();
          if (input) {
            input.value = query;
          }
        }
        return;
      case "Tab":
        if (open) {
          hide({ reason: "focus-out", event });
        }
    }
  }
  function bindReset(el) {
    return on(
      el.ownerDocument,
      "reset",
      (event) => {
        if (event.target !== el.form || keepsValueOnReset(options().value, options().defaultValue)) {
          return;
        }
        afterReset(event, () => {
          const { initial } = store.get();
          setValue(initial, "reset");
          if (el.value !== store.get().value) {
            el.value = store.get().value;
          }
        });
      },
      { capture: true }
    );
  }
  const api = {
    id,
    isOpen: kit.isOpen,
    setOpen: kit.setOpen,
    open: kit.open,
    close: kit.close,
    toggle: kit.toggle,
    getValue: () => store.get().value,
    setValue: (value, {
      reason = "imperative",
      event
    } = {}) => value !== store.get().value && setValue(value, reason, { event }),
    clear: ({
      reason = "imperative",
      event
    } = {}) => store.get().value !== "" && setValue("", reason, { event }),
    getHighlighted: () => highlightedValue(core.listbox, store.get().highlighted),
    highlight: (value) => store.get().open && highlightFromCode(
      core.listbox,
      value === null ? null : String(value),
      store.get().highlighted
    ),
    focus: () => inputElement()?.focus(),
    // Internal. Used by slots and adapters.
    internal: {
      ...core,
      options,
      popup,
      presentation,
      show,
      hide,
      press,
      typed,
      onInputKeyDown,
      ownsElement,
      bindReset,
      inputElement,
      anchorElement: inputElement,
      contentElement,
      arrowElement: () => element("arrow"),
      text: (state) => state.value,
      itemProps: (key) => context.props("item", key),
      setFormDisabled: (formDisabled) => store.set({ formDisabled }),
      // Where focus goes once the list opens: it stays in the field, unless a
      // screen reader's tap moved it into the list, to the first suggestion.
      initialFocus() {
        const target = pendingHighlight;
        pendingHighlight = null;
        if (store.get().focusInList) {
          const first = core.listbox.firstEnabled();
          if (first === void 0) {
            return contentElement();
          }
          core.listbox.highlight(first, { focus: false });
          return core.listbox.element(first) ?? contentElement();
        }
        if (target === "first" && store.get().query) {
          core.settle(true, null);
        } else if (target) {
          core.listbox.highlight(core.listbox.stepKey(target) ?? null);
        }
        return store.get().presentation === "sheet" ? inputElement() : void 0;
      },
      // Keys in the list, when a screen reader's tap moved real focus there.
      onListKeyDown(event) {
        if (!store.get().focusInList || event.target === inputElement()) {
          return;
        }
        listKeyDown(event, {
          listbox: core.listbox,
          highlighted: store.get().highlighted,
          choose: press,
          focusInput() {
            store.set({ focusInList: false });
            inputElement()?.focus({ preventScroll: true });
          }
        });
      },
      contentProps: (key) => kit.internal.contentProps(key)
    }
  };
  deriveFromOptions(
    context,
    ["query"],
    (synced, state) => "value" in synced && synced.value !== state.value && synced.value !== requested ? { query: synced.value } : void 0
  );
  let previousValue = store.get().value;
  store.subscribe(() => {
    const { value } = store.get();
    if (value === previousValue) {
      return;
    }
    previousValue = value;
    if (value === requested) {
      return;
    }
    requested = value;
    store.set({ query: value });
  });
  return api;
}
var autocompleteApi = autocompleteApiBody;
export {
  autocompleteApi,
  initialAutocompleteState,
  syncAutocompleteState
};
