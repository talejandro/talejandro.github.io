import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { TabsOptions, TabsState } from "./tabs.js";
interface TabsGeneric extends PrimitiveGeneric {
    T: string;
    options: TabsOptions<this["T"] & string>;
    state: TabsStates<this["T"] & string>;
}
type TabsStates<T extends string> = {
    root: TabsState<T>;
};
export type { TabsGeneric };
