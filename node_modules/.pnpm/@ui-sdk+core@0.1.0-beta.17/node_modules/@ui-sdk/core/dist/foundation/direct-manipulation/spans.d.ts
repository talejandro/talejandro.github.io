import type { PrimitiveContext } from "../kernel/primitive-types.js";
import { type AutoScrollOptions } from "../drag-and-drop/auto-scroll.js";
/**
 * A range on a track, from `start` to `end` in the track's own units, like minutes from midnight.
 * @experimental
 */
type Span = {
    id: string;
    track: string;
    start: number;
    end: number;
};
/**
 * What changed a span: drawn, moved, resized or deleted.
 * @experimental
 */
type SpanAction = "draw" | "move" | "resize" | "delete";
/**
 * Why the spans changed: a pointer drag, an arrow key that moved or resized a
 * span, Delete or Backspace, or a call from code.
 * @experimental
 */
type SpansReason = "drag" | "move-key" | "remove-press" | "imperative";
/**
 * The spans as they show while a pointer drags, kept in state under `SpansOptions.draft`.
 * @experimental
 */
type SpansDraft<S extends Span = Span> = {
    /** The span being drawn, moved or resized. */
    id: string;
    action: SpanAction;
    /** Every span as it shows now. */
    spans: S[];
};
/**
 * What happened, for the message screen readers hear.
 * @experimental
 */
type SpansMessage<S extends Span = Span> = {
    /** `cancel` when a drag put the span back. */
    type: SpanAction | "cancel";
    span: S;
    /** What the span is, from `label`. */
    label: string;
};
/**
 * How `createSpans` reads, renders and changes the spans.
 * @experimental
 */
type SpansOptions<State extends object, S extends Span = Span> = {
    /** The state key that holds the spans, an array of `Span`. */
    key: keyof State & string;
    /** The state key that holds the `SpansDraft` while a pointer drags. Start it at `null`. */
    draft: keyof State & string;
    /**
     * Asks for the new spans and returns whether they went through. Pass the
     * primitive's change: `set: (value, details) => change("spans", value, details)`.
     */
    set: (value: S[], details: {
        reason: SpansReason;
        event?: Event;
        id: string;
        action: SpanAction;
    }) => boolean;
    /** Where tracks start, in their units. @defaultValue 0 */
    min?: () => number;
    /** Where tracks end. @defaultValue 100 */
    max?: () => number;
    /** What every start and end snaps to, and what arrows move by. @defaultValue 1 */
    step?: () => number;
    /** The shortest a span can be. @defaultValue the step */
    minSize?: () => number;
    /** The longest a span can be. */
    maxSize?: () => number;
    /** The direction tracks run: `y` down, like a calendar's days, or `x` across, like a Gantt chart's rows. @defaultValue "y" */
    axis?: "x" | "y";
    /** The tracks in the order the arrows across them go through. Defaults to the bound tracks in document order. */
    tracks?: () => string[];
    /** Whether spans on one track can overlap. When they can't, a drag stops where it would. @defaultValue true */
    overlap?: boolean;
    /**
     * Makes the span a press on a track starts to draw, with a new `id` and
     * anything else it needs, like a title, or returns `null` to not draw. Runs
     * on every press on an empty stretch of track. Without it, nothing is drawn.
     */
    create?: (span: Span) => S | null;
    /** How long a span a click on an empty track makes. Without it, a click makes none. */
    size?: () => number | undefined;
    /** Whether a span can't change. */
    disabled?: (span: S) => boolean;
    /** What screen readers call a span, like `"Standup, Tuesday 9:00 to 9:30"`. Defaults to its track and range. */
    label?: (span: S) => string;
    /** The text screen readers hear for each change. Defaults to English. */
    message?: (message: SpansMessage<S>) => string;
    /** How a drag near a scroller's edge scrolls it, or `false` not to. */
    createAutoScroll?: Omit<AutoScrollOptions, "onScroll" | "ignore"> | false;
};
/**
 * The English messages `createSpans` announces unless you pass `message`.
 * @experimental
 */
declare function spansMessage({ type, label }: SpansMessage): string;
/**
 * Where each span sits beside the spans it overlaps on its track: lane
 * `lane` of `lanes`, so overlapping events share their day's width. Spans
 * that only touch don't overlap.
 * @experimental
 */
declare function stackSpans(spans: readonly Span[]): Map<string, {
    lane: number;
    lanes: number;
}>;
/**
 * Whether `span` overlaps no other span on its track.
 * @experimental
 */
declare function isSpanFree(spans: readonly Span[], span: Span): boolean;
/**
 * Lets users draw, move and resize spans on tracks, by dragging and with the
 * keyboard. Call it once in `api`, keep it on the api, render each track's
 * spans from `spans(state)`, and wire both slots:
 *
 * ```ts
 * track: slot<{ value: string }>({
 *   bind: (el, { api, key }) => api.spans.bindTrack(el, key),
 *   on: { pointerdown: (event, { api, key }) => api.spans.trackPointerdown(event, key) },
 * }),
 * span: slot<{ value: string }>({
 *   attrs: (state, { api, key }) => api.spans.spanAttrs(state, key),
 *   bind: (el, { api, key }) => api.spans.bindSpan(el, key),
 *   on: {
 *     pointerdown: (event, { api, key }) => api.spans.spanPointerdown(event, key),
 *     keydown: (event, { api, key }) => api.spans.keydown(event, key),
 *   },
 * })
 * ```
 *
 * Put an element with `data-span-edge="start"` or `"end"` inside a span for
 * each edge it resizes from. A track's element runs the whole range, from
 * `min` to `max`, and spans sit in it at `spanStyle`.
 * @experimental
 */
declare function createSpans<State extends object, S extends Span = Span>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: SpansOptions<State, S>): {
    /** Joins a track's element, so drags find it. Return its cleanup from the track slot's `bind`. */
    bindTrack(el: HTMLElement, track: string): () => void;
    /** Joins a span's element. Return its cleanup from the span slot's `bind`. */
    bindSpan(el: HTMLElement, id: string): () => void;
    /** The spans to render: the draft's while a pointer drags, else the value. Pure, so `state` and `attrs` can call it. */
    spans(state: State): S[];
    /** One track's spans, from `spans(state)`. */
    spansOn(state: State, track: string): S[];
    /** What a pointer is doing to a span, if anything. */
    action(state: State, id: string): SpanAction | undefined;
    /**
     * A span's place in its track, as a `style` attribute: its start and
     * length in percentages along the axis, and its lane across it from
     * `stackSpans`, if passed. Also `--span-start` and `--span-size`, from 0 to 1.
     */
    spanStyle(span: Span, lane?: {
        lane: number;
        lanes: number;
    }): string;
    /** A span's attributes: `data-span-id` for drags to find it, and `data-dragging`, `data-resizing` or `data-drawing` while a pointer does. */
    spanAttrs(state: State, id: string): {
        "data-span-id": string;
        "data-dragging": string | undefined;
        "data-resizing": string | undefined;
        "data-drawing": string | undefined;
    };
    /** The value under a point on a track, snapped. For a hover line or a "new event at" menu. */
    valueAt: (track: string, x: number, y: number) => number;
    /**
     * Draws a span from where a track was pressed, once the pointer moves a
     * few pixels; a click makes one `size` long, if `size` is set. Presses
     * on a span are left to `spanPointerdown`.
     */
    trackPointerdown(event: PointerEvent, track: string): void;
    /**
     * Moves a span, or resizes it from an edge marked `data-span-edge`, once
     * the pointer moves a few pixels, so a click stays a click.
     */
    spanPointerdown(event: PointerEvent, id: string): void;
    /**
     * Handles a key on a span and returns whether it did. Arrows along the
     * axis move it a step, with Shift they move its end; arrows across move
     * it to the next track; Delete and Backspace delete it. Each change
     * commits, and screen readers hear the span's new place.
     */
    keydown(event: KeyboardEvent, id: string): boolean;
    /** Changes a span at once, like from a form. Returns whether it went through. */
    update(id: string, patch: Partial<Omit<S, "id">>): boolean;
    /** Deletes a span. Returns whether it went through. */
    remove(id: string): boolean;
    /** Ends a pointer drag and puts its span back. */
    cancel(): void;
};
/**
 * What `createSpans` returns.
 * @experimental
 */
type Spans = ReturnType<typeof createSpans>;
export { createSpans, type Span, type SpanAction, isSpanFree, type Spans, type SpansDraft, spansMessage, type SpansMessage, type SpansOptions, type SpansReason, stackSpans, };
