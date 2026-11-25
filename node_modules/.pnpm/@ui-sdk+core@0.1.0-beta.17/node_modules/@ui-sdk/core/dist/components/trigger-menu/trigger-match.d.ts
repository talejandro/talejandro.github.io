import type { TextRange } from "../../foundation/text/text-editor.js";
/**
 * Where a match may start. `"start"`: offset 0 only, so a leading space escapes it. `"line"`: the
 * start of a line. `"word"`: the start, whitespace, an opening bracket or quote, or right after a
 * token. `"anywhere"`: mid-word too.
 * @stable
 */
type TriggerBoundary = "start" | "line" | "word" | "anywhere";
/**
 * How a trigger matches.
 * @stable
 */
type TriggerRule = {
    /** The text that starts a match: `"@"`, `"/"`, `"#"`, or several characters like `"[["`. */
    char: string;
    /**
     * Where a match may start.
     * @defaultValue "word"
     */
    boundary?: TriggerBoundary;
    /**
     * Whether the query may contain spaces, or up to how many words, like `@next Wednesday`.
     * @defaultValue false
     */
    spaces?: boolean | number;
    /**
     * Characters a query may contain, tested one at a time.
     * @defaultValue /[\p{L}\p{N}\p{M}_\-.]/u
     */
    pattern?: RegExp;
    /**
     * The longest query before the match ends.
     * @defaultValue 50
     */
    maxLength?: number;
};
/**
 * A trigger and the text after it, up to the caret.
 * @stable
 */
type TriggerMatch = {
    /** The trigger's text, like `"@"`. */
    trigger: string;
    /** Where the trigger starts. */
    start: number;
    /** The caret: where the query ends. */
    end: number;
    /** The text between the trigger and the caret. */
    query: string;
};
/** A match a user dismissed with Escape, which edits move along. */
type DismissedMatch = TextRange & {
    trigger: string;
};
declare function normalizeTriggerText(text: string): string;
declare function isValidQuery(query: string, rule: TriggerRule): boolean;
declare function isAtBoundary(text: string, index: number, offset: number, boundary: TriggerBoundary): boolean;
declare function lookBehind(rules: readonly TriggerRule[]): number;
/**
 * The trigger match that ends at the caret, if any. `text` is what comes before
 * the caret and `offset` where it starts. Scans back from the caret, so the
 * nearest trigger wins, and stops at the first character no query may contain.
 */
declare function findTriggerMatch(text: string, offset: number, rules: readonly TriggerRule[]): {
    rule: number;
    match: {
        trigger: string;
        start: number;
        end: number;
        query: string;
    };
} | null;
/**
 * Moves a dismissed match along with an edit that replaced `range` with
 * `inserted` characters. Edits before it shift it, edits inside or at its end
 * grow or shrink it, and an edit that touches the trigger itself clears it:
 * the trigger was deleted or retyped. Caret moves and other edits leave it.
 */
declare function mapDismissed(dismissed: DismissedMatch, range: TextRange, inserted: number): DismissedMatch | null;
export { type DismissedMatch, findTriggerMatch, isAtBoundary, isValidQuery, lookBehind, mapDismissed, normalizeTriggerText, type TriggerBoundary, type TriggerMatch, type TriggerRule, };
