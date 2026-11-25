import { type SheetSnapReason } from "../motion/machine.js";
import { type SheetDriverOptions } from "./sheet-driver.js";
declare function createScrollSnapDriver(options: SheetDriverOptions): {
    open(id: string, animate: boolean): void;
    close(): void;
    snapTo: (id: string, reason: SheetSnapReason) => void;
    nudge(): void;
    relayout(_immediate: boolean, fallback: string | undefined): void;
    target: () => string | null;
    isMoving: () => boolean;
    destroy(): void;
};
export { createScrollSnapDriver };
