/** Marks a popup's content element. Returns a function that undoes it. */
declare function registerPopupElement(el: Element): () => void;
declare function inPopupElement(target: Node): boolean;
declare function ownsEvent(el: Element, event: Event, same?: string): boolean;
export { inPopupElement, ownsEvent, registerPopupElement };
