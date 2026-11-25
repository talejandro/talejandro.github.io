import type { PrimitiveGeneric } from "../../foundation/kernel/primitive-types.js";
import type { RadioGroupOptions } from "./radio.js";
interface RadioGroupGeneric extends PrimitiveGeneric {
    T: string;
    options: RadioGroupOptions<this["T"] & string>;
}
export type { RadioGroupGeneric };
