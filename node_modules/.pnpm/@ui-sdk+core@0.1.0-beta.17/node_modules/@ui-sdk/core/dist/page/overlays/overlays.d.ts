/**
 * One overlay a host renders.
 * @stable
 */
type OverlayEntry = {
    /** Unique within its registry. */
    id: string;
    /** What kind of overlay it is, which picks the component that renders it: `"toaster"` or `"confirm"`. */
    type: string;
    /** What the renderer needs, like the toaster whose region it shows. */
    data: unknown;
};
/**
 * Creates a registry of overlays. Most apps use the shared `overlays`, which
 * `toast()` and `confirm()` open into; a separate one is for a separate host,
 * like one inside an iframe.
 * @stable
 */
declare function createOverlays(): {
    /**
     * Adds an overlay for the hosts to render. Returns its id; pass it to
     * `unmount()` once the overlay has finished closing. `rendered` says
     * whether something else already shows it, like a region the app placed,
     * so development builds don't warn about a missing host.
     */
    mount(type: string, data: unknown, rendered?: () => boolean): string;
    /** Removes an overlay. */
    unmount: (id: string) => void;
    /** The overlays to render, oldest first. The same array until something changes. */
    entries: () => readonly OverlayEntry[];
    /** Calls `listener` whenever an overlay is added or removed. Returns a function that stops it. */
    subscribe(listener: () => void): () => void;
    /** Counts a host that renders this registry. Hosts call it while mounted. Returns a release. */
    attachHost(): () => void;
    /** Whether a host is mounted to render the overlays. */
    hasHost: () => boolean;
};
/**
 * A registry of overlays, from `createOverlays()`.
 * @stable
 */
type Overlays = ReturnType<typeof createOverlays>;
/**
 * The shared registry that `toast()` and `confirm()` open into, and that
 * `<OverlayHost />` renders by default. One per realm, even when two copies of
 * the package load on one page.
 * @stable
 */
declare const overlays: Overlays;
export { createOverlays, type OverlayEntry, overlays, type Overlays };
