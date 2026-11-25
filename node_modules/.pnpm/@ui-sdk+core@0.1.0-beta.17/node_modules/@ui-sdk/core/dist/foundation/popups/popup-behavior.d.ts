import type { PopupModal } from "./popup.js";
/** How Tab moves through a popup. See `PopupBehavior.tab`. */
type PopupTab = "close" | "flow" | "trap" | "native";
/**
 * How a kind of popup behaves. Components start from a preset in
 * `popupPresets` and override what differs, so `createPopupLayer` stays a short
 * list of wiring plus one name.
 */
type PopupBehavior = {
    tab: PopupTab | ((modal: PopupModal) => PopupTab);
    blur: "always" | "iframe" | "never";
    outsidePress: "pointerdown" | "click";
    shield: boolean;
    keepTrigger: boolean;
    focusOnMount: boolean;
    dismissOnFocusLoss: boolean;
    closeWatcher: boolean;
    blocking: boolean | ((modal: PopupModal) => boolean);
    movesFocus: boolean;
};
/** The behavior of each kind of popup. Drawer adds its here. */
declare const popupPresets: {
    menu: PopupBehavior;
    select: PopupBehavior;
    combobox: {
        tab: "native";
        blur: "always" | "iframe" | "never";
        outsidePress: "pointerdown" | "click";
        shield: boolean;
        keepTrigger: boolean;
        focusOnMount: boolean;
        dismissOnFocusLoss: boolean;
        closeWatcher: boolean;
        blocking: boolean | ((modal: PopupModal) => boolean);
        movesFocus: boolean;
    };
    popover: {
        tab: (modal: PopupModal) => "flow" | "trap";
        blur: "iframe";
        outsidePress: "pointerdown" | "click";
        shield: boolean;
        keepTrigger: boolean;
        focusOnMount: boolean;
        dismissOnFocusLoss: boolean;
        closeWatcher: boolean;
        blocking: boolean | ((modal: PopupModal) => boolean);
        movesFocus: boolean;
    };
    dialog: {
        tab: (modal: PopupModal) => "flow" | "trap";
        blur: "never";
        outsidePress: "click";
        shield: true;
        keepTrigger: false;
        focusOnMount: true;
        dismissOnFocusLoss: false;
        closeWatcher: true;
        blocking: (modal: PopupModal) => boolean;
        movesFocus: boolean;
    };
    tooltip: {
        tab: "native";
        movesFocus: false;
        blur: "always" | "iframe" | "never";
        outsidePress: "pointerdown" | "click";
        shield: boolean;
        keepTrigger: boolean;
        focusOnMount: boolean;
        dismissOnFocusLoss: boolean;
        closeWatcher: boolean;
        blocking: boolean | ((modal: PopupModal) => boolean);
    };
    hoverCard: {
        tab: "flow";
        blur: "always" | "iframe" | "never";
        outsidePress: "pointerdown" | "click";
        shield: boolean;
        keepTrigger: boolean;
        focusOnMount: boolean;
        dismissOnFocusLoss: boolean;
        closeWatcher: boolean;
        blocking: boolean | ((modal: PopupModal) => boolean);
        movesFocus: boolean;
    };
    navigationMenu: {
        tab: "flow";
        blur: "never";
        outsidePress: "pointerdown" | "click";
        shield: boolean;
        keepTrigger: boolean;
        focusOnMount: boolean;
        dismissOnFocusLoss: boolean;
        closeWatcher: boolean;
        blocking: boolean | ((modal: PopupModal) => boolean);
        movesFocus: boolean;
    };
};
type PopupBehaviorName = keyof typeof popupPresets;
declare function resolveBehavior(preset: PopupBehaviorName, overrides: Partial<PopupBehavior>): PopupBehavior;
export { type PopupBehavior, type PopupBehaviorName, popupPresets, type PopupTab, resolveBehavior, };
