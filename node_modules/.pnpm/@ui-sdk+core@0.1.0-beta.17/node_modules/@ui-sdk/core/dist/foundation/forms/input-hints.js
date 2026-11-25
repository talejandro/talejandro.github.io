// src/foundation/forms/input-hints.ts
var exact = {
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: "false"
};
var kinds = {
  search: {
    inputMode: "search",
    enterKeyHint: "search",
    autoComplete: "off",
    autoCapitalize: "none",
    spellCheck: "false"
  },
  email: { inputMode: "email", autoComplete: "email", ...exact },
  tel: { inputMode: "tel", autoComplete: "tel" },
  url: { inputMode: "url", autoComplete: "url", ...exact },
  "one-time-code": {
    inputMode: "numeric",
    autoComplete: "one-time-code",
    ...exact
  },
  numeric: { inputMode: "numeric", autoComplete: "off" },
  decimal: { inputMode: "decimal", autoComplete: "off" },
  name: {
    autoComplete: "name",
    autoCapitalize: "words",
    autoCorrect: "off",
    spellCheck: "false"
  },
  username: { autoComplete: "username", ...exact },
  "current-password": { autoComplete: "current-password", ...exact },
  "new-password": { autoComplete: "new-password", ...exact },
  "postal-code": {
    autoComplete: "postal-code",
    autoCapitalize: "characters",
    autoCorrect: "off",
    spellCheck: "false"
  },
  message: {
    enterKeyHint: "send",
    autoComplete: "off",
    autoCapitalize: "sentences",
    autoCorrect: "on",
    spellCheck: "true"
  }
};
function inputHints(kind, options = {}) {
  const hints = { ...kinds[kind] };
  if (options.enter) {
    hints.enterKeyHint = options.enter;
  }
  return hints;
}
export {
  inputHints
};
