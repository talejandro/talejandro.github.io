# Color Picker

Choose a color by dragging across an area and along sliders, typing any CSS color, or picking a preset.

Use a color picker to choose a color, like a brand or theme color. The value is a CSS color string, and every part edits it: an area for two channels at once, a slider per channel, a text input that reads any CSS color, and presets.

<ComponentExample
  name="color-picker/basic"
  inspect
  caption="Drag across the area or along the sliders, or choose a preset. Choose HSL to write the color another way, or type one like rebeccapurple and press Enter."
/>

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `ColorPicker`:

```text
ColorPicker
├── ColorPickerArea
│   ├── ColorPickerAreaCanvas
│   └── ColorPickerAreaThumb
├── ColorPickerSlider
│   └── ColorPickerSliderThumb
├── ColorPickerSlider
│   └── ColorPickerSliderThumb
├── ColorPickerSwatch
├── ColorPickerInput
├── ColorPickerChannelInput
├── ColorPickerEyeDropper
└── ColorPickerSwatches
    ├── ColorPickerSwatchItem
    └── ColorPickerSwatchItem
```

Every part is optional, so use the ones your picker needs.

- **ColorPicker** holds the value and is a group around the parts.
- **ColorPickerArea** edits two channels, like saturation across and brightness up. A press moves the thumb there and starts a drag. Its background is `--color-area-background`, so give it a size and that background.
- **ColorPickerAreaCanvas** paints the area pixel by pixel, for channels no gradient can draw, like OKLCH's chroma and lightness.
- **ColorPickerAreaThumb** shows where the color sits in the area. It's a slider that screen readers hear as both channels.
- **ColorPickerSlider** edits one `channel`, like `hue` or `alpha`, drawn by `--color-slider-background`.
- **ColorPickerSliderThumb** shows where the channel sits along its slider.
- **ColorPickerSwatch** shows the color, named for screen readers, like "vivid blue".
- **ColorPickerInput** reads any CSS color when you press Enter or leave it. Text that isn't a color goes back to the value.
- **ColorPickerChannelInput** edits one `channel` as a number, in the units people read it in, like 0 to 255 for red.
- **ColorPickerEyeDropper** picks a color from anywhere on the screen, where the browser can.
- **ColorPickerSwatches** and **ColorPickerSwatchItem** are a list of preset colors.

Each part writes the color as `--color-picker-color`, so a thumb or a swatch fills itself with `background: var(--color-picker-color)`. The picker also renders a hidden input that the form submits.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@ui-sdk/react/color-picker"

function BrandColor() {
  return (
    <ColorPicker aria-label="Brand color" defaultValue="#0ea5e9">
      <ColorPickerArea>
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <ColorPickerSlider channel="hue">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <ColorPickerInput aria-label="Hex" />
    </ColorPicker>
  )
}

export { BrandColor }
```

Name the picker with `aria-label`, or put it in a [Field](./field.md) whose label names it. Without `defaultValue`, it starts at black.

## Spaces and Channels

`space` decides which channels the parts edit, and what the value is written in:

| `space` | Area, across and up    | Slider | Value written as              |
| ------- | ---------------------- | ------ | ----------------------------- |
| `hsv`   | saturation, brightness | hue    | hex, like `#0ea5e9`           |
| `hsl`   | saturation, lightness  | hue    | `hsl(198.63 88.66% 48.43%)`   |
| `srgb`  | red, green             | blue   | `rgb(14 165 233)`             |
| `oklch` | chroma, lightness      | hue    | `oklch(0.6847 0.1479 237.32)` |

Set `format` to write the value another way, like `format="hex"` in any space. Every space has an `alpha` channel too. Set `x` and `y` on the area, or `channel` on a slider, to edit other channels:

```tsx
<ColorPicker
  aria-label="Background"
  space="hsl"
  defaultValue="hsl(220 60% 50%)"
>
  <ColorPickerArea x="hue" y="lightness">
    <ColorPickerAreaCanvas />
    <ColorPickerAreaThumb />
  </ColorPickerArea>
  <ColorPickerSlider channel="saturation" orientation="vertical">
    <ColorPickerSliderThumb />
  </ColorPickerSlider>
</ColorPicker>
```

The parts keep a hue while the color turns gray or black, so dragging back out of a corner returns to the same hue.

## OKLCH

OKLCH spaces its colors evenly for the eye, so two colors with the same lightness look equally bright. Its edge with the colors a screen can show is a curve, which no gradient can draw. Add `ColorPickerAreaCanvas` to the area, and it paints the colors inside that edge and leaves the rest clear.

```tsx title="oklch.tsx"
"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaCanvas,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
} from "@ui-sdk/react/color-picker"

function Example() {
  return (
    <ColorPicker
      aria-label="Accent"
      space="oklch"
      defaultValue="oklch(0.62 0.19 259)"
    >
      <ColorPickerArea>
        <ColorPickerAreaCanvas />
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <ColorPickerSlider channel="hue">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <ColorPickerSlider channel="alpha">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <div data-slot="row">
        <ColorPickerSwatch />
        <ColorPickerInput aria-label="OKLCH" />
      </div>
    </ColorPicker>
  )
}

export { Example }
```

Drag the thumb right, past the painted edge, and let go. The thumb moves back to the closest color inside.

While a drag holds a color past the edge, the value is already the closest color inside it, and every part has `data-out-of-gamut`. Once the drag ends, the thumb moves to that color. Colors stay inside sRGB by default. Set `gamut="p3"` for wide-gamut screens, or `gamut={false}` to allow any color:

```tsx
<ColorPicker
  aria-label="Accent"
  space="oklch"
  gamut="p3"
  defaultValue="oklch(0.7 0.25 150)"
>
  {/* … */}
</ColorPicker>
```

## Presets and Channel Inputs

Put `ColorPickerSwatchItem`s inside `ColorPickerSwatches` for preset colors. Each one is selected while the value is its color, however either is written, so `#0000ff` selects `rgb(0 0 255)`. The list is one tab stop, and the arrow keys move between the presets.

`ColorPickerChannelInput` edits one channel as a number and sets it on Enter, when you leave it, or with its arrows. `ColorPickerEyeDropper` picks from the screen in browsers that can. Elsewhere it's disabled, with `data-unsupported`, so you can hide it.

```tsx title="swatches.tsx"
"use client"

import {
  ColorPicker,
  ColorPickerChannelInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
} from "@ui-sdk/react/color-picker"
import { Pipette } from "lucide-react"

const presets = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
]

function Example() {
  return (
    <ColorPicker aria-label="Label color" space="srgb" format="hex" defaultValue="#0ea5e9">
      <ColorPickerSwatches aria-label="Presets">
        {presets.map((preset) => (
          <ColorPickerSwatchItem key={preset} value={preset} />
        ))}
      </ColorPickerSwatches>
      <div data-slot="row">
        <ColorPickerChannelInput channel="red" />
        <ColorPickerChannelInput channel="green" />
        <ColorPickerChannelInput channel="blue" />
        <ColorPickerEyeDropper aria-label="Pick from screen">
          <Pipette aria-hidden="true" />
        </ColorPickerEyeDropper>
      </div>
    </ColorPicker>
  )
}

export { Example }
```

Choose a preset, or use the arrow keys between them. Type 255 into the first number to set red.

## Popover

Put a `Popover` inside the picker to open it from a swatch. The parts inside the popup edit the same color, and the swatch in the trigger shows it.

```tsx title="popover.tsx"
"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
} from "@ui-sdk/react/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover"

function Example() {
  return (
    <ColorPicker aria-label="Background" defaultValue="#22c55e">
      <Popover>
        <PopoverTrigger aria-label="Background">
          <ColorPickerSwatch />
        </PopoverTrigger>
        <PopoverContent>
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>
          <ColorPickerSlider channel="hue">
            <ColorPickerSliderThumb />
          </ColorPickerSlider>
          <ColorPickerInput aria-label="Hex" />
        </PopoverContent>
      </Popover>
    </ColorPicker>
  )
}

export { Example }
```

Press the Background swatch to open the picker, then drag to change the color.

## Disabled

Set `disabled`. A disabled picker can't be focused or changed, and isn't submitted. A disabled `<fieldset>` around it disables it too.

```tsx title="disabled.tsx"
"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@ui-sdk/react/color-picker"

function Example() {
  return (
    <ColorPicker aria-label="Brand color" defaultValue="#0ea5e9" disabled>
      <ColorPickerArea>
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <ColorPickerSlider channel="hue">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <ColorPickerInput aria-label="Hex" />
    </ColorPicker>
  )
}

export { Example }
```

The thumbs can't be focused or dragged.

Set `readOnly` to keep the parts focusable and the value submitted, while drags, keys and typing leave the color alone:

```tsx
<ColorPicker aria-label="Theme color" defaultValue="#0ea5e9" readOnly>
  <ColorPickerSwatch />
  <ColorPickerInput aria-label="Hex" />
</ColorPicker>
```

## Controlled

Pass `value` and update it in `onValueChange`. Each change carries a [reason](#reasons), like `drag`, `step-key` or `input-commit`, and `details.color`, the color the parts hold, which keeps a hue while the value turns gray. Call `details.cancel()` in the callback to keep the current value.

`onValueChange` runs on every step of a drag. `onValueCommit` runs once, when the drag, key press or typed color ends, so use it to save. A controller from `createColorPickerController()` sets the color from anywhere with `setValue()`, like the Use Purple button below.

```tsx title="controlled.tsx"
"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  createColorPickerController,
} from "@ui-sdk/react/color-picker"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [picker] = React.useState(() => createColorPickerController())
  const [value, setValue] = React.useState("#0ea5e9")

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => picker.setValue("#663399")}>
          Use Purple
        </button>
      </div>
      <ColorPicker
        aria-label="Theme color"
        value={value}
        onValueChange={(next) => setValue(next)}
        onValueCommit={(next, details) =>
          log(`committed: ${next} (${details.reason})`)
        }
        controller={picker}
      >
        <ColorPickerArea>
          <ColorPickerAreaThumb />
        </ColorPickerArea>
        <ColorPickerSlider channel="hue">
          <ColorPickerSliderThumb />
        </ColorPickerSlider>
        <ColorPickerInput aria-label="Hex" />
      </ColorPicker>
    </div>
  )
}

export { Example }
```

Drag across the area and let go, or press Use Purple. The console logs each committed color and its reason.

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Form

The hidden input submits the value under `name`, like `#f97316`, and a disabled picker submits nothing. A form reset returns it to `defaultValue`. Set `form` to join a form by its id.

```tsx title="form.tsx"
"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
} from "@ui-sdk/react/color-picker"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(`Submitted brand=${new FormData(event.currentTarget).get("brand")}`)
      }}
    >
      <Field>
        <FieldLabel>Brand color</FieldLabel>
        <ColorPicker name="brand" defaultValue="#f97316">
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>
          <div data-slot="row">
            <ColorPickerSwatch />
            <ColorPickerSlider channel="hue">
              <ColorPickerSliderThumb />
            </ColorPickerSlider>
          </div>
        </ColorPicker>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Save
        </button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
```

Change the color and press Save to log the submitted value. Reset restores the orange.

A color picker always has a value, so `required` only adds `data-required`.

## Custom Rendering

Every part takes `render`, to render a different element or component in its place. `render`, `className` and `children` can be functions of the part's state. A slider thumb's state has its `channelValue`, a preset's has whether it's `selected`, and every part has the `color` and whether it's `outOfGamut`:

```tsx
<ColorPickerSlider channel="alpha">
  <ColorPickerSliderThumb className={({ outOfGamut }) => (outOfGamut ? "dashed" : undefined)}>
    {({ channelValue }) => <span>{Math.round(channelValue)}%</span>}
  </ColorPickerSliderThumb>
</ColorPickerSlider>
<ColorPickerSwatch>{({ color }) => (color.alpha < 1 ? <span>Transparent</span> : null)}</ColorPickerSwatch>
```

See [Parts and Composition](../parts-and-composition.md) for the rendering contract and [State](#state) for each part's fields.

## Styling

Parts are unstyled, apart from the positions they need: thumbs get `position: absolute` and their place in percent, as inline styles. Give the area and sliders a size and their background variable, and center each thumb on its point with `translate: -50% -50%`.

Each part has a `data-slot`, such as `color-picker-area`, and its state attributes are listed under [Data Attributes](#data-attributes).

### ColorPicker
- `--color-picker-color`: The color as CSS, inside the gamut. On a swatch item, its own color. Use it to fill a thumb or a swatch.

### ColorPickerArea
- `--color-area-background`: Gradients that draw the area, when its channels are saturation and brightness or lightness. Unset for others, which a canvas paints.

### ColorPickerAreaThumb
- `--area-x`: Where the thumb is across the area, from 0 to 1.
- `--area-y`: Where the thumb is up the area, from 0 at the bottom to 1 at the top.

### ColorPickerSlider
- `--color-slider-background`: A gradient through the slider's channel, with the other channels as they are.

### ColorPickerSliderThumb
- `--color-slider-thumb-position`: Where the thumb is along the slider, as a percentage.

### ColorPickerSwatch
- `--color-picker-color`: The color as CSS, inside the gamut. On a swatch item, its own color. Use it to fill a thumb or a swatch.

### ColorPickerSwatchItem
- `--color-picker-color`: The color as CSS, inside the gamut. On a swatch item, its own color. Use it to fill a thumb or a swatch.

## Data Attributes

### ColorPicker
`[data-slot="color-picker"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerArea
`[data-slot="color-picker-area"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerAreaThumb
`[data-slot="color-picker-area-thumb"]`

- `data-area-thumb`: Present on the area's thumb, which a press on the area moves and focuses.
- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerSlider
`[data-slot="color-picker-slider"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-channel` (`hue`, `saturation`, `brightness`, `lightness`, `chroma`, `red`, `green`, `blue`, `alpha`): The channel the part edits.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerSliderThumb
`[data-slot="color-picker-slider-thumb"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-channel` (`hue`, `saturation`, `brightness`, `lightness`, `chroma`, `red`, `green`, `blue`, `alpha`): The channel the part edits.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerInput
`[data-slot="color-picker-input"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerChannelInput
`[data-slot="color-picker-channel-input"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-channel` (`hue`, `saturation`, `brightness`, `lightness`, `chroma`, `red`, `green`, `blue`, `alpha`): The channel the part edits.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerSwatch
`[data-slot="color-picker-swatch"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerEyeDropper
`[data-slot="color-picker-eye-dropper"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.
- `data-unsupported`: Present when the browser can't pick a color from the screen.

### ColorPickerSwatches
`[data-slot="color-picker-swatches"]`

- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.
- `data-required`: Present when the picker is required.
- `data-out-of-gamut`: Present while a drag or a key holds a color outside the gamut. The value is the closest color inside, and the parts move there once the change commits.

### ColorPickerSwatchItem
`[data-slot="color-picker-swatch-item"]`

- `data-selected`: Present on the swatch item whose color is the value.
- `data-disabled`: Present when the picker is disabled, by its own prop or a `<fieldset>`.
- `data-readonly`: Present when the picker shows its color but can't change it.

## API Reference

Props and callbacks are the same as below, as React props.

### ColorPicker

- `value?` (`string`): The value, as a CSS color, like `"#0ea5e9"` or `"oklch(0.62 0.19 259)"`. Pass it to control the picker.
- `defaultValue?` (`string`): The value at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`((value: string, details: ColorPickerValueChangeDetails) => void)`): Runs while the value changes: on every step of a drag or a key. `details.color` is the color, and `details.cancel()` stops it.
- `onValueCommit?` (`((value: string, details: ColorPickerValueCommitDetails) => void)`): Runs once an interaction that changed the value ends: the pointer lifts, a key is pressed, a swatch is picked. For saving.
- `space?` (`ColorPickerSpace`): The space the parts edit in, which decides their channels: `"hsv"` has hue, saturation and brightness, `"hsl"` hue, saturation and lightness, `"srgb"` red, green and blue, `"oklch"` lightness, chroma and hue.
- `format?` (`ColorFormat`): How the value is written: `"hex"`, or a space in its CSS syntax, like `"oklch"`.
- `gamut?` (`false | ColorGamut`): The colors the value can hold. A drag can go past the edge, and the value is the closest color inside it; once the drag ends, the picker moves there too. `"p3"` allows wide-gamut screens' colors, and `false` any color.
- `disabled?` (`boolean`): Disables every part: they can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the parts focusable and the value submitted, but stops changes.
- `required?` (`boolean`): Marks it required, with `data-required`. A color picker always has a value, so it never blocks a form.
- `name?` (`string`): The name the value submits under. Without one, the picker submits nothing.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`{ getValue: () => string; setValue: (value: string, options?: ColorPickerChangeOptions) => boolean; focus: () => void; }`): Sets the value from anywhere. Create one with `createColorPickerController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ColorPickerArea

- `x?` (`ColorChannel`): The channel across, left to right.
- `y?` (`ColorChannel`): The channel up, bottom to top.

### ColorPickerSlider

- `channel?` (`ColorChannel`): The channel the slider edits, like `"hue"` or `"alpha"`.
- `orientation?` (`"horizontal" | "vertical"`): The slider's axis. Vertical sliders grow upward.

### ColorPickerChannelInput

- `channel?` (`ColorChannel`): The channel the input edits, like `"hue"` or `"alpha"`.

### ColorPickerSwatchItem

- `value` (`string`): The color it picks, as any CSS color.

### State

What render functions, state-based class names and slots receive. Every part gets the picker's state.

- `value` (`string`): The value, as a CSS color.
- `color` (`Color`): The color the parts show, in the picker's space. During a drag it can be outside the gamut.
- `space` (`ColorPickerSpace`): The space the parts edit in.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: the parts stay focusable, but nothing changes the value.
- `required` (`boolean`): Whether it's marked required.
- `outOfGamut` (`boolean`): Whether the color the parts show is outside the gamut, so the value is the closest one inside.

Sliders and their thumbs add their channel:

- `value` (`string`): The value, as a CSS color.
- `color` (`Color`): The color the parts show, in the picker's space. During a drag it can be outside the gamut.
- `space` (`ColorPickerSpace`): The space the parts edit in.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: the parts stay focusable, but nothing changes the value.
- `required` (`boolean`): Whether it's marked required.
- `outOfGamut` (`boolean`): Whether the color the parts show is outside the gamut, so the value is the closest one inside.
- `channel` (`ColorChannel`): The channel the slider edits.
- `channelValue` (`number`): The channel's value, in the units people read it in: degrees, percentages, 0 to 255 for red.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.

Preset items have their own:

- `selected` (`boolean`): Whether the picker's color looks the same as this swatch's, whatever each is written in.
- `disabled` (`boolean`): Whether pressing it changes nothing, since the picker is disabled or read-only.

### Reasons

`details.reason` says why the value changed.

- `track-press` (`PointerEvent`): A press on a slider's track or an area's surface moved the nearest thumb there.
- `drag` (`PointerEvent`): A slider thumb or a resize handle was dragged, or an item was dragged to a new place in a list.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `input-commit` (`KeyboardEvent | FocusEvent`): Enter, or leaving a number input, committed what was typed: a number input parses, clamps and snaps it to the step, and an autocomplete closes its suggestions on it.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `eye-dropper-pick`
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createColorPickerController()` and pass it as `controller`.

`setValue()` takes any CSS color and an optional `{ reason, event }`, runs the change callback like a drag, and returns `false` when the color can't be read or the change is canceled.

- `getValue()` (`() => string`): The value, as a CSS color.
- `setValue(value, options?)` (`(value: string, options?: ColorPickerChangeOptions | undefined) => boolean`): Sets the value from any CSS color, as a user would. Returns false for text that isn't one.
- `focus()` (`() => void`): Moves focus to the area's thumb, or the first slider's.

### Events

Callbacks get the new value first, then the details.

| Prop            | On            | Receives                                                                                |
| --------------- | ------------- | --------------------------------------------------------------------------------------- |
| `onValueChange` | `ColorPicker` | `(value, details)`: the new value, the [reason](#reasons) and `details.color`           |
| `onValueCommit` | `ColorPicker` | `(value, details)`: the value once the interaction ends, its reason and `details.color` |

## Accessibility

No WAI-ARIA pattern covers a color picker, so it's built from ones that do. The picker is a group. The area's thumb and each slider's thumb follow the [WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), and the area's thumb names both of its channels, like "Saturation 76%, Brightness 96%". The presets follow the [listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), and each one is named by its color, like "vivid red", as is `ColorPickerSwatch`.

The thumbs, inputs and presets are named in English by default. Pass `aria-label` to name them in another language.

### Keyboard

| Key                  | Does                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Arrow keys           | Move a thumb one step. On the area, Left and Right move across, Up and Down move up and down. |
| Shift with an arrow  | Moves ten steps                                                                               |
| Page Up or Page Down | Moves a tenth of the range, up the area or along a slider                                     |
| Home or End          | Moves to the start or end, across the area or along a slider                                  |
| Enter                | Reads the text in the input, or picks the focused preset                                      |
| Escape               | Puts the input's text back to the value                                                       |

Each key press commits, like the end of a drag.

### Tested Behavior

Every line below is an automated test.

**Value**

- The parts show the default value.
- A press on the area moves the color there, and commits when it lifts.
- A drag along a slider follows the pointer and commits once.
- The text input reads any CSS color on Enter, and text that isn't one goes back.
- A channel input sets its channel in its own units.
- A controller sets the value, and a canceled change keeps it.

**Keyboard**

- Arrows step a slider, Shift ten steps, and each press commits.
- Arrows move the area's thumb on both axes.
- Swatches are one tab stop, arrows move between them, and a press picks one.

**Forms**

- The value submits under its name, and a reset returns to the default.
- A disabled picker can't be focused or changed, and submits nothing.

**Gamut**

- In OKLCH, a color past the sRGB edge writes the closest one inside, and the thumb moves there once it lifts.
- The canvas paints the area, with the colors outside the gamut left clear.

Runs in React, Vue and web components.
