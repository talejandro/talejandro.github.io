declare function setStyle(el: HTMLElement, name: string, value: string): () => void;
declare function registerUninherited(names: readonly string[]): void;
/**
 * Writes `css` as the document's style named `id`, or replaces its text.
 * Every ui-sdk style goes first in the page, so `@layer ui-sdk` is declared
 * before the page's own layers and loses to them. A Content Security Policy
 * without 'unsafe-inline' blocks a `<style>` element without its nonce, so
 * it takes the one the page's `<meta property="csp-nonce">` gives. When the
 * tag has no nonce, the style is a constructed sheet instead, which no policy
 * blocks. Adopted sheets come after the page's own styles, adopted ones
 * included, so there `@layer ui-sdk` is declared after the page's layers,
 * unless its CSS declares it first.
 */
declare function writeStyle(doc: Document, id: string, css: string): void;
declare function enforceHidden(doc: Document): void;
/**
 * Runs work that restyles the whole page, like writing a stylesheet or
 * registering a property, ahead of the interaction that needs it. Done on
 * open, it delays a popup's first frame on a large page. Before the first
 * paint nothing is styled yet, so it runs at once: a page of 200 web
 * component dialogs went idle only after a key press could come. After it,
 * it runs once the page is idle, with the other work queued by then, so they
 * cost one restyle.
 */
declare function ahead(work: () => void): void;
/**
 * Runs work that restyles the whole page once the current frame has painted,
 * so what the interaction shows comes first. Returns a cancel.
 */
declare function afterPaint(work: () => void): () => void;
export { afterPaint, ahead, enforceHidden, registerUninherited, setStyle, writeStyle, };
