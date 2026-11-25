import { type Listbox } from "../../foundation/lists/listbox.js";
import type { Store } from "../../foundation/kernel/store.js";
import type { SelectOpenChangeReason, SelectValueChangeReason } from "./select.js";
import type { SelectState, Show } from "./select-api.js";
import { type ValueSelection } from "../../foundation/lists/listbox-value.js";
declare function createSelectKeyboard({ store, listbox, selection, show, hide, choose, setValue, prepare, searchElement, popupKeyDown, }: {
    store: Store<SelectState>;
    listbox: Listbox;
    selection: ValueSelection;
    show: (options: Show) => unknown;
    hide: (options: {
        reason: SelectOpenChangeReason;
        event?: Event;
        focus?: boolean;
    }) => void;
    choose: (key: string, event?: Event) => void;
    setValue: (value: unknown, options: {
        reason: SelectValueChangeReason;
        event?: Event;
    }) => unknown;
    prepare: () => void;
    searchElement: () => HTMLElement | undefined;
    popupKeyDown: (event: KeyboardEvent) => void;
}): {
    onTriggerKeyDown: (event: KeyboardEvent, trigger: HTMLElement | undefined) => void;
    onContentKeyDown: (event: KeyboardEvent) => void;
    pointerPress: (trigger: HTMLElement, event: PointerEvent) => void;
    consumePressClick(): boolean;
};
export { createSelectKeyboard };
