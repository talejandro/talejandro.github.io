type Box = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
declare function bridgeBetween(trigger: Box, popup: Box, padding?: number): (x: number, y: number) => boolean;
export { bridgeBetween };
