import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * Why an edit started or ended.
 * @experimental
 */
type InlineEditReason = "edit-key" | "type" | "double-click" | "enter-key" | "escape-key" | "focus-out" | "tab-key" | "imperative";
/**
 * How `createInlineEdit` reads and saves values.
 * @experimental
 */
type InlineEditOptions<State extends object> = {
    /** The state key that holds the id being edited, or `null`. */
    key: keyof State & string;
    /** The text an id shows now, put in the input when editing starts. */
    value: (id: string) => string;
    /**
     * Saves the text and returns whether it went through. Return `false` to
     * keep editing, like when the text isn't valid.
     */
    commit: (id: string, text: string, details: {
        reason: InlineEditReason;
        event?: Event;
    }) => boolean;
    /** Whether an id can't be edited. */
    disabled?: (id: string) => boolean;
};
/**
 * Lets users edit a value in place. Call it once in `api`, keep it on the
 * api, render an input for the id `editing(state)` returns, and wire it:
 *
 * ```ts
 * cell: slot({ on: { keydown: (event, { api, key }) => api.edit.keydown(event, key) } }),
 * input: slot({
 *   on: { keydown: (event, { api }) => api.edit.inputKeydown(event), focusout: (event, { api }) => api.edit.end("focus-out", event) },
 *   bind: (el, { api }) => api.edit.bindInput(el as HTMLInputElement),
 * })
 * ```
 *
 * Tab saves too and returns `true`, with focus back where editing started,
 * so a grid can move on to the next cell, as a spreadsheet does.
 * @experimental
 */
declare function createInlineEdit<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store">, options: InlineEditOptions<State>): {
    /** The id being edited, or `null`. */
    editing(state: State): string | null;
    /** Starts editing an id. With `text`, the input starts with it instead of the value, as typing does. */
    start(id: string, details?: {
        reason: InlineEditReason;
        event?: Event;
        text?: string;
    }): boolean;
    /**
     * Handles a key pressed where the value shows and returns whether it
     * started editing: Enter or F2 with the text, a printable character
     * with that character.
     */
    keydown(event: KeyboardEvent, id: string): boolean;
    /** Starts editing on a double click, as most tables do. */
    dblclick(event: MouseEvent, id: string): boolean;
    /** Fills and focuses the input once it renders. Return its cleanup from the input slot's `bind`. */
    bindInput(el: HTMLInputElement | HTMLTextAreaElement): () => void;
    /** Handles a key in the input: Enter and Tab save, Escape puts the text back. Returns whether it handled the key. */
    inputKeydown(event: KeyboardEvent): boolean;
    /** Saves what the input holds and stops editing. Returns whether it saved. */
    end(reason?: InlineEditReason, event?: Event): boolean;
    /** Stops editing without saving. */
    cancel(): void;
};
/**
 * What `createInlineEdit` returns.
 * @experimental
 */
type InlineEdit = ReturnType<typeof createInlineEdit>;
export { createInlineEdit, type InlineEdit, type InlineEditOptions, type InlineEditReason, };
