/** The callback that hears a key change or commit, like `onValueChange` for `"value"`. */
declare const callbackName: (key: string, kind: "Change" | "Commit") => string;
/** The option an uncontrolled key starts from, like `defaultValue` for `"value"`. */
declare const defaultName: (key: string) => string;
export { callbackName, defaultName };
