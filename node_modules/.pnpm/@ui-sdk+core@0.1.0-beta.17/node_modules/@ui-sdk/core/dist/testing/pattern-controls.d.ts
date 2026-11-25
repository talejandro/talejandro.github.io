import { type PatternContext } from "./pattern-context.js";
/** Disclosure: named buttons with aria-expanded, which Enter and Space toggle. */
declare function disclosure(context: PatternContext): Promise<void>;
/** Accordion: header buttons in headings, with aria-expanded and aria-controls, which Enter and Space toggle. */
declare function accordion(context: PatternContext): Promise<void>;
/** Switch: a name and aria-checked "true" or "false", which Space toggles. */
declare function switchPattern(context: PatternContext): Promise<void>;
/** Checkbox: a name and aria-checked "true", "false" or "mixed", which Space toggles. */
declare function checkbox(context: PatternContext): Promise<void>;
/** Slider: a name and aria-valuenow, arrows that raise and lower it, and Home and End to its bounds. */
declare function slider(context: PatternContext): Promise<void>;
export { accordion, checkbox, disclosure, slider, switchPattern };
