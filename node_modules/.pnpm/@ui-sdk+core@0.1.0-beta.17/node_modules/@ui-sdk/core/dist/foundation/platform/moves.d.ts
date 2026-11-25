/**
 * The shadow roots `node` renders in, walking up through the slots it's
 * assigned to: a light DOM node slotted into a scroller inside a shadow root
 * moves with that scroller, though its own root is the document.
 */
declare function shadowRootsAround(node: Node): Node[];
/**
 * Wakes every open popup on what moves inside `shadowRoots`, until the
 * returned cleanup runs.
 */
declare function watchShadowRoots(shadowRoots: Node[]): () => void;
/**
 * Calls `wake` whenever the page might have moved something, until the
 * returned cleanup runs: changes outside `popup`, and `popup` resizing. Every
 * open popup shares one set of listeners.
 */
declare function watchMoves(wake: () => void, popup?: Element): () => void;
export { shadowRootsAround, watchMoves, watchShadowRoots };
