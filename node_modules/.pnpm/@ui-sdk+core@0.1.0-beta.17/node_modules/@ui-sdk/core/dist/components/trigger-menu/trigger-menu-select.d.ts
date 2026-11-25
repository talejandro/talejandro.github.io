import { type ListData } from "../../foundation/lists/listbox.js";
import type { TextEditorAdapter, TextRange, TokenInsert } from "../../foundation/text/text-editor.js";
import type { TriggerMenuItemProps, TriggerMenuOptions } from "./trigger-menu.js";
import { type TriggerLevels } from "./trigger-menu-levels.js";
type ItemMeta = TriggerMenuItemProps<unknown> & {
    group?: string;
};
type Pending = PromiseLike<void | Partial<TokenInsert>>;
declare function createTriggerSelect({ levels, editor, options, items, find, highlighted, itemProps, toKey, waiting, }: {
    levels: TriggerLevels;
    editor: () => TextEditorAdapter | undefined;
    options: () => TriggerMenuOptions<any>;
    items: () => ListData<unknown> | undefined;
    find: (key: string) => {
        value: unknown;
        label: string;
        keywords?: string[];
        disabled: boolean;
    } | undefined;
    highlighted: () => string | null;
    itemProps: (key: string) => ItemMeta | undefined;
    toKey: (value: unknown) => string;
    waiting: (promise: Pending) => void;
}): {
    choose: (key: string, event?: Event, { tab }?: {
        tab?: boolean | undefined;
    }) => void;
    accept: (event?: Event, { tab }?: {
        tab?: boolean | undefined;
    }) => void;
    write: (range: TextRange, content: string | TokenInsert, pending?: Pending) => void;
    isWriting: () => boolean;
};
export { createTriggerSelect };
