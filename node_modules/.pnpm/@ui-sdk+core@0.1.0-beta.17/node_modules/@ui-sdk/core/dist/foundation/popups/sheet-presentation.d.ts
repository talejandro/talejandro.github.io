import type { Popup } from "./popup.js";
import type { SheetConfig } from "./presentation.js";
import { prepareVariables } from "./sheet-effects.js";
declare function presentSheet(el: HTMLElement, popup: Popup, config: SheetConfig): (() => void) | undefined;
export { prepareVariables, presentSheet };
