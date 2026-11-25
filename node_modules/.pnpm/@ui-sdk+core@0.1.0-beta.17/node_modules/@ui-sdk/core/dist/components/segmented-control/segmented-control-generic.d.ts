import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { SegmentedControlOptions } from "./segmented-control.js";
interface SegmentedControlGeneric extends PrimitiveGeneric {
    T: string;
    options: SegmentedControlOptions<this["T"] & string>;
}
export type { SegmentedControlGeneric };
