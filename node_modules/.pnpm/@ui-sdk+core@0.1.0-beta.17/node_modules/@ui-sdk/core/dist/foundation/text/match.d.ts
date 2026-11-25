/**
 * A matched part of a text, from `start` up to `end`, like `slice`.
 * @stable
 */
type MatchRange = {
    start: number;
    end: number;
};
/**
 * A piece of an item's text, and whether it matched what was typed.
 * @stable
 */
type MatchSegment = {
    text: string;
    match: boolean;
};
/**
 * Folds text for matching in one locale: `fold("Łódź")` is `"lodz"` in
 * English, while Swedish keeps `"ä"` apart from `"a"`. The result has the
 * text's length, so indexes into it are indexes into the text.
 */
declare function createFolder(locale?: string): {
    locale: string | undefined;
    fold: (text: string) => string;
};
/** Matches text in another locale than the user's, or in the user's again without one. */
declare function setMatchLocale(locale?: string): void;
/** Text folded for matching in the user's language: case and accents that don't count there are gone. */
declare const foldText: (text: string) => string;
declare function leadingSpaces(text: string): number;
declare const startsWord: (text: string, index: number) => boolean;
/**
 * The ranges of `text` that `query` matched, the way a filter matches:
 * `"contains"` the first place it appears, `"startsWith"` the start, and
 * `"fuzzy"` a whole match where there is one, else each letter in order.
 * Empty when nothing matched, like when only a keyword did.
 * @stable
 */
declare function matchRanges(text: string, query: string, mode: "contains" | "startsWith" | "fuzzy"): {
    start: number;
    end: number;
}[];
/**
 * Text split into the parts a query matched and the parts it didn't, in order.
 * @stable
 */
declare function matchSegments(text: string, ranges: MatchRange[]): {
    text: string;
    match: boolean;
}[];
export { createFolder, foldText, leadingSpaces, type MatchRange, matchRanges, type MatchSegment, matchSegments, setMatchLocale, startsWord, };
