import type { Listbox } from "../../foundation/lists/listbox.js";
import type { Store } from "../../foundation/kernel/store.js";
declare function createTriggerMenuKeyboard({ store, listbox, active, inArguments, choose, accept, dismiss, caretMove, }: {
    store: Store<{
        open: boolean;
        highlighted: string | null;
        navigated: boolean;
    }>;
    listbox: Listbox;
    active: () => boolean;
    inArguments: () => boolean;
    choose: (key: string, event: KeyboardEvent, options: {
        tab: boolean;
    }) => void;
    accept: (event: KeyboardEvent, options: {
        tab: boolean;
    }) => void;
    dismiss: (event: KeyboardEvent) => void;
    caretMove: (event: KeyboardEvent) => void;
}): {
    onKeyDown: (event: KeyboardEvent) => void;
};
export { createTriggerMenuKeyboard };
