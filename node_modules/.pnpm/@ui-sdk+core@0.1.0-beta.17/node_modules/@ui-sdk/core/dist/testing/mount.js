// src/testing/mount.ts
import { click, drag, hover, keys, settle, type } from "./input.js";
import { parseMarkup } from "./markup.js";
import { camel, fromOf, slotProps, tagOf } from "./schema.js";
import { setAnnouncer } from "../foundation/platform/announce.js";
import { applyAttrs } from "../foundation/kernel/live.js";
import { attrs, bind, present, subscribe } from "../foundation/kernel/part.js";
import { schemaOf } from "../foundation/kernel/primitive.js";
import { listen } from "../page/observe/registry.js";
var mounted = 0;
var rerenders = /* @__PURE__ */ new WeakMap();
var announcers = /* @__PURE__ */ new Set();
var announceToMounts = (text) => announcers.forEach((hear) => hear(text));
function listenToAnnouncements(hear) {
  announcers.add(hear);
  setAnnouncer(announceToMounts);
  return () => {
    announcers.delete(hear);
    if (!announcers.size) {
      setAnnouncer(void 0);
    }
  };
}
function layOut(el) {
  el.getBoundingClientRect = () => {
    const siblings = el.parentElement ? [...el.parentElement.children].filter(
      (child) => child.getAttribute("data-slot") === el.getAttribute("data-slot")
    ) : [el];
    const index = Math.max(0, siblings.indexOf(el));
    const row = el.closest(
      '[aria-orientation="horizontal"], [data-orientation="horizontal"]'
    );
    const rtl = el.closest("[dir]")?.getAttribute("dir") === "rtl";
    const [width, height] = row ? [100, 40] : [200, 40];
    const x = row ? (rtl ? siblings.length - 1 - index : index) * width : 0;
    const y = row ? 0 : index * height;
    return {
      x,
      y,
      left: x,
      top: y,
      width,
      height,
      right: x + width,
      bottom: y + height,
      toJSON: () => ({})
    };
  };
  el.getClientRects = () => el.isConnected ? [el.getBoundingClientRect()] : [];
}
function fillGaps(doc) {
  const proto = Element.prototype;
  proto.getAnimations ??= () => [];
  Element.prototype.scrollIntoView ??= () => {
  };
  if (!doc.querySelector("style[data-ui-sdk-testing]")) {
    const style = doc.createElement("style");
    style.setAttribute("data-ui-sdk-testing", "");
    style.textContent = "[popover][data-open] { display: block !important }";
    doc.head.append(style);
  }
  proto.checkVisibility ??= function() {
    if (!this.isConnected) {
      return false;
    }
    for (let node = this; node; node = node.parentElement) {
      if (node.hidden) {
        return false;
      }
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
    }
    return true;
  };
  doc.elementsFromPoint ??= (x, y) => [...doc.querySelectorAll("[data-slot]")].filter((el) => {
    const box = el.getBoundingClientRect();
    return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
  }).reverse();
  doc.elementFromPoint ??= (x, y) => doc.elementsFromPoint(x, y)[0] ?? null;
}
function mount(primitive, options, markup) {
  const schema = schemaOf(primitive);
  const doc = document;
  fillGaps(doc);
  const id = `mount-${++mounted}`;
  const changes = [];
  const settled = [];
  const announced = [];
  const cleanups = [
    listen((change) => change.id === id && changes.push(change), true),
    listen((change) => change.id === id && settled.push(change))
  ];
  const teardown = [listenToAnnouncements((text) => announced.push(text))];
  function unmount() {
    const errors = [];
    for (const step of [...cleanups.splice(0), ...teardown.splice(0)]) {
      try {
        step();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) {
      throw errors[0];
    }
  }
  function unmountingOnError(run) {
    try {
      return run();
    } catch (error) {
      unmount();
      throw error;
    }
  }
  const container = doc.createElement("div");
  doc.body.append(container);
  teardown.unshift(() => container.remove());
  let current = { ...options, id };
  const instance = unmountingOnError(() => primitive(current));
  teardown.unshift(() => instance.destroy());
  const parts = [];
  const syncs = [];
  function render(node, parent, around) {
    if (typeof node === "string") {
      return parent.appendChild(doc.createTextNode(node));
    }
    const own = schema.slots[node.tag];
    if (!own) {
      const el2 = doc.createElement(node.tag);
      for (const [name, value] of node.attributes) {
        el2.setAttribute(name, value);
      }
      parent.appendChild(el2);
      for (const child of node.children) {
        render(child, el2, around);
      }
      return;
    }
    const slot = node.tag;
    const { props, extra, as } = slotProps(
      own,
      node.attributes,
      around,
      () => `${id}-${slot}-${parts.length}`
    );
    let part = instance.part(slot, props);
    const el = doc.createElement(as ?? tagOf(attrs(part)));
    for (const [name, value] of extra) {
      el.setAttribute(name, value);
    }
    layOut(el);
    const placeholder = doc.createComment(slot);
    parent.appendChild(placeholder);
    let unbind;
    let ready = false;
    const sync = () => {
      applyAttrs(el, attrs(part));
      const shows = present(part);
      const swaps = shows ? placeholder.parentNode : el.parentNode;
      if (shows && swaps) {
        placeholder.replaceWith(el);
      } else if (!shows && swaps) {
        el.replaceWith(placeholder);
      }
      if (!ready) {
        return;
      }
      const rendered = shows && !parts.some(
        (outer) => outer.el !== el && !outer.shows() && outer.el.contains(el)
      );
      if (rendered && !unbind) {
        let cleanup;
        unbind = () => cleanup?.();
        cleanup = bind(part, el);
      } else if (!rendered && unbind) {
        unbind();
        unbind = void 0;
      }
      if (swaps) {
        for (const inner of parts) {
          if (inner.el !== el && el.contains(inner.el)) {
            inner.sync();
          }
        }
      }
    };
    sync();
    syncs.push(sync);
    const inherited = Object.keys(own).flatMap((key) => {
      const from = fromOf(own[key], key);
      return from && !node.attributes.some(([name]) => camel(name) === key) ? [{ key, ...from }] : [];
    });
    let unsubscribe;
    const rerender = (next) => {
      const found = instance.part(slot, next);
      if (found === part) {
        return;
      }
      unbind?.();
      unbind = void 0;
      unsubscribe?.();
      part = found;
      entry.key = part.key;
      if (ready) {
        unsubscribe = subscribe(part, sync);
      }
    };
    const entry = {
      slot,
      key: part.key,
      el,
      props,
      inherited,
      sync,
      rerender,
      shows: () => present(part)
    };
    parts.push(entry);
    binds.push(() => {
      ready = true;
      unsubscribe = subscribe(part, sync);
      cleanups.push(
        () => unsubscribe?.(),
        () => unbind?.()
      );
      sync();
    });
    for (const child of node.children) {
      render(child, el, { ...around, [slot]: props });
    }
  }
  const binds = [];
  unmountingOnError(() => {
    for (const node of parseMarkup(markup)) {
      render(node, container, {});
    }
    binds.forEach((bindPart) => bindPart());
  });
  const root = container.firstElementChild ?? container;
  const view = {
    /** The first element of the markup, usually the root part. */
    root,
    /** The element of a part, by slot and, for a slot with several parts, its key, like an item's value. */
    part: (slot, key) => parts.find(
      (entry) => entry.slot === slot && (key === void 0 || entry.key === key)
    )?.el,
    /** The instance's state now. */
    get state() {
      return instance.get();
    },
    /** The instance's api, the methods a controller calls. */
    api: instance.api,
    /** Every change that went through, step by step, with its reason and source. */
    changes,
    /** Changes as `observe` reports them: one per interaction a commit settles. */
    settled,
    /** What screen readers would read, in order. */
    announced,
    /** Presses keys one after another on the focused element, like `"Tab"`, `"Shift+Tab"` or `"Space"`. Tab from elsewhere in the page goes into the markup. */
    keys: (...names) => keys(doc, names, container),
    /** Types text into the focused element, a key per character. */
    type: (text) => type(doc, text),
    /** Clicks an element with a mouse. */
    click,
    /** Drags an element with a mouse onto another, or by a distance. */
    drag,
    /** Moves a mouse onto an element. */
    hover,
    /** Waits for what the primitive scheduled: microtasks, a timer and two frames. */
    settle,
    /** Unbinds every part, destroys the instance and removes the markup. */
    unmount
  };
  rerenders.set(view, {
    setOptions(patch) {
      current = { ...current, ...patch, id };
      instance.setOptions(current);
      syncs.forEach((sync) => sync());
    },
    setProps(slot, key, patch) {
      const entry = parts.find(
        (found) => found.slot === slot && (key === "" || found.key === key)
      );
      if (!entry) {
        throw new Error(`No ${slot} part keyed "${key}" in the markup.`);
      }
      entry.props = { ...entry.props, ...patch };
      entry.rerender(entry.props);
      for (const inner of parts) {
        const taken = inner.inherited.filter(
          (from) => from.slot === slot && from.prop in patch
        );
        if (inner === entry || !taken.length || !entry.el.contains(inner.el)) {
          continue;
        }
        for (const from of taken) {
          inner.props = { ...inner.props, [from.key]: patch[from.prop] };
        }
        inner.rerender(inner.props);
      }
      syncs.forEach((sync) => sync());
    }
  });
  return view;
}
var rerenderOf = (mounted2) => rerenders.get(mounted2);
export {
  mount,
  rerenderOf
};
