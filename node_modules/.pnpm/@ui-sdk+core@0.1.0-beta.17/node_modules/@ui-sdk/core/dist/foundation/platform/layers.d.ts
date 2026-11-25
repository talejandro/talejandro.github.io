type Layer = {
    contains: (target: Node, event?: Event) => boolean;
    parent?: Layer;
    active: () => boolean;
    exiting?: () => boolean;
    overBackdrop?: (x: number, y: number) => boolean;
    modal: boolean | "pointer";
    outsidePress?: "pointerdown" | "click";
    shield?: boolean;
    keep?: (el: HTMLElement) => () => void;
    returnTarget?: (take?: (target: HTMLElement) => boolean, strict?: boolean) => HTMLElement | undefined;
    onEscape?: (event: KeyboardEvent) => void;
    onOutsidePress?: (event: Event) => void;
    onBlur?: (event: FocusEvent) => void;
    blocking?: boolean;
    order?: number;
    component?: string;
    id?: string;
    el?: Element;
};
/**
 * Keeps an element live over every layer, like a toast region over a modal
 * dialog: modal layers don't make it inert, whether they opened before or
 * after, and presses in it never dismiss a layer. A persistent element shown
 * in the top layer goes back above any popup that opens later. Returns a
 * function that undoes it.
 * @stable
 */
declare function bindPersistentLayer(el: Element): () => void;
declare function inPersistentLayer(target: Node): boolean;
declare function persistentLayers(): Element[];
declare function layerCount(): number;
declare function openedSince(order: number): boolean;
declare function activeLayers(): Layer[];
declare function lastEscape(): number;
declare function layerContains(layer: Layer, target: Node): boolean;
declare function findLayer(target: Node): Layer | undefined;
declare function markClosed(target: HTMLElement | undefined): void;
declare function lastClosed(): HTMLElement | undefined;
declare function escapeLayer(layer: Layer, event: KeyboardEvent): void;
declare function pushLayer(layer: Layer): () => void;
export { activeLayers, bindPersistentLayer, escapeLayer, findLayer, inPersistentLayer, lastClosed, lastEscape, type Layer, layerContains, layerCount, markClosed, openedSince, persistentLayers, pushLayer, };
