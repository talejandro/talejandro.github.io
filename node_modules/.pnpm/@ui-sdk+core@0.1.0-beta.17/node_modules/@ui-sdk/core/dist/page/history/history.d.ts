import type { createAgent } from "../agent/agent.js";
/**
 * One change in the history.
 * @experimental
 */
type HistoryEntry = {
    id: string;
    ref: string;
    label: string;
    key: string;
    value: unknown;
    /** The value before the change, which stepping back over it restores. */
    previous: unknown;
    /** Who made it: `agent`, or how a person did, like `pointer` or `keyboard`. */
    source: string;
    reason: string;
    /** Reverted by `undoSource`, and left out of the page's state. */
    reverted?: boolean;
    /**
     * A password, card or one-time-code field's change, or one inside
     * `data-agent-secret`, whose `value` and `previous` read `"[redacted]"`.
     * Seeking and undoing never put it back, and report it as not put back.
     */
    redacted?: boolean;
};
/**
 * What `createHistory` records.
 * @experimental
 */
type HistoryOptions = {
    /** Hears only components inside this element, like one panel. Defaults to the whole page. */
    within?: Element | (() => Element | null | undefined);
    /** Keys worth an entry. @defaultValue ["value", "checked", "pressed"] */
    keys?: string[];
    /**
     * Folds a drag, or a run of key presses, on one control into one entry.
     * False records every step, even of a drag that commits once. @defaultValue true
     */
    coalesce?: boolean;
};
/**
 * A change in words, like "Agent set Region to Frankfurt".
 * @experimental
 */
declare function describeEntry(entry: HistoryEntry): string;
/**
 * Starts recording changes, and returns the history. `entries()` and
 * `position()` read it, `subscribe` hears it change, `seek(n)` puts the page
 * back to how it was after `n` entries, and `destroy()` stops recording.
 * Pass an agent with its original `act` method so restoration checks run after permission resolves.
 *
 * ```ts
 * const history = createHistory(agent, { within: () => panel })
 * history.subscribe(() => render(history.entries(), history.position()))
 * await history.seek(0) // the page as it was when recording started
 * await history.undoSource("agent") // only what the agent did
 * ```
 * @experimental
 */
declare function createHistory(agent: ReturnType<typeof createAgent>, options?: HistoryOptions): {
    /** Every entry, oldest first. */
    entries: () => readonly HistoryEntry[];
    /** How many entries are applied: `entries().length` is now, 0 is the start. */
    position: () => number;
    /** Calls `listener` whenever the entries or the position change, until the returned function runs. */
    subscribe(listener: () => void): () => boolean;
    /**
     * Puts the page back to how it was after `to` entries, or forward again,
     * and resolves with the changes it couldn't put back. When none went
     * back, the position stays where it was.
     */
    seek: (to: number) => Promise<{
        ref: string;
        key: string;
        value: unknown;
    }[]>;
    /**
     * Reverts every applied change one source made, like `"agent"`, keeps the
     * rest, and resolves with the changes it couldn't put back, whose entries
     * stay applied.
     */
    undoSource: (source: string) => Promise<{
        ref: string;
        key: string;
        value: unknown;
    }[]>;
    /** Forgets every entry, keeping the page as it is. */
    clear(): void;
    /** Stops recording. */
    destroy(): void;
};
export { stageChanges, type StagedChange } from "./stage.js";
export { createHistory, describeEntry, type HistoryEntry, type HistoryOptions };
