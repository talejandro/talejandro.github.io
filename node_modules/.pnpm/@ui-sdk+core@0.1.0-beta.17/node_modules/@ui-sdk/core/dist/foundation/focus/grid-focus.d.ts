import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * A cell, by its row and column index from 0.
 * @experimental
 */
type GridCell = {
    row: number;
    col: number;
};
/**
 * Why the active cell moved: a key, a press on a cell, or a call from code.
 * @experimental
 */
type GridFocusReason = "list-navigation" | "item-press" | "imperative";
/**
 * How `createGridFocus` reads the grid.
 * @experimental
 */
type GridFocusOptions<State extends object> = {
    /** The state key that holds the active `GridCell`, or `null` before the grid is entered. */
    key: keyof State & string;
    /** How many rows the grid has, header rows included when they hold cells. */
    rows: () => number;
    /** How many columns. */
    cols: () => number;
    /** How many rows Page Up and Page Down move, usually how many show. @defaultValue 10 */
    pageSize?: () => number;
    /** Cells that can't take focus, skipped by the arrows and by the tab stop before the grid is entered. */
    disabled?: (cell: GridCell) => boolean;
    /**
     * Shows a cell that may not be rendered, like `virtualizer.scrollToIndex(cell.row)`,
     * before focus moves to it.
     */
    reveal?: (cell: GridCell) => void;
    /** Runs after the active cell moves, with the cell it left. */
    onMove?: (cell: GridCell, details: {
        from: GridCell | null;
        reason: GridFocusReason;
        event?: Event;
        shift: boolean;
    }) => void;
};
/**
 * How a cell slot reads the active cell, for its `selects`, so a move reaches
 * the cell it leaves and the one it lands on, not every cell:
 * `selects({ active: byCell })`. The slot's props are the cell's `row` and `col`.
 * @experimental
 */
declare const byCell: {
    values: ({ props }: {
        props: GridCell;
    }) => string[];
    moved(previous: GridCell | null | undefined, next: GridCell | null | undefined, notify: (name: string) => void): true | undefined;
};
/**
 * Gives a grid one tab stop and moves it by row and column. Call it once in
 * `api`, keep it on the api, and wire the cell slot:
 *
 * ```ts
 * grid: slot({ role: "grid", keys: { none: "Focus stays on a cell, whose keydown handles them." } }),
 * cell: slot<{ id: string; row: number; col: number }>({
 *   props: { id: "string", row: "number", col: "number" },
 *   role: "gridcell",
 *   focus: "roving",
 *   selects: selects({ active: byCell }),
 *   keys: [
 *     "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
 *     "Home", "End", "mod+Home", "mod+End", "PageUp", "PageDown",
 *   ],
 *   attrs: (state, { props, api }) => ({ tabindex: api.grid.tabIndex(state, props) }),
 *   on: {
 *     keydown: (event, { api }) => api.grid.keydown(event),
 *     pointerdown: (event, { api, props }) => api.grid.focus(props, { reason: "item-press", event }),
 *   },
 *   bind: (el, { api, props }) => api.grid.bind(el, props),
 * })
 * ```
 *
 * Render each cell with a stable `id`, like `"1:2"`, so the primitive can tell
 * the cells apart. Shift with a move is reported in `onMove`, so a grid can
 * extend a range selection from it.
 * @experimental
 */
declare function createGridFocus<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "options" | "parts">, options: GridFocusOptions<State>): {
    /** The active cell, which has the tab stop. */
    active: () => GridCell | null;
    /**
     * `"0"` for the active cell, else `"-1"`, for a `tabindex` attribute. Before
     * the grid is entered, the first cell that isn't disabled has it, row by row.
     */
    tabIndex(state: State, cell: GridCell): "0" | "-1";
    /** Whether a cell is the active one. */
    isActive(state: State, cell: GridCell): boolean;
    /** Where a joined cell's element is now, like the one under a dragging pointer. */
    placeOf: (el: Element) => GridCell | undefined;
    /** Joins a rendered cell, so focus can reach it. Return its cleanup from the slot's `bind`. */
    bind(el: HTMLElement, cell: GridCell): () => void;
    /** Makes a cell active and focuses it, scrolling it in through `reveal` first. */
    focus(cell: GridCell, details?: {
        reason: GridFocusReason;
        event?: Event;
        shift?: boolean;
    }): boolean;
    /**
     * Handles a key pressed in the grid and returns whether it moved. Arrows
     * move a cell, flipped left to right in right-to-left text; Home and End
     * go to the row's ends, or with Control (Command on a Mac) the grid's;
     * Page Up and Page Down move `pageSize` rows.
     */
    keydown(event: KeyboardEvent): boolean;
};
/**
 * What `createGridFocus` returns.
 * @experimental
 */
type GridFocus = ReturnType<typeof createGridFocus>;
export { byCell, createGridFocus, type GridCell, type GridFocus, type GridFocusOptions, type GridFocusReason, };
