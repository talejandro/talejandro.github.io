// src/foundation/focus/press-keeps-focus.ts
var fields = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
function holdFocus(event, { el }) {
  const field = event.target.closest(fields);
  if (field && !field.contains(el ?? null)) {
    return;
  }
  event.preventDefault();
}
var pressKeepsFocus = { pointerdown: holdFocus, mousedown: holdFocus };
export {
  holdFocus,
  pressKeepsFocus
};
