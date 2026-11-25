/**
 * How content entered or left, in item order: `start` is the side of the first item.
 * @stable
 */
type NavigationMenuMotion = "from-start" | "from-end" | "to-start" | "to-end";
type Orientation = "horizontal" | "vertical";
declare function listKey(key: string, orientation: Orientation, rtl: boolean): 1 | -1 | "enter" | "first" | "last" | undefined;
declare function panelKey(key: string, rtl: boolean): 1 | -1 | "first" | "last" | undefined;
declare function isModified(event: {
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
}): boolean;
declare function stepIndex(index: number, step: number | "first" | "last", count: number): number;
declare function motionOf(key: string, state: {
    value: string | null;
    previous: string | null;
    forward: boolean | null;
}): "from-start" | "from-end" | "to-start" | "to-end" | undefined;
declare function opensElsewhere(event: Event): boolean;
export { isModified, listKey, motionOf, type NavigationMenuMotion, opensElsewhere, panelKey, stepIndex, };
