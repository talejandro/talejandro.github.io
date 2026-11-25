import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { NavigationMenuOptions, NavigationMenuState } from "./navigation-menu.js";
import type { NavigationMenuInternalOptions } from "./navigation-menu-api.js";
interface NavigationMenuGeneric extends PrimitiveGeneric {
    T: string;
    options: NavigationMenuOptions<this["T"] & string> & NavigationMenuInternalOptions;
    state: NavigationMenuStates<this["T"] & string>;
}
type NavigationMenuStates<T extends string> = {
    root: NavigationMenuState<T>;
};
export type { NavigationMenuGeneric };
