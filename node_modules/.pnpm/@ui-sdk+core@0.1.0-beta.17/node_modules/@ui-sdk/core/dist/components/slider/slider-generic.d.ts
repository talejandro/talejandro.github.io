import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { SliderOptions } from "./slider.js";
interface SliderGeneric extends PrimitiveGeneric {
    T: unknown;
    defaults: {
        T: number | number[];
    };
    options: SliderOptions<this["T"] extends number | number[] ? this["T"] : this["T"] & (number | number[])>;
}
export type { SliderGeneric };
