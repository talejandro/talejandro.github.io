/**
 * Adds a listener and returns what removes it.
 */
declare function on<Type extends keyof HTMLElementEventMap>(target: HTMLElement | Document | Window, type: Type, listener: (event: HTMLElementEventMap[Type]) => void, options?: AddEventListenerOptions): () => void;
declare const selectEvent: () => Event;
/**
 * Whether an event belongs to an input method composing text, like Enter
 * choosing one of its candidates or an `input` event for a half-typed word, so
 * a handler leaves it alone. Safari ends a composition with `isComposing`
 * false, so key code 229 counts too. Takes a key or input event, from the DOM or React.
 * @experimental
 */
declare function isComposing(event: {
    isComposing?: boolean;
    keyCode?: number;
} | {
    nativeEvent: Event | {
        isComposing?: boolean;
        keyCode?: number;
    };
}): boolean;
export { isComposing, on, selectEvent };
