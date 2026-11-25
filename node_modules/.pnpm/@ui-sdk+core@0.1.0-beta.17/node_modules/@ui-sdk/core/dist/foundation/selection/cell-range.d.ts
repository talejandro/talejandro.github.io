import type { PrimitiveContext } from "../kernel/primitive-types.js";
import type { GridCell, GridFocus } from "../focus/grid-focus.js";
/**
 * A range from the cell it started at to the cell it reaches.
 * @experimental
 */
type CellRange = {
    anchor: GridCell;
    end: GridCell;
};
/**
 * A range's rows and columns, from 0 and inclusive.
 * @experimental
 */
type CellBounds = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};
/**
 * Why the range changed: a key, a press on a cell, a drag across cells, or a call from code.
 * @experimental
 */
type CellRangeReason = "list-navigation" | "item-press" | "drag" | "imperative";
/**
 * How `createCellRange` reads the grid.
 * @experimental
 */
type CellRangeOptions<State extends object> = {
    /** The state key that holds the `CellRange`, or `null` when only the active cell is selected. */
    key: keyof State & string;
    /** The grid's focus, which keeps the active cell. */
    grid: GridFocus;
    /** How many rows the range can reach. */
    rows: () => number;
    /** How many columns. */
    cols: () => number;
    /** Shows a cell the range grows to that may not be rendered, like `createGridFocus`'s `reveal`. */
    reveal?: (cell: GridCell) => void;
    /**
     * Asks for a new range and returns whether it went through. Defaults to
     * writing the state; pass the primitive's change to report it.
     */
    set?: (range: CellRange | null, details: {
        reason: CellRangeReason;
        event?: Event;
    }) => boolean;
    /** What screen readers hear after the range changes from the keyboard. Defaults to English. */
    message?: (bounds: CellBounds) => string;
};
/**
 * The English message `createCellRange` announces unless you pass `message`.
 * @experimental
 */
declare function cellRangeMessage({ top, left, bottom, right }: CellBounds): string;
/**
 * How a cell slot reads the range, for its `selects`, so a change reaches the
 * cells that join or leave it and the cells on the sides that move, not every cell:
 * `selects({ active: byCell, range: byCellRange })`.
 * @experimental
 */
declare const byCellRange: {
    values: ({ props }: {
        props: GridCell;
    }) => string[];
    moved(previous: CellRange | null | undefined, next: CellRange | null | undefined, notify: (name: string) => void): void;
};
/**
 * Text with tabs between cells and newlines between rows, quoted where a cell holds either.
 * @experimental
 */
declare function cellsToText(rows: string[][]): string;
/**
 * Reads tab-separated text, as spreadsheets copy it, into rows of cells.
 * @experimental
 */
declare function textToCells(text: string): string[][];
/**
 * Lets users select a rectangle of cells. Call it once in `api` after
 * `createGridFocus`, keep it on the api, and wire the cell slot through it
 * instead of the grid:
 *
 * ```ts
 * cell: slot<{ id: string; row: number; col: number }>({
 *   props: { id: "string", row: "number", col: "number" },
 *   role: "gridcell",
 *   focus: "roving",
 *   selects: selects({ active: byCell, range: byCellRange }),
 *   keys: [
 *     "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "mod+Home", "mod+End",
 *     "PageUp", "PageDown", "shift+ArrowUp", "shift+ArrowDown", "shift+ArrowLeft", "shift+ArrowRight",
 *     "shift+Home", "shift+End", "shift+ ", "mod+ ", "mod+a", "Escape",
 *   ],
 *   attrs: (state, { props, api }) => ({
 *     tabindex: api.grid.tabIndex(state, props),
 *     ...api.range.cellAttrs(state, props),
 *   }),
 *   on: {
 *     keydown: (event, { api }) => api.range.keydown(event),
 *     pointerdown: (event, { api, props }) => api.range.pointerdown(event, props),
 *   },
 *   bind: (el, { api, props }) => api.range.bind(el, props),
 * })
 * ```
 *
 * Render each cell with a stable `id`, like `"1:2"`, so the primitive can tell
 * the cells apart.
 * @experimental
 */
declare function createCellRange<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: CellRangeOptions<State>): {
    /** The selected rows and columns: the range, or the active cell alone, or `null` before the grid is entered. */
    bounds(state: State): {
        top: number;
        left: number;
        bottom: number;
        right: number;
    } | null;
    /** Whether a cell is in the range. */
    contains(state: State, cell: GridCell): boolean;
    /**
     * A cell's `aria-selected`, `data-selected`, and `data-range-edge`, the
     * range's sides it sits on, like `"top left"`, for drawing its outline
     * with `[data-range-edge~="top"]`.
     */
    cellAttrs(state: State, cell: GridCell): {
        "aria-selected": string;
        "data-selected"?: undefined;
        "data-range-edge"?: undefined;
    } | {
        "aria-selected": string;
        "data-selected": string;
        "data-range-edge": string | undefined;
    };
    /** Selects a range, or `null` for the active cell alone. */
    select(range: CellRange | null, details?: {
        reason: CellRangeReason;
        event?: Event;
    }): boolean;
    /** Selects every cell, keeping the active one. */
    selectAll(details?: {
        reason: CellRangeReason;
        event?: Event;
    }): boolean;
    /** Selects whole rows, from one to another. */
    selectRows(from: number, to?: number, details?: {
        reason: CellRangeReason;
        event?: Event;
    }): boolean;
    /** Selects whole columns, from one to another. */
    selectColumns(from: number, to?: number, details?: {
        reason: CellRangeReason;
        event?: Event;
    }): boolean;
    /** Joins a rendered cell, for focus and for finding it under a dragging pointer. Return its cleanup from `bind`. */
    bind(el: HTMLElement, cell: GridCell): () => void;
    /**
     * Handles a key pressed in the grid and returns whether it did anything.
     * Shift with an arrow grows the range a cell, with Control to the grid's
     * edge, and Shift with Home or End to the row's ends; Shift+Space takes
     * the rows, Control+Space the columns, Control+A every cell, and Escape
     * goes back to the active cell. Anything else moves the active cell
     * through the grid, which drops the range.
     */
    keydown(event: KeyboardEvent): boolean;
    /**
     * Starts a range on a press: the cell becomes active, and dragging paints
     * the range to the cell under the pointer, scrolling near the grid's
     * edges. Shift stretches the range from the active cell instead.
     */
    pointerdown(event: PointerEvent, cell: GridCell): void;
    /** The range's text, read cell by cell, with tabs between cells and newlines between rows. */
    text(state: State, read: (cell: GridCell) => string): string;
};
/**
 * What `createCellRange` returns.
 * @experimental
 */
type CellRangeSelection = ReturnType<typeof createCellRange>;
export { byCellRange, cellRangeMessage, cellsToText, createCellRange, textToCells, type CellBounds, type CellRange, type CellRangeOptions, type CellRangeReason, type CellRangeSelection, };
