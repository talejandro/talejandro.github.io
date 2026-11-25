import { type Listbox } from "./listbox.js";
declare const PAGE = 10;
declare const pagedElsewhere: WeakSet<Element>;
declare function listStep(event: KeyboardEvent, { apple }: {
    apple: boolean;
}): number | "first" | "last" | undefined;
declare function listKeyDown(event: KeyboardEvent, { listbox, highlighted, choose, focusInput, }: {
    listbox: Listbox;
    highlighted: string | null;
    choose: (key: string, event: Event) => void;
    focusInput: () => void;
}): void;
export { listKeyDown, listStep, PAGE, pagedElsewhere };
