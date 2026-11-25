import type { EditorChange, TextRange } from "./text-editor.js";
type TextField = HTMLInputElement | HTMLTextAreaElement;
declare function createCaretRects(field: TextField): (offset: number) => {
    x: number;
    y: number;
    width: number;
    height: number;
} | null;
declare function textDiff(before: string, after: string): {
    range: {
        start: number;
        end: number;
    };
    inserted: string;
};
declare function insertText(field: TextField, range: TextRange, text: string): void;
/**
 * The editor adapter for an `<input>` or a `<textarea>`. TriggerMenuInput
 * builds it; use it for a field you render yourself.
 * @stable
 */
declare function textFieldAdapter(field: TextField): {
    element: TextField;
    textBefore(length: number): {
        text: string;
        offset: number;
    } | null;
    selection: () => {
        start: number;
        end: number;
    } | null;
    rectAt: (offset: number) => {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    replace(range: TextRange, content: string | import("./text-editor.js").Token): void;
    subscribe(listener: (change: EditorChange) => void): () => void;
    composing: () => boolean;
    submit: () => void | undefined;
};
export { createCaretRects, insertText, textDiff, textFieldAdapter };
