import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { ListboxItemProps, ListboxOptions } from "./listbox-root.js";
interface ListboxGeneric extends PrimitiveGeneric {
    T: unknown;
    defaults: {
        T: string;
    };
    options: ListboxOptions<this["T"]>;
    props: ListboxPartProps<this["T"]>;
}
type ListboxPartProps<T> = {
    item: ListboxItemProps<T>;
};
export type { ListboxGeneric };
