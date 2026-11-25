import type { CarouselPageChangeReason } from "./carousel.js";
import type { State } from "./carousel-api.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
declare function carouselKeys(context: PrimitiveContext<object, State, string>, go: (page: number, reason: CarouselPageChangeReason, event?: Event, by?: 1 | -1) => boolean, readDirection: () => boolean): (event: KeyboardEvent) => void;
export { carouselKeys };
