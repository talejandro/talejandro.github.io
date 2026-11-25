import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { ComboboxChipProps, ComboboxItemProps, ComboboxOptions } from "./combobox.js";
interface ComboboxGeneric extends PrimitiveGeneric {
    T: unknown;
    defaults: {
        T: string;
    };
    options: ComboboxOptions<this["T"]>;
    props: ComboboxPartProps<this["T"]>;
}
type ComboboxPartProps<T> = {
    item: ComboboxItemProps<T>;
    chip: ComboboxChipProps<T>;
};
export type { ComboboxGeneric };
