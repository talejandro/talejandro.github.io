import { type SheetDriverOptions } from "./sheet-driver.js";
declare function createPointerDriver(options: SheetDriverOptions): {
    open(id: string, animate: boolean): void;
    close(): void;
    snapTo(id: string, reason: import("../motion/index.js").SheetSnapReason): void;
    nudge(): void;
    relayout(immediate: boolean, fallback: string | undefined): void;
    target: () => string | null;
    isMoving: () => boolean;
    destroy(): void;
};
export { createPointerDriver };
