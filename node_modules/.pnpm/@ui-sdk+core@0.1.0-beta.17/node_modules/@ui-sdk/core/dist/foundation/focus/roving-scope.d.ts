import { type Store } from "../kernel/store.js";
import type { RovingFocusItem, RovingOrientation } from "./roving-focus.js";
type RovingMember = {
    disabled?: () => boolean;
    focusable?: () => boolean;
    preferred?: () => boolean;
};
type RovingScope = {
    bind: (el: HTMLElement, item: RovingFocusItem<RovingMember>) => () => void;
    claim: (item: RovingFocusItem<RovingMember>) => boolean;
    queueCheck: () => void;
    keydown: (event: KeyboardEvent, el: HTMLElement) => void;
    stop: () => string | null;
    follow: (key: string, listener: () => void) => () => void;
    orientation: () => RovingOrientation;
    disabled: () => boolean;
};
declare const memberDisabled: (item: RovingFocusItem<RovingMember>) => boolean;
declare const memberFocusable: (item: RovingFocusItem<RovingMember>) => boolean;
declare function queued(run: () => void): () => void;
/**
 * Runs `listener` on every change to a group's store but a stop move, and on
 * stop moves to or from `key`, or from null, which items read before the
 * first check. An arrow key then reaches the two items it moves the stop
 * between, not every item.
 */
declare function followStop(store: Store<{
    stop: string | null;
}>, key: string, listener: () => void): () => void;
export { followStop, memberDisabled, memberFocusable, queued, type RovingMember, type RovingScope, };
