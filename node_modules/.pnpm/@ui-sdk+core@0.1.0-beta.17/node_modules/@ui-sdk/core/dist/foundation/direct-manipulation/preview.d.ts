import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * Why the preview changed.
 * @experimental
 */
type PreviewReason = "item-hover" | "list-navigation" | "escape-key" | "focus-out" | "item-press" | "imperative";
/**
 * How `createPreview` keeps the preview and chooses.
 * @experimental
 */
type PreviewOptions<State extends object> = {
    /** The state key that holds the previewed option's key, or `null`. */
    key: keyof State & string;
    /** The slot whose parts are the options. */
    slot: string;
    /** Asks for a new preview. Defaults to setting the state key; pass the primitive's change to fire `onPreviewChange`. */
    set?: (value: string | null, details: {
        reason: PreviewReason;
        event?: Event;
    }) => boolean;
    /** Chooses an option. Pass the primitive's change for its value. */
    choose: (key: string, details: {
        reason: "item-press";
        event?: Event;
    }) => boolean;
    /** The chosen option now, which previews as nothing. */
    value?: () => string | null;
    /** Whether an option can't be previewed or chosen. */
    disabled?: (key: string) => boolean;
    /** An option's name for screen readers. Defaults to its key. */
    label?: (key: string) => string;
    /** What screen readers hear when the keyboard previews one. Defaults to English. */
    message?: (label: string) => string;
};
/**
 * Lets users preview a slot's parts before choosing one. Call it once in
 * `api` and keep it on the api; wire the option slot:
 *
 * ```ts
 * option: slot<{ value: string }>({
 *   attrs: (state, { key }) => ({ "data-previewing": state.preview === key ? "" : undefined }),
 *   on: {
 *     pointerdown: (event, { el, api, key }) => api.preview.pointerdown(event, key, el!.parentElement!),
 *     keydown: (event, { el, api, key }) => api.preview.keydown(event, key) || api.roving.keydown(event, el!),
 *   },
 * }),
 * ```
 *
 * Call `show(key)` as roving focus moves for arrow previews, and
 * `clear({ reason: "focus-out" })` when focus leaves the group.
 * @experimental
 */
declare function createPreview<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy" | "parts">, options: PreviewOptions<State>): {
    /** Shows an option without choosing it. The chosen option and disabled ones show as nothing. */
    show(key: string | null, details?: {
        reason: PreviewReason;
        event?: Event;
    }): boolean;
    /** Puts the page back. */
    clear(details?: {
        reason: PreviewReason;
        event?: Event;
    }): boolean;
    /** Chooses the previewed option, or `key`, and ends the preview. */
    choose(key?: string, details?: {
        event?: Event;
    }): boolean;
    /** Whether a pointer is pressed and sliding across the options. */
    dragging: () => boolean;
    /** Starts a press and slide from an option: each option the pointer slides over previews, letting go on one chooses it. */
    pointerdown(event: PointerEvent, key: string, surface: HTMLElement): void;
    /** Enter or Space keeps the preview, or chooses `key`; Escape puts the page back. Returns whether it handled the key. */
    keydown(event: KeyboardEvent, key: string): boolean;
};
export { createPreview, type PreviewOptions, type PreviewReason };
