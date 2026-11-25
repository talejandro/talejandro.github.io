import type { createAgent } from "../agent/agent.js";
/**
 * One value to put on a control: its ref or label, the key, and the value.
 * @experimental
 */
type StagedChange = {
    ref: string;
    key?: string;
    value: unknown;
};
/**
 * Puts values on the page's controls through the agent bridge, and returns
 * how to take them back. `key` defaults to `"value"`, set with the
 * component's `set<Key>` action. Changes that can't run are skipped, and
 * `revert` restores only the ones that did, in reverse order, and resolves
 * with the ones it couldn't put back, like a password field's, whose value
 * before reads `"[redacted]"`.
 *
 * ```ts
 * const staged = await stageChanges(agent, [{ ref: "Volume", value: 80 }, { ref: "Theme", value: "dark" }])
 * // later
 * await staged.revert()
 * ```
 * @experimental
 */
declare function stageChanges(agent: ReturnType<typeof createAgent>, changes: readonly StagedChange[]): Promise<{
    /** The changes that went on, each with the value it replaced. */
    applied: readonly {
        ref: string;
        key: string;
        before: unknown;
        value: unknown;
    }[];
    /** Puts back what each control had, and resolves with the changes it couldn't. Runs once. */
    revert(): Promise<{
        ref: string;
        key: string;
        before: unknown;
        value: unknown;
    }[]>;
}>;
export { stageChanges, type StagedChange };
