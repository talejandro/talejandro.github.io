import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * The connection being drawn: where it starts, the port it would land on, and its loose end in your units.
 * @experimental
 */
type ConnectDraft = {
    from: string;
    to: string | null;
    x: number;
    y: number;
    keyboard: boolean;
};
/**
 * Why a connection was made: a pointer let go on a port, or a key.
 * @experimental
 */
type ConnectReason = "drag" | "connect-key";
/**
 * What screen readers hear, by step.
 * @experimental
 */
type ConnectMessage = {
    type: "start";
    from: string;
} | {
    type: "target";
    from: string;
    to: string;
} | {
    type: "connect";
    from: string;
    to: string;
} | {
    type: "cancel";
    from: string;
};
/**
 * How `createConnect` finds ports and makes connections.
 * @experimental
 */
type ConnectOptions<State extends object> = {
    /** The slot whose parts are ports. */
    slot: string;
    /** The state key that holds the `ConnectDraft` while one is drawn. Start it at `null`, and list it in `live`. */
    draft: keyof State & string;
    /** Makes the connection and returns whether it went through. */
    connect: (from: string, to: string, details: {
        reason: ConnectReason;
        event?: Event;
    }) => boolean;
    /** Whether `from` can connect to `to`. Defaults to any other port. */
    canConnect?: (from: string, to: string) => boolean;
    /** Turns a point on screen into your units, like a canvas viewport's `toCanvas`. Defaults to client pixels. */
    point?: (clientX: number, clientY: number) => {
        x: number;
        y: number;
    };
    /** How near, in screen pixels, a pointer must come to a port to snap to it. @defaultValue 28 */
    radius?: () => number;
    /** A port's name for screen readers. Defaults to its key. */
    label?: (key: string) => string;
    /** What screen readers hear. Defaults to English. */
    message?: (message: ConnectMessage, label: (key: string) => string) => string;
};
/**
 * The English messages `createConnect` announces unless you pass `message`.
 * @experimental
 */
declare function connectMessage(message: ConnectMessage, label: (key: string) => string): string;
/**
 * Lets users connect a slot's parts, ports, by dragging from one to another
 * or with the keyboard. Call it once in `api` and keep it on the api:
 *
 * ```ts
 * port: slot<{ value: string }>({
 *   live: live((state, { api, key }) => ({ "data-connect": api.connect.role(state, key) })),
 *   on: { pointerdown: (event, { el, api, key }) => api.connect.pointerdown(event, key, el!) },
 * }),
 * ```
 *
 * `start(port)` begins from the keyboard; send keys to `keydown` while
 * `active()`. Draw the loose line from the `from` port to `{ x, y }` in the
 * draft. Port boxes are read when a connection starts, so dragging measures
 * nothing.
 * @experimental
 */
declare function createConnect<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy" | "parts">, options: ConnectOptions<State>): {
    /** Whether a connection is being drawn. */
    active(): boolean;
    /** Starts a connection from a port with the keyboard. Returns whether it started. */
    start(from: string): boolean;
    /** Points the connection at a port, or at none. */
    target(to: string | null): boolean;
    /** Makes the connection the draft points at, and ends it. */
    commit(details?: {
        reason: ConnectReason;
        event?: Event;
    }): boolean;
    /** Lets go of the connection without making it. */
    cancel(): void;
    /**
     * While connecting from the keyboard: arrows go to the nearest port that
     * can take it in their direction, Enter or Space connects, Escape and Tab
     * let go. Returns whether it handled the key.
     */
    keydown(event: KeyboardEvent): boolean;
    /** Drags a loose line out of a port; letting go near a port that can take it connects. */
    pointerdown(event: PointerEvent, from: string, el: HTMLElement): void;
    /** A port's part in the connection being drawn, for a data attribute: `source`, `target`, `candidate`, or `undefined`. */
    role(state: State, key: string): "source" | "target" | "candidate" | undefined;
};
export { type ConnectDraft, connectMessage, type ConnectMessage, type ConnectOptions, type ConnectReason, createConnect, };
