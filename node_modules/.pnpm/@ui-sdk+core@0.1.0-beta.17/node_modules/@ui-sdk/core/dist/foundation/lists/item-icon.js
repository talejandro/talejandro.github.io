// src/foundation/lists/item-icon.ts
import { dev } from "#dev";
import { checkName } from "#name-check";
import { writeStyle } from "../platform/style.js";
var marks = /* @__PURE__ */ new WeakMap();
function mark(el, attribute) {
  let counts = marks.get(el);
  if (!counts) {
    marks.set(el, counts = {});
  }
  counts[attribute] = (counts[attribute] ?? 0) + 1;
  if (counts[attribute] === 1) {
    el.setAttribute(attribute, "");
  }
  return () => {
    counts[attribute]--;
    if (counts[attribute] === 0) {
      el.removeAttribute(attribute);
    }
  };
}
function addMirrorRule(doc) {
  writeStyle(
    doc,
    "ui-sdk-mirror",
    "@layer ui-sdk{:where([data-mirror][aria-hidden]){display:inline-block}:where([data-mirror][aria-hidden]:dir(rtl)){scale:-1 1}}"
  );
}
function placeIcon(el, placement, subscribe, found) {
  let unmarkItem;
  let unmarkList;
  let unsubscribe;
  let active = true;
  const place = () => {
    const item = el.parentElement?.closest(placement.item);
    if (!item) {
      return false;
    }
    if (!unmarkItem) {
      unmarkItem = mark(item, "data-has-icon");
      found(item);
    }
    if (!placement.list) {
      return true;
    }
    const list = item.parentElement?.closest(placement.list);
    if (list) {
      unmarkList = mark(list, "data-has-icons");
    }
    return !!list;
  };
  const placeOnChange = () => {
    if (!place()) {
      return;
    }
    unsubscribe?.();
    unsubscribe = void 0;
  };
  if (!place()) {
    queueMicrotask(() => {
      if (active && !place()) {
        unsubscribe = subscribe(placeOnChange);
      }
    });
  }
  return () => {
    active = false;
    unsubscribe?.();
    unmarkItem?.();
    unmarkList?.();
  };
}
function itemIconPart(placement) {
  return {
    // An icon's id is made for it, and its item is the one it's inside.
    props: {
      mirror: "boolean",
      id: "id",
      item: { kind: "string", from: "item.value" }
    },
    state: (state, { props }) => ({ mirror: !!props.mirror }),
    attrs: (state, { props }) => ({
      "aria-hidden": "true",
      "data-mirror": props.mirror ? "" : void 0
    }),
    bind(el, { api, props, id, store }) {
      addMirrorRule(el.ownerDocument);
      const found = (item) => dev && queueMicrotask(() => {
        if (item.isConnected) {
          checkName(item, "An item with only an icon", {
            component: placement.component,
            id
          });
        }
      });
      const unplace = placeIcon(el, placement, store.subscribe, found);
      const unregister = placement.register?.(el, { api, props });
      return () => {
        unplace();
        unregister?.();
      };
    }
  };
}
function createItemIcons(store) {
  const icons = /* @__PURE__ */ new Map();
  let queued = false;
  const changed = () => {
    if (queued) {
      return;
    }
    queued = true;
    queueMicrotask(() => {
      queued = false;
      store.set({ icons: store.get().icons + 1 });
    });
  };
  return {
    /** The icon element of an item. */
    get: (key) => icons.get(key),
    /** Remembers an item's icon until another replaces it. `keep` copies it when it leaves. */
    register(key, icon, keep) {
      icons.set(key, icon);
      changed();
      return () => {
        if (icons.get(key) === icon && keep) {
          icons.set(key, keep(icon));
        }
      };
    }
  };
}
function itemIconsFeature(placement) {
  return {
    slots: {
      "item-icon": itemIconPart(placement),
      "value-icon": valueIconPart()
    },
    extend(api) {
      api.internal.hooks.icons = createItemIcons(api.internal.store);
    }
  };
}
var keepCopy = (icon) => icon.cloneNode(true);
var optionIcon = { item: '[role="option"]', list: '[role="listbox"]' };
function rememberIcon(el, { api, props }) {
  return props.item === void 0 ? () => {
  } : api.internal.icons.register(props.item, el, keepCopy);
}
function selectedIcon(api) {
  const keys = api.internal.selection.keys();
  return keys.length === 1 ? api.internal.icons.get(keys[0]) : void 0;
}
function copyIcon(icon, into) {
  into.replaceChildren(
    ...Array.from(icon?.childNodes ?? [], (node) => node.cloneNode(true))
  );
  into.toggleAttribute("data-mirror", !!icon?.hasAttribute("data-mirror"));
}
function valueIconPart() {
  return {
    present: (state, { api }) => selectedIcon(api) !== void 0,
    attrs: () => ({ "aria-hidden": "true" }),
    bind(el, { api, store }) {
      let shown;
      const write = () => {
        const icon = selectedIcon(api);
        if (icon === shown) {
          return;
        }
        shown = icon;
        copyIcon(icon, el);
      };
      write();
      return store.subscribe(write);
    }
  };
}
export {
  createItemIcons,
  itemIconPart,
  itemIconsFeature,
  optionIcon,
  rememberIcon
};
