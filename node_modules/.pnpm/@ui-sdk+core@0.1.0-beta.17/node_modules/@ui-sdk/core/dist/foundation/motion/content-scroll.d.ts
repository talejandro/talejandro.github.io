import { type SheetConfig, type SheetEffect, type SheetEvent, type SheetState } from "./machine.js";
type Move = Extract<SheetEvent, {
    type: "move";
}>;
type Dragging = Extract<SheetState, {
    phase: "dragging";
}>;
declare const contentScroll: {
    claim(state: Extract<SheetState, {
        phase: "pending";
    }>, event: Move, towardMore: boolean, config: SheetConfig): {
        phase: "scrolling";
        extent: number;
        restingIndex: number;
        lastY: number;
    } | undefined;
    move(state: Extract<SheetState, {
        phase: "scrolling";
    }>, event: Move): {
        state: {
            phase: "dragging";
            extent: number;
            restingIndex: number;
            anchorY: number;
            anchorExtent: number;
            lastY: number;
            isScrollingContent: boolean;
        };
        effects: SheetEffect[];
    } | {
        state: {
            lastY: number;
            phase: "scrolling";
            extent: number;
            restingIndex: number;
        };
        effects: SheetEffect[];
    };
    drag(state: Dragging, event: Move, delta: number, fingerExtent: number, config: SheetConfig): {
        state: {
            lastY: number;
            phase: "dragging";
            extent: number;
            restingIndex: number;
            anchorY: number;
            anchorExtent: number;
            isScrollingContent: boolean;
        };
        effects: SheetEffect[];
    } | undefined;
    release(state: Dragging, event: Extract<SheetEvent, {
        type: "up";
    }>, config: SheetConfig): {
        state: {
            phase: "idle";
            extent: number;
            restingIndex: number;
        };
        effects: SheetEffect[];
    } | undefined;
};
type ContentScroll = typeof contentScroll;
export { contentScroll, type ContentScroll };
