import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { ResizableChangeOptions, ResizableOptions } from "./resizable.js";
import { type PanelConstraints, type PanelSizes, type ResizableSize } from "./resizable-layout.js";
type State = {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    formDisabled: boolean;
    step: number;
    largeStep: number;
    layout: number[];
    controlledLayout: number[] | undefined;
    ids: string[];
    constraints: PanelConstraints[];
    handles: Record<string, number>;
    hovering: string | null;
    dragging: string | null;
    sizes: Record<string, number>;
    handleValues: Record<string, HandleValue>;
};
type HandleValue = {
    panel: string;
    now: number;
    min: number;
    max: number;
    disabled: boolean;
};
declare function settings(options: ResizableOptions): {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    step: number;
    largeStep: number;
};
declare function resizableApiBody(context: PrimitiveContext<ResizableOptions, State, string>): {
    getLayout: () => number[];
    setLayout(layout: number[], { reason, event }?: ResizableChangeOptions): boolean;
    collapse: (panel: string | number, { reason, event }?: ResizableChangeOptions) => boolean;
    expand: (panel: string | number, { reason, event }?: ResizableChangeOptions) => boolean;
    resize(panel: string | number, size: ResizableSize, { reason, event }?: ResizableChangeOptions): boolean;
    isCollapsed(panel: string | number): boolean;
    internal: {
        bindRoot(el: HTMLElement): (() => void) | undefined;
        bindPanel(part: import("../../index.js").Part): () => void;
        bindHandle(el: HTMLElement, part: import("../../index.js").Part): () => void;
        setPanels: (ids: string[], panelSizes: PanelSizes[], measured?: number) => void;
        setSpace: (next: number) => void;
        setHandles(handles: Record<string, number>): void;
        relock: () => void;
        handleIndex: (key: string) => number | null;
        handleDisabled: (key: string) => boolean;
        vertical: () => boolean;
        startDrag(handle: number, key: string): boolean;
        dragBy(delta: number, event?: PointerEvent): void;
        endDrag(event?: PointerEvent, restore?: boolean): void;
        keydown(event: KeyboardEvent, key: string, el: HTMLElement): void;
        commitKeys(event?: KeyboardEvent): void;
        toggle(key: string, event?: KeyboardEvent | MouseEvent): void;
        handleValue: (key: string) => HandleValue;
    };
};
declare const resizableApi: (...args: Parameters<typeof resizableApiBody>) => ResizableApi;
/**
 * `resizable`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface ResizableApi extends ReturnType<typeof resizableApiBody> {
}
export { type ResizableApi, resizableApi, settings, type State };
