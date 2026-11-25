import type { Store } from "../kernel/store.js";
type DropReason = "drag" | "move-key";
declare function createDraftMove<State extends object, Draft extends {
    key: string;
    pointer: boolean;
}, Value>({ store, draft: draftKey, value: valueKey, shown, same, rebase, commit, say, element, }: {
    store: Store<State>;
    draft: keyof State & string;
    value: keyof State & string;
    shown: (draft: Draft) => Value;
    same: (a: Value, b: Value) => boolean;
    rebase: (draft: Draft, value: Value, moved: boolean) => Draft | null;
    commit: (draft: Draft, details: {
        reason: DropReason;
        event?: Event;
    }) => boolean;
    say: (type: "drop" | "cancel", draft: Draft, shownValue: Value) => void;
    element: (key: string) => HTMLElement | undefined;
}): {
    draft: () => Draft | null;
    value: () => Value;
    setDraft: (next: Draft | null) => void;
    focusLater: (key: string) => void;
    drop: (reason: DropReason, event?: Event) => void;
    cancel: (refocus?: boolean) => void;
};
export { createDraftMove };
