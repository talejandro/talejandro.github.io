import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { TriggerMenuItemProps, TriggerMenuOptions } from "./trigger-menu.js";
interface TriggerMenuGeneric extends PrimitiveGeneric {
    T: unknown;
    defaults: {
        T: string;
    };
    options: TriggerMenuOptions<this["T"]>;
    props: TriggerMenuPartProps<this["T"]>;
}
type TriggerMenuPartProps<T> = {
    item: TriggerMenuItemProps<T>;
};
export type { TriggerMenuGeneric };
