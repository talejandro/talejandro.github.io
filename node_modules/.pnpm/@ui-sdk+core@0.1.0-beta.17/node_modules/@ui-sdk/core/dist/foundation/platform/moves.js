// src/foundation/platform/moves.ts
var wakers = /* @__PURE__ */ new Map();
var idle = () => {
};
var unlisten = idle;
var wakeOutside = (event) => wakers.forEach(
  (popup, wake) => event.target instanceof Node && popup?.contains(event.target) || wake()
);
var wakeOnChanges = (records) => wakers.forEach(
  (popup, wake) => records.some(
    (record) => record.attributeName != "aria-activedescendant" && !popup?.contains(record.target)
  ) && wake()
);
function listen() {
  const listening = new AbortController();
  const options = { capture: true, passive: true, signal: listening.signal };
  const targets = [
    // Pointer moves and focus can change layout through `:hover` and `:focus`
    // styles, and typing through fields that grow with their text. A
    // transition starts after its delay.
    [
      document,
      [
        "scroll",
        "load",
        "input",
        "pointermove",
        "focusin",
        "transitionstart",
        "animationstart"
      ]
    ],
    [window, ["resize"]],
    // Pinch zoom moves the visual viewport without resizing the window.
    [window.visualViewport, ["resize", "scroll"]],
    [document.fonts, ["loadingdone"]]
  ];
  for (const [target, types] of targets) {
    for (const type of types) {
      target?.addEventListener(type, wakeOutside, options);
    }
  }
  const changes = new MutationObserver(wakeOnChanges);
  changes.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  });
  return () => {
    listening.abort();
    changes.disconnect();
  };
}
var roots = /* @__PURE__ */ new Map();
function listenIn(root) {
  const listening = new AbortController();
  const options = { capture: true, passive: true, signal: listening.signal };
  for (const type of ["scroll", "load", "transitionstart", "animationstart"]) {
    root.addEventListener(type, wakeOutside, options);
  }
  const changes = new MutationObserver(wakeOnChanges);
  changes.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  });
  return () => {
    listening.abort();
    changes.disconnect();
  };
}
function shadowRootsAround(node) {
  const found = [];
  for (let at = node; at; ) {
    if (at.nodeType === 11 && "host" in at) {
      found.push(at);
      at = at.host;
    } else {
      at = at.assignedSlot ?? at.parentNode;
    }
  }
  return found;
}
function watchShadowRoots(shadowRoots) {
  const watched = [...shadowRoots];
  for (const root of watched) {
    const entry = roots.get(root) ?? { count: 0, stop: listenIn(root) };
    entry.count++;
    roots.set(root, entry);
  }
  return () => {
    for (const root of watched.splice(0)) {
      const entry = roots.get(root);
      if (--entry.count) {
        continue;
      }
      entry.stop();
      roots.delete(root);
    }
  };
}
function watchMoves(wake, popup) {
  if (!wakers.size) {
    unlisten = listen();
  }
  const sizes = typeof ResizeObserver == "function" ? new ResizeObserver(wake) : void 0;
  if (popup) {
    sizes?.observe(popup);
  }
  wakers.set(wake, sizes && popup);
  return () => {
    sizes?.disconnect();
    wakers.delete(wake);
    if (wakers.size) {
      return;
    }
    unlisten();
    unlisten = idle;
  };
}
export {
  shadowRootsAround,
  watchMoves,
  watchShadowRoots
};
