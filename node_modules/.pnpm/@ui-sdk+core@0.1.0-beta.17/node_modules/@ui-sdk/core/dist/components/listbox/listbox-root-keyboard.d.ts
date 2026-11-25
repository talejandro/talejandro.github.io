import { type Listbox } from "../../foundation/lists/listbox.js";
import type { ListboxValueChangeReason } from "./listbox-root.js";
import type { ListboxStore } from "./listbox-root-api.js";
import type { Store } from "../../foundation/kernel/store.js";
type Change = {
    reason: ListboxValueChangeReason;
    event?: Event;
};
declare function createListboxKeyboard({ store, listbox, choose, toggle, replace, extend, toggleAll, anchorKey, }: {
    store: Store<ListboxStore>;
    listbox: Listbox;
    choose: (key: string, why: Change) => void;
    toggle: (key: string, why: Change) => void;
    replace: (key: string, why: Change) => void;
    extend: (to: string, range: {
        from: string | null;
        additive: boolean;
    }, why: Change) => void;
    toggleAll: (why: Change) => void;
    anchorKey: () => string | null;
}): {
    onKeyDown: (event: KeyboardEvent, root: HTMLElement) => void;
    press: (key: string, event?: Event) => void;
};
export { createListboxKeyboard };
