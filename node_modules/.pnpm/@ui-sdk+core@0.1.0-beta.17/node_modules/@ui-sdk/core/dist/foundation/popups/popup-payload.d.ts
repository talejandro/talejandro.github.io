import type { Store } from "../kernel/store.js";
declare function createPopupPayload<Reason extends string>(store: Store<{
    trigger: string | null;
    payload: unknown;
}>, change: (payload: unknown, details: {
    reason: Reason;
    event?: Event;
}) => boolean): {
    opening(trigger: string | undefined, payload: unknown, details: {
        reason: Reason;
        event?: Event;
    }): () => void;
    handOver(trigger: string, payload: unknown, details: {
        reason: Reason;
        event?: Event;
    }): void;
    reopening(openOptions: {
        payload?: unknown;
    }, details: {
        reason: Reason;
        event?: Event;
    }): boolean;
};
export { createPopupPayload };
