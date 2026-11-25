import type { Part, PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { ResizableOptions } from "./resizable.js";
import type { State } from "./resizable-api.js";
import type { PanelSizes } from "./resizable-layout.js";
type Group = {
    setPanels: (ids: string[], sizes: PanelSizes[], space: number) => void;
    setHandles: (handles: Record<string, number>) => void;
    relock: () => void;
    setSpace: (space: number) => void;
    handleIndex: (key: string) => number | null;
    handleDisabled: (key: string) => boolean;
    vertical: () => boolean;
    startDrag: (handle: number, key: string) => boolean;
    dragBy: (delta: number, event?: PointerEvent) => void;
    endDrag: (event?: PointerEvent, restore?: boolean) => void;
    handleValue: (key: string) => {
        now: number;
        min: number;
        max: number;
    } | null;
};
declare function resizableDom(context: PrimitiveContext<ResizableOptions, State, string>, group: () => Group): {
    refresh: () => void;
    bindings: {
        bindRoot(el: HTMLElement): (() => void) | undefined;
        bindPanel(part: Part): () => void;
        bindHandle(el: HTMLElement, part: Part): () => void;
    };
    stopAll: () => void;
};
export { resizableDom };
