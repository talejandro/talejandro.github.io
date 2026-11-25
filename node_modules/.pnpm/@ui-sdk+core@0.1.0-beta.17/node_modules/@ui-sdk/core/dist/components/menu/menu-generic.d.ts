import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { MenuRadioGroupProps } from "./menu.js";
import type { MenuInternalOptions } from "./menu-api.js";
interface MenuGeneric extends PrimitiveGeneric {
    T: string;
    options: MenuInternalOptions;
    props: MenuPartProps<this["T"] & string>;
}
type MenuPartProps<T extends string> = {
    "radio-group": MenuRadioGroupProps<T>;
};
export type { MenuGeneric };
