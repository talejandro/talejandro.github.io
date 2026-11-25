import type { Store } from "../kernel/store.js";
type FieldName = {
    labelledBy: string;
} | {
    label: string;
} | null;
declare function bindFieldName(el: HTMLElement, store: Store<{
    fieldName: FieldName;
}>, id: string): void;
declare function listName(state: {
    labeled?: boolean;
    fieldName: FieldName;
}, id: string): {
    "aria-labelledby": string | undefined;
    "aria-label": string | undefined;
};
export { bindFieldName, type FieldName, listName };
