import type { ComboboxOpenChangeReason, ComboboxQueryChangeReason } from "./combobox.js";
import type { ComboboxState } from "./combobox-api.js";
import { type ListEntry, type Listbox } from "../../foundation/lists/listbox.js";
import { type PopupOpener } from "../../foundation/popups/popup.js";
import type { Store } from "../../foundation/kernel/store.js";
import { type ValueSelection } from "../../foundation/lists/listbox-value.js";
declare function createComboboxKeyboard({ store, listbox, selection, show, hide, choose, create, remove, itemLabelled, commitCustom, hasCreate, allowCustomValue, chips, inputElement, focusInput, highlightOnOpen, }: {
    store: Store<ComboboxState>;
    listbox: Listbox;
    selection: ValueSelection;
    show: (options: {
        event?: Event;
        by?: PopupOpener;
    }) => unknown;
    hide: (options: {
        reason: ComboboxOpenChangeReason;
        event?: Event;
    }) => void;
    choose: (key: string, event?: Event) => void;
    create: (event?: Event) => void;
    remove: (value: unknown, event?: Event) => void;
    itemLabelled: (query: string, candidates: ListEntry[]) => ListEntry | undefined;
    commitCustom: (reason: ComboboxQueryChangeReason, event?: Event) => boolean;
    hasCreate: () => boolean;
    allowCustomValue: () => boolean;
    chips: () => HTMLElement[];
    inputElement: () => HTMLElement | undefined;
    focusInput: () => void;
    highlightOnOpen: (target: "first" | "last") => void;
}): {
    onInputKeyDown: (event: KeyboardEvent) => void;
    onListKeyDown: (event: KeyboardEvent) => void;
    onChipKeyDown: (event: KeyboardEvent, el: HTMLElement, value: unknown) => void;
    onTriggerKeyDown: (event: KeyboardEvent) => void;
};
export { createComboboxKeyboard };
