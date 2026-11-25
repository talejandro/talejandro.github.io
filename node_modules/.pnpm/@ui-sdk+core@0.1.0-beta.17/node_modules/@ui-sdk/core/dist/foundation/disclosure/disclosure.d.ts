import { bindFindable, bindPanel, hiddenAttrs, supportsHiddenUntilFound, type PanelBinding } from "../motion/panel.js";
import { openAttrs } from "../kernel/attrs.js";
declare function createPendingReason<Reason extends string>(none: Reason): {
    set(next: Reason): void;
    take(): Reason;
};
declare function bindTriggerElement(el: HTMLElement): void;
declare function triggerKeydown(event: KeyboardEvent, el: HTMLElement | undefined): void;
declare function focusPressedTrigger(el: HTMLElement | undefined): void;
export { bindFindable, bindPanel, bindTriggerElement, createPendingReason, focusPressedTrigger, hiddenAttrs, openAttrs, type PanelBinding, supportsHiddenUntilFound, triggerKeydown, };
