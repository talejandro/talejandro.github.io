import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { TreeOptions, TreeMode } from "./tree.js";
interface TreeGeneric extends PrimitiveGeneric {
    T: string;
    defaults: {
        T: "single";
    };
    options: TreeOptions<this["T"] & TreeMode>;
}
export type { TreeGeneric };
