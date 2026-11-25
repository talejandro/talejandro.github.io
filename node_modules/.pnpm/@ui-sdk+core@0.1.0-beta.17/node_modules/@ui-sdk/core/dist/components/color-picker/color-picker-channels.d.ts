import { type Color } from "../../foundation/color/convert.js";
import { type ColorGamut } from "../../foundation/color/gamut.js";
/**
 * The spaces a color picker edits in: HSV (also called HSB), HSL, sRGB's red,
 * green and blue, and OKLCH.
 * @experimental
 */
type ColorPickerSpace = "hsv" | "hsl" | "srgb" | "oklch";
/**
 * A channel a color picker part edits. Which ones there are depends on the
 * space: `"brightness"` is HSV's, `"chroma"` OKLCH's, `"lightness"` HSL's or
 * OKLCH's. `"alpha"` is in every space.
 * @experimental
 */
type ColorChannel = "hue" | "saturation" | "brightness" | "lightness" | "chroma" | "red" | "green" | "blue" | "alpha";
type ChannelSpec = {
    index: number;
    max: number;
    step: number;
    scale: number;
    unit: "°" | "%" | "";
};
declare const defaultAxes: Record<ColorPickerSpace, {
    x: ColorChannel;
    y: ColorChannel;
    slider: ColorChannel;
}>;
declare const spaceOf: (space: string | undefined) => ColorPickerSpace;
declare function channelOf(space: ColorPickerSpace, channel: ColorChannel | undefined): {
    index: number;
    max: number;
    step: number;
    scale: number;
    unit: "\u00B0" | "%" | "";
    name: ColorChannel;
    label: string;
};
type Channel = ReturnType<typeof channelOf>;
declare const black: (space: ColorPickerSpace) => Color;
declare const inSpace: (color: Color, space: ColorPickerSpace) => Color;
declare function colorIn(text: string, space: ColorPickerSpace): Color | null;
declare function readChannel(color: Color, spec: ChannelSpec): number;
declare function withChannel(color: Color, spec: ChannelSpec, value: number): {
    alpha: number;
    space: import("../../foundation/color/index.js").ColorSpace;
    coords: [number | null, number | null, number | null];
};
declare function channelText(value: number, spec: ChannelSpec): string;
declare function shown(color: Color, gamut: ColorGamut | false): Color;
declare const cssOf: (color: Color) => string;
declare function channelGradient(color: Color, spec: ChannelSpec, direction: string): string;
declare function areaGradient(color: Color, x: ColorChannel, y: ColorChannel, rtl: boolean): string | undefined;
declare function describeColor(color: Color): string;
export { areaGradient, black, type Channel, channelGradient, channelOf, channelText, colorIn, type ColorChannel, type ColorPickerSpace, cssOf, defaultAxes, describeColor, inSpace, readChannel, shown, spaceOf, withChannel, };
