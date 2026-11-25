/**
 * What a phone labels the Return key, through `enterkeyhint`.
 * @experimental
 */
type EnterKeyHint = "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
/**
 * The kinds of field `inputHints` knows.
 * @experimental
 */
type InputHintKind = "search" | "email" | "tel" | "url" | "one-time-code" | "numeric" | "decimal" | "name" | "username" | "current-password" | "new-password" | "postal-code" | "message";
/**
 * The attributes `inputHints` returns, spelled as React spells them. HTML
 * reads attribute names in any case, so they work in every framework.
 * @experimental
 */
type InputHints = {
    inputMode?: "search" | "email" | "tel" | "url" | "numeric" | "decimal";
    enterKeyHint?: EnterKeyHint;
    autoComplete?: string;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: "on" | "off";
    spellCheck?: "true" | "false";
};
/**
 * Options for `inputHints`.
 * @experimental
 */
type InputHintOptions = {
    /** What the Return key says, like `"next"` for a field with more after it. Replaces the kind's own. */
    enter?: EnterKeyHint;
};
/**
 * The attributes that suit a field of `kind`: a phone's keys and Return key,
 * autofill, and capitals, corrections and spelling. Spread them on an
 * `<input>` or `<textarea>` in any framework. Your own attributes after them win.
 * @experimental
 */
declare function inputHints(kind: InputHintKind, options?: InputHintOptions): InputHints;
export { type EnterKeyHint, type InputHintKind, type InputHintOptions, type InputHints, inputHints, };
