import type { ChangeDetails, ChangeSource } from "./details.js";
import type { AgentSurface, Part, PrimitiveInstance, PropSpec } from "./primitive-types.js";
type WatchedDefinition = {
    controlled?: string[];
    commits?: string[];
    agent?: AgentSurface;
    options?: Record<string, PropSpec>;
};
/**
 * Hears every instance as it's made and destroyed, with the keys its
 * definition controls and commits, and every change that goes through and
 * every commit, once something sets them, like `@ui-sdk/core/agent` and
 * `@ui-sdk/core/observe`. Empty otherwise, so a page that imports neither pays
 * one property read per change and per commit, and a weak reference per instance.
 */
declare const watchers: {
    add?: (instance: PrimitiveInstance, parts: ReadonlyMap<string, Part>, definition: WatchedDefinition) => () => void;
    change?: (id: string, key: string, value: unknown, details: ChangeDetails, previous: unknown) => void;
    commit?: (id: string, key: string, value: unknown, details: {
        reason: string;
        source: ChangeSource;
    }) => void;
};
/**
 * Lets the watchers hear the instance being made while the framework keeps
 * it, and, kept before any watcher exists, once one does.
 */
declare function watchWhileKept(instance: PrimitiveInstance, parts: ReadonlyMap<string, Part>, definition: WatchedDefinition): void;
/** Starts watching the instances made before `watchers.add` was set. */
declare function watchEarlier(): void;
export { watchEarlier, watchers, watchWhileKept };
