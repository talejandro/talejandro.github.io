import { type Listbox } from "./listbox.js";
import { type Store } from "../kernel/store.js";
/**
 * Labels as one text. Without `maxLabels`, joined with commas. With it, the first
 * `maxLabels` and a count of the rest, joined the way `locale` joins a list, or
 * in English with the default count: "Apple, Banana, and 2 more".
 */
declare function formatLabels(labels: readonly string[], { maxLabels, getMoreLabel, }?: {
    maxLabels?: number;
    getMoreLabel?: (count: number) => string;
}, locale?: string): string;
declare function listOf(value: unknown): any[];
declare function createValueSelection(config: {
    store: Store<{
        value: unknown;
        initial: unknown;
        multiple: boolean;
        labels: number;
    }>;
    options: () => {
        itemToValue?: (value: unknown) => string;
        itemToLabel?: (value: unknown) => string;
        isItemEqualToValue?: (itemValue: unknown, value: unknown) => boolean;
    };
    listbox: Listbox;
    toKey: (value: unknown) => string;
    onDestroy: (cleanup: () => void) => void;
}): {
    values: () => any[] | unknown[];
    keys: () => string[];
    keysOf: (value: unknown) => string[];
    isSelected: (key: string, itemValue?: unknown) => boolean;
    labelOf: (value: unknown) => string;
    labels(): string[];
    queueLabels: () => void;
    learn(find: (keys: ReadonlySet<string>) => readonly {
        value: unknown;
        label: string;
    }[]): boolean;
    needsItems: (hasValueIcon: boolean) => boolean;
    toggled(key: string, itemValue: unknown): any[];
    without: (key: string) => any[];
    empty: () => never[] | null;
    restore(saved: string, write: (value: unknown) => void): void;
    stopRestoring: () => void;
    isFilling: () => boolean;
};
type ValueSelection = ReturnType<typeof createValueSelection>;
type ItemsOf<T> = T extends unknown ? never : T[];
export { createValueSelection, formatLabels, type ItemsOf, listOf, type ValueSelection, };
