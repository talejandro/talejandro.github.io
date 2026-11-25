// src/components/tree/tree-api.ts
import { warn } from "#dev";
import { announce } from "../../foundation/platform/announce.js";
import { isRTL } from "../../foundation/platform/env.js";
import { createFocusRecovery } from "../../foundation/focus/focus-recovery.js";
import { bindPanel, stateAndRenders } from "../../foundation/motion/panel.js";
import { isApple } from "../../foundation/platform/platform.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import {
  createTypeahead,
  isTypeaheadKey,
  labelOf
} from "../../foundation/text/typeahead.js";
import { inDocumentOrder } from "../../foundation/kernel/order.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
import { announcePending, isPromise } from "../../foundation/kernel/action.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import { createSelection } from "../../foundation/selection/selection-model.js";
import {
  toggleTreeChecked,
  treeCheckedStates
} from "../../foundation/lists/tree-checked.js";
import {
  createTreeCollection,
  treeDataNodes,
  treeFromPaths
} from "../../foundation/lists/tree-collection.js";
var sameChecks = (a, b) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
};
var toKeys = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
var defaultAnnouncement = ({ type, label }) => type === "expanded" ? "Expanded" : type === "collapsed" ? "Collapsed" : type === "loading" ? "Loading" : `Couldn't load ${label}.`;
function treeApiBody(context) {
  const { id, store, options } = context;
  announcePending(context, () => store.get().pending.length > 0);
  const change = createChange(context);
  const typeahead = createTypeahead();
  const itemProps = (key) => context.props("item", key);
  const itemElement = (key) => key == null ? void 0 : context.element("item", key);
  const built = /* @__PURE__ */ new WeakMap();
  function fromData() {
    const { items, paths } = store.get();
    const next = items ?? paths;
    if (!next) {
      return void 0;
    }
    let data = built.get(next);
    if (!data) {
      const list = items ?? treeFromPaths(paths);
      const nodes = treeDataNodes(list);
      data = {
        items: list,
        tree: createTreeCollection(nodes),
        byKey: new Map(nodes.map((node) => [node.key, node.item]))
      };
      built.set(next, data);
    }
    return data;
  }
  let composed;
  let composedAt = -1;
  function fromParts(version = store.get().version) {
    if (composed && composedAt === version) {
      return composed;
    }
    composedAt = version;
    const bound = elements(context, "item");
    const keys = new Set(bound.map((entry) => entry.key));
    const nodes = bound.map(({ key, props }) => ({
      key,
      parent: props.parent ?? null,
      branch: props.branch
    }));
    for (const part of context.parts()) {
      if (part.slot === "item" && !keys.has(part.key)) {
        const props = part.props;
        nodes.push({
          key: part.key,
          parent: props.parent ?? null,
          branch: props.branch
        });
      }
    }
    return composed = createTreeCollection(nodes);
  }
  const shape = () => fromData()?.tree ?? fromParts();
  function parentOf(key) {
    const known = fromData();
    return known ? known.tree.parent(key) : itemProps(key)?.parent ?? null;
  }
  function ancestors(key) {
    const found = [];
    const seen2 = /* @__PURE__ */ new Set([key]);
    for (let up = parentOf(key); up !== null && !seen2.has(up); up = parentOf(up)) {
      seen2.add(up);
      found.unshift(up);
    }
    return found;
  }
  const isBranch = (key, props = itemProps(key)) => props?.branch ?? fromData()?.tree.isBranch(key) ?? false;
  function isDisabled(state, key, props = itemProps(key)) {
    return state.disabled || state.formDisabled || !!props?.disabled || !!fromData()?.byKey.get(key)?.disabled;
  }
  let openFor;
  let open = /* @__PURE__ */ new Set();
  function shows(key, expanded) {
    if (expanded !== openFor) {
      open = new Set(openFor = expanded);
    }
    return ancestors(key).every((ancestor) => open.has(ancestor));
  }
  const focusable = (state, item) => shows(item.key, state.expanded) && (state.focusableWhenDisabled || !isDisabled(state, item.key, item.props));
  const preferredKey = (state) => state.current ?? state.selected[0] ?? null;
  const roving = createRovingFocus(context, {
    slot: "item",
    key: "active",
    disabled: (item) => isDisabled(store.get(), item.key, item.props),
    focusable: (item) => focusable(store.get(), item),
    preferred: (item) => {
      const state = store.get();
      return state.current === item.key || state.selected.includes(item.key);
    },
    // On the server, the preferred item holds the stop when it shows, else the first item.
    claims: (state, item) => {
      if (!focusable(state, item) || isDisabled(state, item.key, item.props)) {
        return false;
      }
      const preferred = preferredKey(state);
      const known = fromData();
      if (preferred === null || known && !(known.tree.has(preferred) && shows(preferred, state.expanded))) {
        return true;
      }
      return item.key === preferred;
    },
    move: (event, { from, items }) => {
      wanted = moveTarget(
        event,
        from.key,
        dataKeys() ?? items.map((item) => item.key)
      );
      return wanted;
    },
    onItemsChange: () => focusLandedChild()
  });
  function dataKeys() {
    const state = store.get();
    return fromData()?.tree.visible(state.expanded).filter((key) => state.focusableWhenDisabled || !isDisabled(state, key));
  }
  const visibleKeys = () => dataKeys() ?? roving.items().map((item) => item.key);
  let wanted;
  function moveTarget(event, from, keys) {
    const index = keys.indexOf(from);
    if (event.key === "ArrowDown") {
      return keys[index + 1];
    }
    if (event.key === "ArrowUp") {
      return index > 0 ? keys[index - 1] : void 0;
    }
    if (event.key === "Home") {
      return keys[0];
    }
    if (event.key === "End") {
      return keys.at(-1);
    }
  }
  const selection = createSelection(context, {
    key: "selected",
    set: (keys, details) => setValue(
      store.get().mode === "multiple" ? keys : keys[0] ?? null,
      details
    ),
    order: visibleKeys,
    multiple: () => store.get().mode === "multiple",
    selectable: (key) => store.get().mode !== "none" && !isDisabled(store.get(), key)
  });
  function setValue(value, why) {
    return change("value", value, why);
  }
  const recovery = createFocusRecovery({
    fallback: ({ key }) => {
      const { expanded } = store.get();
      const path = ancestors(key);
      const collapsed = path.find((ancestor) => !expanded.includes(ancestor));
      return itemElement(collapsed ?? path.at(-1)) ?? roving.items().find((item) => item.key !== key)?.el;
    }
  });
  function checksFor(state) {
    if (!state.checkable) {
      return {};
    }
    const known = fromData();
    const tree = known?.tree ?? fromParts(state.version);
    const read = treeCheckedStates(tree, state.checked, state.checkStrategy);
    const checks = {};
    for (const key of tree.keys()) {
      const checked = read(key);
      if (checked) {
        checks[key] = checked;
      }
    }
    for (const key of state.checked) {
      if (!tree.has(key)) {
        checks[key] = true;
      }
    }
    return checks;
  }
  function followUp(before, state) {
    const patch = {};
    if (state.value !== before.value) {
      patch.selected = toKeys(state.value);
    }
    if ((state.checkable || before.checkable) && (state.checked !== before.checked || state.checkable !== before.checkable || state.checkStrategy !== before.checkStrategy || state.items !== before.items || state.paths !== before.paths || state.version !== before.version)) {
      const checks = checksFor(state);
      if (!sameChecks(checks, state.checks)) {
        patch.checks = checks;
      }
    }
    if (state.expanded !== before.expanded) {
      const closed = before.expanded.filter(
        (key) => !state.expanded.includes(key) && context.element("group", key)
      );
      patch.exiting = [
        .../* @__PURE__ */ new Set([
          ...state.exiting.filter((key) => !state.expanded.includes(key)),
          ...closed
        ])
      ];
    }
    return patch;
  }
  deriveFromOptions(context, ["value", "selected"], (synced, state, next) => {
    const several = synced.mode === "multiple";
    if (synced.mode === void 0 || several === (state.mode === "multiple")) {
      return;
    }
    if (next.value !== void 0) {
      return;
    }
    const value = several ? toKeys(state.value) : toKeys(state.value)[0] ?? null;
    return { value, selected: toKeys(value) };
  });
  deriveFromOptions(
    context,
    ["selected", "checks", "exiting"],
    (synced, state) => followUp(state, { ...state, ...synced })
  );
  let seen = store.get();
  function derive() {
    const state = store.get();
    const before = seen;
    seen = state;
    store.set(followUp(before, state));
    const dataArrived = !(before.items ?? before.paths) && !!(state.items ?? state.paths);
    if (state.current !== null && (state.current !== before.current || dataArrived)) {
      revealCurrent(state.current);
    }
  }
  context.onDestroy(store.subscribe(derive));
  function revealCurrent(current) {
    const known = fromData();
    const path = known ? known.tree.has(current) ? known.tree.ancestors(current) : [] : ancestors(current);
    const { expanded } = store.get();
    const hidden = path.filter((ancestor) => !expanded.includes(ancestor));
    if (hidden.length) {
      setExpanded([...expanded, ...hidden], { reason: "imperative" });
    }
  }
  {
    const state = store.get();
    const first = { selected: toKeys(state.value) };
    const known = fromData();
    if (known && state.current !== null && options().expanded === void 0 && known.tree.has(state.current)) {
      first.expanded = [
        .../* @__PURE__ */ new Set([...state.expanded, ...known.tree.ancestors(state.current)])
      ];
    }
    store.set(first);
    store.set({ checks: checksFor(store.get()) });
    seen = store.get();
  }
  if (store.get().checkable && store.get().mode !== "none") {
    warn(
      'has checkboxes and a selection, so items are both checked and selected. Pass `mode="none"` unless both mean something.',
      { component: "tree", id }
    );
  }
  let bumpQueued = false;
  function bump() {
    if (bumpQueued) {
      return;
    }
    bumpQueued = true;
    queueMicrotask(() => {
      bumpQueued = false;
      store.set({ version: store.get().version + 1 });
    });
  }
  const byParent = /* @__PURE__ */ new Map();
  const boundParent = /* @__PURE__ */ new WeakMap();
  const orders = /* @__PURE__ */ new Map();
  let movedParents = /* @__PURE__ */ new Set();
  function bumpSiblings(parent) {
    if (!movedParents.size) {
      queueMicrotask(() => {
        const parents = movedParents;
        movedParents = /* @__PURE__ */ new Set();
        const siblings = { ...store.get().siblings };
        for (const key of parents) {
          siblings[key] = (siblings[key] ?? 0) + 1;
        }
        store.set({ siblings });
      });
    }
    movedParents.add(parent);
  }
  function siblingOrder(parent, revision) {
    const known = orders.get(parent);
    if (known && known.revision === revision) {
      return known;
    }
    const entries = [...byParent.get(parent) ?? []].flatMap((key) => {
      const el = itemElement(key);
      return el?.isConnected ? [{ key, el }] : [];
    });
    const sorted = inDocumentOrder(entries);
    const order = {
      revision,
      index: new Map(sorted.map((entry, index) => [entry.key, index + 1])),
      size: sorted.length
    };
    orders.set(parent, order);
    return order;
  }
  const labelText = (key) => {
    const label = context.element("label", key);
    if (label) {
      return labelOf(label);
    }
    return itemProps(key)?.label ?? fromData()?.byKey.get(key)?.label ?? key;
  };
  function say(type, key) {
    if ((type === "expanded" || type === "collapsed") && !isApple()) {
      return;
    }
    const text = (options().announcement ?? defaultAnnouncement)({
      type,
      value: key,
      label: labelText(key)
    });
    if (text) {
      announce(text);
    }
  }
  const deep = /* @__PURE__ */ new Set();
  let deepAll = false;
  let deepWhy = { reason: "imperative" };
  const inDeep = (key) => deepAll || ancestors(key).some((ancestor) => deep.has(ancestor));
  const loaded = /* @__PURE__ */ new Set();
  const loads = /* @__PURE__ */ new Map();
  context.onDestroy(() => loads.forEach((load2) => load2.abort()));
  const needsLoad = (key) => !!options().loadChildren && !loaded.has(key) && isBranch(key) && shape().children(key).length === 0;
  function setLoading(key, on, failed = store.get().failed.includes(key)) {
    const { loading, failed: before } = store.get();
    store.set({
      loading: on ? [...loading, key] : loading.filter((other) => other !== key),
      failed: failed ? [.../* @__PURE__ */ new Set([...before, key])] : before.filter((other) => other !== key)
    });
  }
  let stepInto = null;
  let stepIntoEvent;
  function load(key, why) {
    const running = loads.get(key);
    if (running) {
      running.abort();
      loads.delete(key);
      setLoading(key, false);
      return false;
    }
    const controller = new AbortController();
    const done = (ok) => {
      if (controller.signal.aborted) {
        return;
      }
      loads.delete(key);
      setLoading(key, false, !ok);
      if (!ok) {
        return say("load-failed", key);
      }
      loaded.add(key);
      setExpanded([...store.get().expanded, key], why);
    };
    let result;
    try {
      result = options().loadChildren(key, { signal: controller.signal });
    } catch {
      setLoading(key, false, true);
      say("load-failed", key);
      return false;
    }
    if (!isPromise(result)) {
      loaded.add(key);
      return setExpanded([...store.get().expanded, key], why);
    }
    loads.set(key, controller);
    setLoading(key, true, false);
    say("loading", key);
    result.then(
      () => done(true),
      () => done(false)
    );
    return false;
  }
  function setExpanded(expanded, why) {
    return change("expanded", [...new Set(expanded)], why);
  }
  function setOpen(key, opening, why) {
    const { expanded } = store.get();
    if (!opening) {
      deep.delete(key);
      loads.get(key)?.abort();
      loads.delete(key);
      if (stepInto === key) {
        stepInto = null;
        stepIntoEvent = void 0;
      }
    }
    if (expanded.includes(key) === opening && !loads.has(key)) {
      return false;
    }
    if (opening && needsLoad(key)) {
      return load(key, why);
    }
    const changed = setExpanded(
      opening ? [...expanded, key] : expanded.filter((other) => other !== key),
      why
    );
    if (changed && typeof document !== "undefined" && itemElement(key) === document.activeElement) {
      say(opening ? "expanded" : "collapsed", key);
    }
    return changed;
  }
  function expandDeep(key, why) {
    deep.add(key);
    deepWhy = why;
    const below = shape().descendants(key).filter((child) => isBranch(child) && !needsLoad(child));
    const changed = setExpanded(
      [...store.get().expanded, ...needsLoad(key) ? [] : [key], ...below],
      why
    );
    if (needsLoad(key)) {
      load(key, why);
    }
    return changed;
  }
  function collapseDeep(key, why) {
    const below = /* @__PURE__ */ new Set([key, ...shape().descendants(key)]);
    for (const branch of below) {
      deep.delete(branch);
    }
    return setExpanded(
      store.get().expanded.filter((other) => !below.has(other)),
      why
    );
  }
  let deepQueued = [];
  function queueDeep(key) {
    if (!deepQueued.length) {
      queueMicrotask(() => {
        const keys = deepQueued.filter(
          (branch) => !store.get().expanded.includes(branch) && !needsLoad(branch)
        );
        deepQueued = [];
        if (keys.length) {
          setExpanded([...store.get().expanded, ...keys], deepWhy);
        }
      });
    }
    deepQueued.push(key);
  }
  function follow(key, event) {
    const { mode, activation } = store.get();
    if (mode === "single" && activation === "automatic") {
      selection.choose(key, { reason: "list-navigation", event });
    }
  }
  function focusLandedChild() {
    if (stepInto === null || loads.has(stepInto)) {
      return;
    }
    const parent = stepInto;
    const child = roving.items().find((item) => parentOf(item.key) === parent);
    if (child) {
      const from = itemElement(parent);
      const stayed = !!from && from.getRootNode().activeElement === from;
      stepInto = null;
      child.el.focus();
      if (stayed) {
        follow(child.key, stepIntoEvent);
      }
      stepIntoEvent = void 0;
    }
  }
  function setChecked(checked, why) {
    return change("checked", checked, why);
  }
  function toggleChecked(key, why) {
    const state = store.get();
    if (!state.checkable || isDisabled(state, key)) {
      return false;
    }
    const next = toggleTreeChecked(shape(), state.checked, key, {
      strategy: state.checkStrategy,
      checkable: (other) => !isDisabled(state, other)
    });
    return setChecked(next, why);
  }
  function act(key, event) {
    const action = options().onAction;
    if (!action || store.get().pending.includes(key)) {
      return;
    }
    const result = action(key, { event });
    if (!isPromise(result)) {
      return;
    }
    store.set({ pending: [...store.get().pending, key] });
    const settled = () => store.set({
      pending: store.get().pending.filter((other) => other !== key)
    });
    result.then(settled, settled);
  }
  function press(key, el, event) {
    const state = store.get();
    const active = typeof document === "undefined" ? null : document.activeElement;
    const editing = active instanceof HTMLElement && active !== el && (active.isContentEditable || active.matches("input, textarea, select"));
    if (el && active !== el && !editing) {
      el.focus({ preventScroll: true });
    }
    if (state.active !== key) {
      roving.remember(key);
    }
    if (isDisabled(state, key) || state.pending.includes(key)) {
      return;
    }
    const mouse = event;
    const why = { reason: "item-press", event };
    if (state.mode === "multiple" && mouse?.shiftKey) {
      selection.extend(key, { ...why, from: state.active });
    } else if (state.mode === "multiple" || mouse?.ctrlKey || mouse?.metaKey) {
      selection.toggle(key, why);
    } else {
      selection.choose(key, why);
    }
    if (isBranch(key) && state.expandOnPress) {
      setOpen(key, !state.expanded.includes(key), why);
    }
    act(key, event);
  }
  function keydown(event, el, key) {
    if (!el || event.defaultPrevented) {
      return;
    }
    const state = store.get();
    const mod = event.ctrlKey || event.metaKey;
    wanted = void 0;
    const moved = roving.keydown(event, el);
    const target = moved?.key ?? (wanted !== void 0 && wanted !== key ? wanted : void 0);
    if (target !== void 0) {
      if (!moved) {
        event.preventDefault();
        roving.focus(target);
      }
      const index = visibleKeys().indexOf(target);
      options().onHighlight?.(target, { index, event });
      const homeOrEnd = event.key === "Home" || event.key === "End";
      const why = { reason: "list-navigation", event };
      if (state.mode === "multiple" && event.shiftKey && (!homeOrEnd || mod)) {
        selection.extend(target, { ...why, from: key });
      } else if (!event.shiftKey) {
        follow(target, event);
      }
      return;
    }
    if (wanted !== void 0) {
      return;
    }
    const rtl = isRTL(el);
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    const branch = isBranch(key);
    const expanded = branch && state.expanded.includes(key);
    const disabled = isDisabled(state, key);
    const nav = { reason: "list-navigation", event };
    if (event.key === forward && !mod) {
      if (!branch) {
        return;
      }
      if (event.altKey) {
        if (!disabled) {
          expandDeep(key, nav);
        }
      } else if (!expanded) {
        if (disabled) {
          return;
        }
        if (loads.has(key)) {
          stepInto = key;
          stepIntoEvent = event;
        } else {
          setOpen(key, true, nav);
        }
      } else {
        const child = roving.items().find((item) => parentOf(item.key) === key);
        const first = child?.key ?? fromData()?.tree.children(key)[0];
        if (child) {
          child.el.focus();
          options().onHighlight?.(child.key, {
            index: visibleKeys().indexOf(child.key),
            event
          });
        } else if (first !== void 0) {
          roving.focus(first);
        }
        if (first !== void 0) {
          follow(first, event);
        }
      }
    } else if (event.key === backward && !mod) {
      if (branch && event.altKey && !disabled) {
        collapseDeep(key, nav);
      } else if (expanded && !disabled) {
        setOpen(key, false, nav);
      } else {
        const parent = parentOf(key);
        if (parent === null) {
          return;
        }
        if (itemElement(parent)) {
          itemElement(parent).focus();
        } else {
          roving.focus(parent);
        }
        options().onHighlight?.(parent, {
          index: visibleKeys().indexOf(parent),
          event
        });
        follow(parent, event);
      }
    } else if (event.key === "*") {
      const parent = parentOf(key);
      const siblings = shape().children(parent).filter(
        (sibling) => isBranch(sibling) && !isDisabled(state, sibling) && !needsLoad(sibling)
      );
      setExpanded([...state.expanded, ...siblings], nav);
    } else if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "a") {
      if (state.mode !== "multiple") {
        return;
      }
      selection.toggleAll(nav);
    } else if (event.key === "Enter" && !mod && !event.altKey) {
      const label = context.element("label", key);
      if (label?.matches("a[href]")) {
        label.click();
      } else {
        press(key, el, event);
      }
    } else if (event.key === " " && !typeahead.active()) {
      const why = { reason: "item-press", event };
      if (state.checkable) {
        toggleChecked(key, why);
      } else if (state.mode === "multiple" && event.shiftKey) {
        selection.extend(key, { ...why, from: key });
      } else if (state.mode !== "none") {
        selection.toggle(key, why);
      } else {
        return;
      }
    } else if (isTypeaheadKey(event)) {
      const keys = fromData() ? visibleKeys() : roving.items().map((item) => item.key);
      const found = typeahead(event.key, keys.map(labelText), keys.indexOf(key));
      if (found === -1) {
        return;
      }
      const to = keys[found];
      if (itemElement(to)) {
        itemElement(to).focus();
      } else {
        roving.focus(to);
      }
      options().onHighlight?.(to, { index: found, event });
      follow(to, event);
    } else {
      return;
    }
    event.preventDefault();
  }
  const imperative = (why) => ({
    reason: why?.reason ?? "imperative",
    event: why?.event
  });
  const api = {
    id,
    roving,
    getExpanded: () => store.get().expanded,
    setExpanded: (expanded, why) => setExpanded(expanded, imperative(why)),
    isExpanded: (value) => store.get().expanded.includes(value),
    expand: (value, why) => setOpen(value, true, imperative(why)),
    collapse: (value, why) => setOpen(value, false, imperative(why)),
    toggle: (value, why) => setOpen(value, !store.get().expanded.includes(value), imperative(why)),
    expandAll(why) {
      deepAll = true;
      deepWhy = imperative(why);
      const branches = shape().keys().filter((key) => isBranch(key) && !needsLoad(key));
      return setExpanded([...store.get().expanded, ...branches], deepWhy);
    },
    collapseAll(why) {
      deepAll = false;
      deep.clear();
      return setExpanded([], imperative(why));
    },
    getValue: () => store.get().value,
    setValue: (value, why) => setValue(value, imperative(why)),
    getChecked: () => store.get().checked,
    setChecked: (checked, why) => setChecked(checked, imperative(why)),
    checkedState: (value) => store.get().checks[value] ?? false,
    reveal(value) {
      const land = () => {
        const index = visibleKeys().indexOf(value);
        if (index !== -1) {
          options().onHighlight?.(value, { index });
        }
        roving.focus(value);
        queueMicrotask(
          () => itemElement(value)?.scrollIntoView?.({ block: "nearest" })
        );
      };
      const before = store.get().expanded;
      const hidden = ancestors(value).filter(
        (ancestor) => !before.includes(ancestor)
      );
      if (hidden.length && !setExpanded([...before, ...hidden], { reason: "imperative" })) {
        return;
      }
      if (shows(value, store.get().expanded)) {
        return land();
      }
      const stop = store.subscribe(() => {
        const { expanded } = store.get();
        if (expanded === before) {
          return;
        }
        stop();
        if (shows(value, expanded)) {
          queueMicrotask(land);
        }
      });
    },
    focus: (value) => roving.focus(value),
    internal: {
      mode: () => store.get().mode,
      isBranch,
      isDisabled,
      // An item's depth, from data, or from the parents its props name.
      level(key, props = itemProps(key)) {
        const known = fromData();
        if (known?.tree.has(key)) {
          return known.tree.level(key);
        }
        let level = 1;
        const seen2 = /* @__PURE__ */ new Set([key]);
        for (let up = props?.parent ?? null; up !== null && !seen2.has(up); up = itemProps(up)?.parent ?? null) {
          seen2.add(up);
          level++;
        }
        return level;
      },
      // With data, every item's place among its siblings, which renders on the server.
      dataPosition(key) {
        const known = fromData();
        return known?.tree.has(key) ? known.tree.position(key) : void 0;
      },
      // Without data, its place among the items in the page.
      composedPosition(siblings, key, props) {
        const parent = props.parent ?? "";
        const order = siblingOrder(parent, siblings[parent] ?? 0);
        const index = order.index.get(key);
        return index === void 0 ? void 0 : { index, size: order.size };
      },
      tabIndex: (state, part) => !state.focusableWhenDisabled && isDisabled(state, part.key, part.props) ? "-1" : roving.tabIndex(state, part),
      // The items a data tree renders.
      items: () => fromData()?.items,
      press,
      keydown,
      pressIndicator(key, event) {
        event?.preventDefault();
        const state = store.get();
        if (isDisabled(state, key)) {
          return;
        }
        if (state.active !== key) {
          roving.remember(key);
        }
        const why = { reason: "trigger-press", event };
        const expanded = state.expanded.includes(key);
        if (event?.altKey) {
          expanded ? collapseDeep(key, why) : expandDeep(key, why);
        } else {
          setOpen(key, !expanded, why);
        }
      },
      pressCheckbox(key, event) {
        event?.preventDefault();
        const el = itemElement(key);
        if (el && document.activeElement !== el) {
          el.focus({ preventScroll: true });
        }
        toggleChecked(key, { reason: "item-press", event });
      },
      bindItem(el, part) {
        const cleanups = [roving.bind(el, part), recovery.bind(el, part)];
        const parent = part.props.parent ?? "";
        let siblings = byParent.get(parent);
        if (!siblings) {
          byParent.set(parent, siblings = /* @__PURE__ */ new Set());
        }
        siblings.add(part.key);
        boundParent.set(el, parent);
        bumpSiblings(parent);
        bump();
        if (isBranch(part.key, part.props) && inDeep(part.key)) {
          queueDeep(part.key);
        }
        return () => {
          cleanups.forEach((cleanup) => cleanup());
          siblings.delete(part.key);
          boundParent.delete(el);
          bumpSiblings(parent);
          bump();
        };
      },
      bindRoot(el) {
        if (typeof MutationObserver === "undefined") {
          return;
        }
        const observer = new MutationObserver((records) => {
          for (const record of records) {
            for (const node of record.addedNodes) {
              const parent = boundParent.get(node);
              if (parent === void 0) {
                continue;
              }
              bumpSiblings(parent);
              bump();
            }
          }
        });
        observer.observe(el, { childList: true, subtree: true });
        return () => observer.disconnect();
      },
      // The group's enter and exit animations. A group in the page from the first render doesn't animate in.
      bindGroup(el, key, isFindable, part) {
        let initial = store.get().active === null && store.get().expanded.includes(key);
        let found = false;
        return bindPanel(el, {
          size: (el2, height) => el2.style.setProperty("--tree-group-height", height),
          isOpen: () => store.get().expanded.includes(key),
          isExiting: () => store.get().exiting.includes(key),
          isFindable,
          opening: () => initial ? "mount" : found ? "instant" : "animate",
          reveal(event) {
            found = true;
            setOpen(key, true, { reason: "find-in-page", event });
          },
          trigger: () => itemElement(key),
          subscribe: (listener) => stateAndRenders(
            store,
            part
          )(() => {
            if (!store.get().expanded.includes(key)) {
              initial = false;
            }
            listener();
          }),
          settled: () => {
            initial = found = false;
          },
          exited: () => store.set({
            exiting: store.get().exiting.filter((other) => other !== key)
          })
        });
      }
    }
  };
  return api;
}
var treeApi = treeApiBody;
export {
  treeApi
};
