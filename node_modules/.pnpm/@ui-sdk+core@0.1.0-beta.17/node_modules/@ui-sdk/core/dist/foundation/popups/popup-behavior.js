// src/foundation/popups/popup-behavior.ts
var plain = {
  tab: "close",
  blur: "always",
  outsidePress: "pointerdown",
  shield: false,
  keepTrigger: true,
  focusOnMount: false,
  dismissOnFocusLoss: true,
  closeWatcher: false,
  blocking: false,
  movesFocus: true
};
var trapOrFlow = (modal) => modal.trapFocus ? "trap" : "flow";
var popupPresets = {
  // Tab closes it, like a native menu, and so does the window losing focus.
  menu: plain,
  // Like a native select: Tab closes it and focus moves on from the trigger.
  select: plain,
  // Focus stays in the input while the list is open, so Tab is the browser's.
  // The combobox closes the list itself when focus leaves its input.
  combobox: { ...plain, tab: "native" },
  // Part of the page's Tab order unless modal, and it stays open while you
  // switch windows, so work in it can continue.
  popover: { ...plain, tab: trapOrFlow, blur: "iframe" },
  // Waits for the user whatever has focus. A modal one shields the layers
  // beneath, holds focus from the start, keeps its trigger inert, pauses the
  // page's shortcuts and closes on Android's back. Outside presses count once
  // released, so a text selection dragged out of a field doesn't close it.
  dialog: {
    ...plain,
    tab: trapOrFlow,
    blur: "never",
    outsidePress: "click",
    shield: true,
    keepTrigger: false,
    focusOnMount: true,
    dismissOnFocusLoss: false,
    closeWatcher: true,
    blocking: (modal) => modal.inertAndLock
  },
  // Never takes focus and has nothing to Tab to, so the browser moves focus
  // past it. Escape and an outside press close it, and so does leaving the window.
  tooltip: { ...plain, tab: "native", movesFocus: false },
  // Part of the page's Tab order after its trigger, like a non-modal popover,
  // and focus leaving closes it. It's a passing preview, so leaving the window does too.
  hoverCard: { ...plain, tab: "flow" },
  // Site navigation: Tab flows from a trigger into its panel and on to the
  // next item, focus leaving the navigation closes it, and switching windows
  // leaves it as it was.
  navigationMenu: { ...plain, tab: "flow", blur: "never" }
};
function resolveBehavior(preset, overrides) {
  const behavior = { ...popupPresets[preset] };
  for (const key of Object.keys(plain)) {
    const value = overrides[key];
    if (value !== void 0) {
      Object.assign(behavior, { [key]: value });
    }
  }
  return behavior;
}
export {
  popupPresets,
  resolveBehavior
};
