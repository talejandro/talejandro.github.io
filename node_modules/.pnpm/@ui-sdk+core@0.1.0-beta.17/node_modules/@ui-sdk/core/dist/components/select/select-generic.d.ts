import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { SelectItemProps, SelectOptions } from "./select.js";
interface SelectGeneric extends PrimitiveGeneric {
    T: unknown;
    defaults: {
        T: string;
    };
    options: SelectOptions<this["T"]>;
    props: SelectPartProps<this["T"]>;
}
type SelectPartProps<T> = {
    item: SelectItemProps<T>;
};
export type { SelectGeneric };
