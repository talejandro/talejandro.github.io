/**
 * Where layouts are saved: `localStorage` by default. Anything with the same
 * two methods works, like `sessionStorage` or a cookie, which a server can
 * read to render the saved sizes on the first paint.
 * @stable
 */
type ResizableStorage = {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
};
/**
 * The key a group saves under, from its `autoSaveId`.
 * @stable
 */
declare const storageKey: (autoSaveId: string) => string;
/** The layout saved for these panels, if there is one that fits them. */
declare function loadLayout(autoSaveId: string, ids: readonly string[], storage?: ResizableStorage | undefined): number[] | undefined;
declare function saveLayout(autoSaveId: string, ids: readonly string[], layout: readonly number[], storage?: ResizableStorage | undefined): void;
export { loadLayout, type ResizableStorage, saveLayout, storageKey };
