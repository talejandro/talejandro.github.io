import type { TextRange, Token } from "../../foundation/text/text-editor.js";
/**
 * A token input's value: text and tokens in order. Adjacent strings are merged and empty ones dropped.
 * @stable
 */
type TokenInputValue = (string | Token)[];
/**
 * How tokens become text and back, for the clipboard, forms and drafts.
 * @stable
 */
type TokenCodec = {
    /** The text a token is written as. */
    format: (token: Token) => string;
    /** Text back into a value, with tokens wherever their text appears. */
    parse: (text: string) => TokenInputValue;
    /** How plain text is written so `parse` reads it back as text. `next` is the token that follows it, if any. Defaults to the text as is. */
    escape?: (text: string, next: Token | undefined) => string;
};
declare const isToken: (segment: string | Token | undefined) => segment is Token;
/**
 * Merges adjacent strings, drops empty ones and gives tokens without one an id. Tokens that have an id keep their identity, except one repeating an earlier token's id, which gets a new one.
 */
declare function normalizeValue(value: readonly (string | Token)[]): TokenInputValue;
/** How many offsets a value spans. A token is one. */
declare function valueLength(value: TokenInputValue): number;
/** The value as text with every token as U+FFFC, so offsets line up. */
declare function offsetText(value: TokenInputValue): string;
/** The part of a value between two offsets. */
declare function sliceValue(value: TokenInputValue, start: number, end?: number): TokenInputValue;
/**
 * Replaces a range with `content`. Offsets never split a token, so an edit
 * that covers part of a token's range covers all of it: the range rule.
 */
declare function replaceRange(value: TokenInputValue, range: TextRange, content: TokenInputValue): TokenInputValue;
/** The token at an offset, if one starts there. */
declare function tokenAt(value: TokenInputValue, offset: number): Token | undefined;
/** Where a token starts, or -1. */
declare function offsetOfToken(value: TokenInputValue, id: string): number;
/** The tokens of a value. */
declare const tokensOf: (value: TokenInputValue) => Token[];
/** Tokens in `before` that `after` no longer has. */
declare function removedTokens(before: TokenInputValue, after: TokenInputValue): Token[];
/** Whether two values hold the same text and the same tokens. */
declare function sameValue(a: TokenInputValue, b: TokenInputValue): boolean;
/**
 * Where a word deletion from `offset` stops, going back or forward: past
 * spaces, then past the word. A token is a word of its own, so the deletion
 * stops at it, or removes just it when it's next.
 */
declare function wordBoundary(value: TokenInputValue, offset: number, direction: -1 | 1): number;
/** Where the line around `offset` starts or ends. */
declare function lineBoundary(value: TokenInputValue, offset: number, direction: -1 | 1): number;
/**
 * The codec TokenInput uses unless you pass your own: `[@label](type:value)`. A type is letters, digits, `_` and `-`; any other type is written but reads back as text.
 * @stable
 */
declare const defaultCodec: TokenCodec;
/**
 * A value as codec text, for the clipboard, a form or a draft.
 * @stable
 */
declare function toText(value: TokenInputValue, codec?: TokenCodec): string;
/**
 * A value as people read it: text with each token's label.
 * @stable
 */
declare function toLabel(value: TokenInputValue): string;
/**
 * Codec text back into a value. Text that isn't a well-formed token stays text.
 * @stable
 */
declare function fromText(text: string, codec?: TokenCodec): TokenInputValue;
export { defaultCodec, fromText, isToken, lineBoundary, normalizeValue, offsetOfToken, offsetText, removedTokens, replaceRange, sameValue, sliceValue, tokenAt, type TokenCodec, type TokenInputValue, tokensOf, toLabel, toText, valueLength, wordBoundary, };
