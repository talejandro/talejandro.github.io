# Slider

Adjust a number or a range with draggable thumbs and keyboard controls.

Use a slider to pick a number or a range along a scale, like a volume or a price range, by dragging a thumb or with the arrow keys.

<ComponentExample
  name="slider/basic"
  inspect
  caption="Drag the thumb, or focus it and use the arrow keys, to adjust Volume."
/>

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Slider`:

```text
Slider
├── SliderValue
└── SliderControl
    └── SliderTrack
        ├── SliderIndicator
        └── SliderThumb
```

A control handles presses around the track. Put a thumb on that track for each value.

- **Slider** holds the value and is a group around the thumbs.
- **SliderControl** is where presses land. Pressing it moves the nearest thumb and starts a drag. Give it some height around a thin track.
- **SliderTrack** is the rail the thumbs move along. Thumbs and the indicator are placed in percentages of it with inline styles, so give it a size. It's the positioned box.
- **SliderIndicator** fills the track up to a single thumb, or between the first and last thumb of a range.
- **SliderThumb** is what you drag. Give each one a size.
- **SliderValue** shows the formatted value, and a range joined with an en dash. It's optional.

Each thumb renders a visually hidden `<input type="range">` inside itself. That input is what takes focus, so
screen readers on phones adjust it with their own gestures. Style focus on the thumb with `:has(:focus-visible)`.
The slider also renders a hidden input that the form submits.

A single thumb is named by a `FieldLabel` in a `Field`, or by `aria-label` on the thumb. In a range, give
each thumb its own `aria-label`, like "Minimum price", and name the group with a `FieldLabel` or
`aria-label` on the slider.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  Slider,
  SliderValue,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
} from "@ui-sdk/react/slider"

function VolumeSlider() {
  return (
    <Slider defaultValue={50}>
      <SliderValue />
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  )
}

export { VolumeSlider }
```

## Range

Pass an array for a range, then render one thumb per number. Give each thumb its `index`, from 0, and its own name, like "Minimum price". The indicator fills the space between the first and the last thumb, and the `FieldLabel` names the group.

```tsx title="range.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={[25, 50]}
        step={5}
        format={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
      >
        <div data-slot="row">
          <FieldLabel>Price</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Minimum price" />
            <SliderThumb index={1} aria-label="Maximum price" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
```

Move either end of Price. The thumbs stay in order.

## Multiple Thumbs

Any number of thumbs works the same way. They never pass each other, and a press on the track moves the nearest one.

```tsx title="multiple.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

const thumbs = ["Low", "Medium", "High"]

function Example() {
  return (
    <Field>
      <Slider defaultValue={[10, 20, 70]} step={10} format={{ style: "unit", unit: "percent" }}>
        <div data-slot="row">
          <FieldLabel>Alert thresholds</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            {thumbs.map((label, index) => (
              <SliderThumb key={label} index={index} aria-label={label} />
            ))}
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
```

Adjust Low, Medium and High independently, without moving one past another.

## Vertical

Set `orientation="vertical"` and give the slider a height. The bottom is the minimum, ArrowUp increases the value, and every part gets `data-orientation`, so `[data-orientation="vertical"]` styles the vertical axis.

```tsx title="vertical.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"

const channels = [
  { label: "Bass", value: 50 },
  { label: "Treble", value: 25 },
]

function Example() {
  return (
    <div data-slot="row">
      {channels.map((channel) => (
        <Field key={channel.label}>
          <Slider orientation="vertical" defaultValue={channel.value}>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </Slider>
          <FieldLabel>{channel.label}</FieldLabel>
        </Field>
      ))}
    </div>
  )
}

export { Example }
```

Drag up or down, or use the arrow keys, to adjust Bass and Treble.

## Field

Put the slider in a `Field`. The label names the thumb, the description describes it, and `SliderValue` shows the value beside the label. Screen readers don't announce `SliderValue` as it changes, since the thumb already says its value.

```tsx title="field.tsx"
"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider defaultValue={0.3} format={{ style: "percent" }} min={0} max={1} step={0.01}>
        <div data-slot="row">
          <FieldLabel>Volume</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <FieldDescription>How loud notifications play.</FieldDescription>
    </Field>
  )
}

export { Example }
```

Click the Volume label to focus the thumb, then use the arrow keys to change the value.

## Disabled

Set `disabled`. A disabled slider can't be focused or moved, and isn't submitted. A disabled `<fieldset>` around it disables it too.

```tsx title="disabled.tsx"
"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider defaultValue={50} disabled>
        <div data-slot="row">
          <FieldLabel>Brightness</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <FieldDescription>Managed by your organization.</FieldDescription>
    </Field>
  )
}

export { Example }
```

Brightness keeps its value, but can't be focused or dragged.

## Controlled

Pass `value` and `onValueChange` to control the slider. The value keeps its shape: a number stays a number and an array stays an array. Every change carries a [reason](#reasons), like `drag`, `track-press` or `step-key`, and `details.thumb` says which thumb moved. Call `details.cancel()` to keep the current value.

```tsx title="controlled.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState([0.3, 0.7])

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue([0.3, 0.7])}>
          Reset
        </button>
      </div>
      <Field>
        <Slider
          value={value}
          onValueChange={(next, details) => {
            setValue(next)
            log(`${next.join(" – ")} (${details.reason})`)
          }}
          min={0}
          max={1}
          step={0.1}
        >
          <div data-slot="row">
            <FieldLabel>Temperature</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb index={0} aria-label="Minimum temperature" />
              <SliderThumb index={1} aria-label="Maximum temperature" />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Field>
    </div>
  )
}

export { Example }
```

Drag either Temperature thumb to log the range and its reason. Reset sets the value from outside.

## Step and Bounds

`min` and `max` set the bounds, 0 and 100 by default, and `step` sets how far one step moves, counted from `min`. Decimal steps avoid floating-point drift, so a 0.1 step can reach 0.3 cleanly. When the steps from `min` don't land on `max`, the highest step below it is the end.

```tsx title="step.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Ticks({ count }: { count: number }) {
  return (
    <div data-slot="ticks" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  )
}

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <Slider defaultValue={2010} min={1990} max={2030} step={5} format={{ useGrouping: false }}>
          <div data-slot="row">
            <FieldLabel>Year</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
          <Ticks count={9} />
        </Slider>
      </Field>
      <Field>
        <Slider defaultValue={0.5} min={0} max={1} step={0.05}>
          <div data-slot="row">
            <FieldLabel>Opacity</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
          <Ticks count={21} />
        </Slider>
      </Field>
    </div>
  )
}

export { Example }
```

Move Year in steps of five, and Opacity in steps of 0.05.

## Large Step

Arrow keys move one step. Page Up, Page Down and Shift with an arrow key move by `largeStep`, which is ten steps unless you set it. Home and End go to the bounds.

```tsx title="large-step.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={100}
        min={25}
        max={400}
        largeStep={25}
        format={{ style: "unit", unit: "percent" }}
      >
        <div data-slot="row">
          <FieldLabel>Zoom</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
```

Focus Zoom and press an arrow key to move 1%, then Page Up, Page Down or Shift with an arrow key to move 25%.

## Distance Between Thumbs

Set `minStepsBetweenThumbs` to keep neighbouring thumbs that many steps apart. A thumb stops at its neighbour, and Home and End move it only as far as its neighbour allows.

```tsx title="min-steps.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

const time = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`

function Example() {
  return (
    <Field>
      <Slider
        defaultValue={[540, 1020]}
        min={0}
        max={1440}
        step={15}
        minStepsBetweenThumbs={16}
        format={time}
      >
        <div data-slot="row">
          <FieldLabel>Opening hours</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Opens" />
            <SliderThumb index={1} aria-label="Closes" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
```

Move either end of Opening hours. The thumbs stay at least four hours apart.

## Format and Locale

`format` takes `Intl.NumberFormat` options, like `{ style: "currency", currency: "USD" }` or `{ style: "percent" }`, or a function of the value. It sets what `SliderValue` shows and what screen readers announce for each thumb, while the value stays a plain number. `locale` sets separators, digits and symbol placement. Without it, the slider uses the page's `lang`, or the browser's language, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.

```tsx title="format.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

const sliders = [
  {
    label: "Budget",
    defaultValue: 40,
    max: 100,
    step: 1,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  {
    label: "Opacity",
    defaultValue: 0.6,
    max: 1,
    step: 0.01,
    format: { style: "percent" },
  },
  {
    label: "Weight",
    defaultValue: 20,
    max: 50,
    step: 0.5,
    format: { style: "unit", unit: "kilogram" },
  },
  {
    label: "Duration",
    defaultValue: 90,
    max: 600,
    step: 15,
    format: (seconds: number) =>
      `${Math.floor(seconds / 60)} min ${seconds % 60} s`,
  },
  {
    label: "Preis",
    defaultValue: 40,
    max: 100,
    step: 1,
    format: { style: "currency", currency: "EUR" },
    locale: "de-DE",
  },
] satisfies {
  label: string
  defaultValue: number
  max: number
  step: number
  format: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

function Example() {
  return (
    <div data-slot="stack">
      {sliders.map(({ label, ...options }) => (
        <Field key={label}>
          <Slider {...options}>
            <div data-slot="row">
              <FieldLabel>{label}</FieldLabel>
              <SliderValue />
            </div>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </Field>
      ))}
    </div>
  )
}

export { Example }
```

Adjust Budget, Opacity, Weight, Duration and Preis to compare currency, a percentage, a unit, a custom function and German formatting.

## Saving on Commit

`onValueChange` runs on every step of a drag. `onValueCommit` runs once, when the interaction that changed the value ends: the pointer lifts, the key comes up, or a screen reader adjusts it. Use the commit callback to save once per interaction. A press that doesn't change the value commits nothing.

```tsx title="commit.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <Slider
        defaultValue={50}
        onValueCommit={(value, details) =>
          log(`Saved ${value} (${details.reason})`)
        }
      >
        <div data-slot="row">
          <FieldLabel>Brightness</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
```

Drag Brightness and release it, or press an arrow key. The console logs the value once, when you let go.

## Controller

A controller, from `createSliderController()`, moves the slider from anywhere with `setValue()`, reads it with `getValue()` and focuses a thumb with `focus()`. Values set through it are clamped, snapped to the step and sorted, and reported with the `imperative` reason.

```tsx title="controller.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createSliderController,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [volume] = React.useState(() => createSliderController<number>())

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => volume.setValue(0)}>
          Mute
        </button>
        <button
          type="button"
          onClick={() => volume.setValue(volume.getValue() + 10)}
        >
          Louder
        </button>
        <button
          type="button"
          onClick={() => log(`Volume is ${volume.getValue()}`)}
        >
          Read
        </button>
        <button type="button" onClick={() => volume.focus()}>
          Focus
        </button>
      </div>
      <Field>
        <Slider
          defaultValue={40}
          controller={volume}
          onValueChange={(value, details) =>
            log(`Volume ${value} (${details.reason})`)
          }
        >
          <div data-slot="row">
            <FieldLabel>Volume</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Field>
    </div>
  )
}

export { Example }
```

Use Mute, Louder and Focus to operate Volume from outside the slider. The console logs each change with the imperative reason, and Read logs the value.

## Form

A hidden input beside the slider is what the form sees. It takes the slider's `name`, `form` and `disabled`, so `FormData`, `form.reset()`, a disabled `<fieldset>` and the browser's restore all work.

- **Submit:** a single thumb submits its number under `name`, like `40`. A range submits `"start/end"`, like `200/800`. Without a name, it submits nothing.
- **Reset:** a form reset returns it to `defaultValue`, with the `reset` reason.
- **Join a form from elsewhere:** set `form` to the id of a form.

`required` adds `data-required`. A slider always has a value, so it never blocks a form.

```tsx title="form.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const form = React.useId()

  return (
    <div data-slot="stack">
      <form
        id={form}
        data-slot="stack"
        onSubmit={(event) => {
          event.preventDefault()
          const data = [...new FormData(event.currentTarget)].map(
            ([name, value]) => `${name}=${value}`
          )
          log(`Submitted ${data.join(", ")}`)
        }}
      >
        <Field>
          <Slider name="price" defaultValue={[200, 800]} max={1000} step={10}>
            <div data-slot="row">
              <FieldLabel>Price</FieldLabel>
              <SliderValue />
            </div>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb index={0} aria-label="Minimum price" />
                <SliderThumb index={1} aria-label="Maximum price" />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </Field>
        <Field>
          <Slider name="rating" defaultValue={3} min={1} max={5}>
            <div data-slot="row">
              <FieldLabel>Minimum rating</FieldLabel>
              <SliderValue />
            </div>
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </Field>
      </form>
      <Field>
        <Slider
          name="distance"
          form={form}
          defaultValue={25}
          max={100}
          step={5}
          format={{ style: "unit", unit: "kilometer" }}
        >
          <div data-slot="row">
            <FieldLabel>Distance</FieldLabel>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </Field>
      <div data-slot="row">
        <button type="submit" form={form} data-variant="solid">
          Save
        </button>
        <button type="reset" form={form}>
          Reset
        </button>
      </div>
    </div>
  )
}

export { Example }
```

Adjust the filters and press Save to log the submitted values. Distance sits outside the form and joins it by id. Reset restores the defaults.

## Read-Only

Set `readOnly` to keep the slider focusable and submitted, while drags, keys and screen reader adjustments leave its value alone.

```tsx
<Field>
  <FieldLabel>Storage</FieldLabel>
  <Slider name="storage" defaultValue={50} readOnly>
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb />
      </SliderTrack>
    </SliderControl>
  </Slider>
  <FieldDescription>Set by your plan.</FieldDescription>
</Field>
```

## Custom Rendering

Every part takes `render`, to render a different element or component in its place. `render`, `className` and `children` can be functions of the part's state, like whether a thumb is being dragged, its `thumbValue` and its `percent` along the track. Here the thumb's children add a bubble with its value, and `SliderValue`'s children add a percent sign.

```tsx title="render.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider"

function Example() {
  return (
    <Field>
      <Slider defaultValue={60}>
        <div data-slot="row">
          <FieldLabel>Brightness</FieldLabel>
          <SliderValue>{(state) => `${state.text}%`}</SliderValue>
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb render={<span />}>
              {(state) => <span data-slot="output">{state.thumbValue}</span>}
            </SliderThumb>
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  )
}

export { Example }
```

Focus or drag the Brightness thumb to show its value above it.

See [Parts and Composition](../parts-and-composition.md) for the rendering contract and [State](#state) for each part's fields.

## Styling

Parts are unstyled, apart from the positions they need: thumbs and the indicator get `position: absolute` and their place along the track in percent, as inline styles. Give the control some height around a thin track, the track a size and a background, and each thumb a size. The thumb's range input is what takes focus, so draw the focus ring on the thumb with `:has(:focus-visible)`, and style a drag with `data-dragging`.

Each part has a `data-slot`, such as `slider-thumb`, and its state attributes are listed under [Data Attributes](#data-attributes).

The indicator and thumbs also write CSS variables, for anything else that should follow them, like a label above a thumb.

### SliderIndicator
- `--slider-indicator-start`: Where the indicator starts along the track, as a percentage. 0% for a single thumb.
- `--slider-indicator-size`: How much of the track the indicator covers, as a percentage.

### SliderThumb
- `--slider-thumb-position`: Where the thumb sits along the track, as a percentage from the start. Use it for a label that follows the thumb.

## Data Attributes

### Slider
`[data-slot="slider"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### SliderValue
`[data-slot="slider-value"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### SliderControl
`[data-slot="slider-control"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### SliderTrack
`[data-slot="slider-track"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### SliderIndicator
`[data-slot="slider-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while a thumb is being dragged.

### SliderThumb
`[data-slot="slider-thumb"]`

- `data-orientation` (`horizontal`, `vertical`): The slider's axis.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-index` (`0`, `1`): Which value the thumb shows, from 0.
- `data-dragging`: Present while this thumb is being dragged.

## API Reference

Props and callbacks are the same as below, as React props.

### Slider

- `value?` (`Value`): The value: a number for one thumb, or an array with one number per thumb, like `[20, 80]` for a range. Pass it to control the slider.
- `defaultValue?` (`Value`): The value at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`((value: Value, details: SliderValueChangeDetails) => void)`): Runs while the value changes: on every step of a drag or a key. `details.thumb` says which thumb moved, and `details.cancel()` stops it.
- `onValueCommit?` (`((value: Value, details: SliderValueCommitDetails) => void)`): Runs once an interaction that changed the value ends: the pointer lifts, the key comes up, or a screen reader adjusts it. For saving.
- `min?` (`number`): The lowest value.
- `max?` (`number`): The highest value. When the steps from `min` don't land on it, the highest step below it is the end.
- `step?` (`number`): How far one step moves, from `min`.
- `largeStep?` (`number`): How far Page Up, Page Down and Shift with an arrow key move.
- `minStepsBetweenThumbs?` (`number`): How many steps apart neighbouring thumbs stay. Thumbs never pass each other.
- `orientation?` (`"horizontal" | "vertical"`): The slider's axis. Vertical sliders grow upward.
- `disabled?` (`boolean`): Disables it like a native control: thumbs can't be focused or moved, and nothing is submitted.
- `readOnly?` (`boolean`): Keeps it focusable and submitted, but stops drags, keys and screen reader adjustments from changing it.
- `required?` (`boolean`): Marks it required, with `data-required`. A slider always has a value, so it never blocks a form.
- `name?` (`string`): The name it submits under: the number, or a range as `"start/end"`. Without one, it submits nothing.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `format?` (`NumberFormat`): How values read, for screen readers and `SliderValue`: `Intl.NumberFormat` options, like `{ style: "currency", currency: "EUR" }`, or a function of the value.
- `locale?` (`string`): The locale values are formatted in. Defaults to the page's `lang`, or the browser's language without one, once the page is interactive. Server markup uses English until then, so it never disagrees with the client.
- `controller?` (`{ getValue: () => Value; setValue(value: Value, options?: SliderChangeOptions): boolean; focus: (thumb?: number) => void; }`): Moves the slider from anywhere. Create one with `createSliderController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### SliderThumb

- `index?` (`number`): Which value the thumb shows, from 0. Give each thumb of a range its own.

### State

What render functions, state-based class names and slots receive. Every part gets the slider's state.

- `value` (`number | number[]`): The value: a number, or one number per thumb.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but drags and keys don't change it.
- `required` (`boolean`): Whether it's marked required.
- `dragging` (`boolean`): Whether a thumb is being dragged.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.

Thumbs add their own fields, and have their own value, `thumbValue`, in place of the whole `value`, so a thumb renders only when its own value moves:

- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but drags and keys don't change it.
- `required` (`boolean`): Whether it's marked required.
- `dragging` (`boolean`): Whether a thumb is being dragged.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.
- `index` (`number`): Which value the thumb shows.
- `thumbValue` (`number`): The thumb's own value.
- `percent` (`number`): Where the thumb sits, from 0 to 100.

`SliderValue` adds the formatted text:

- `value` (`number | number[]`): The value: a number, or one number per thumb.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but drags and keys don't change it.
- `required` (`boolean`): Whether it's marked required.
- `dragging` (`boolean`): Whether a thumb is being dragged.
- `orientation` (`"horizontal" | "vertical"`): The slider's axis.
- `text` (`string`): The formatted value, a range joined with an en dash.

### Reasons

`details.reason` says why the value changed.

- `track-press` (`PointerEvent`): A press on a slider's track or an area's surface moved the nearest thumb there.
- `drag` (`PointerEvent`): A slider thumb or a resize handle was dragged, or an item was dragged to a new place in a list.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `accessibility-adjust` (`Event`): A screen reader's adjust gesture, like a swipe up or down on a slider.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createSliderController()` and pass it as `controller`.

`setValue()` takes an optional `{ reason, event }`, runs the change callback like a drag, and returns `false` when the change is canceled.

- `getValue()` (`() => Value`): The value: a number, or one number per thumb.
- `setValue(value, options?)` (`(value: Value, options?: SliderChangeOptions | undefined) => boolean`): Sets the value, as a user would. It's clamped, snapped to the step and sorted.
- `focus(thumb?)` (`(thumb?: number | undefined) => void`): Moves focus to a thumb, the first by default.

### Events

Callbacks get the new value first, then the details.

| Prop            | On       | Receives                                                                                |
| --------------- | -------- | --------------------------------------------------------------------------------------- |
| `onValueChange` | `Slider` | `(value, details)`: the new value, the [reason](#reasons) and `details.thumb`           |
| `onValueCommit` | `Slider` | `(value, details)`: the value once the interaction ends, its reason and `details.thumb` |

## Accessibility

The slider follows the [WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), and the [multi-thumb slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) for ranges. Each thumb is a native range input, named by a `FieldLabel` or its own `aria-label`, and the slider is a group around them.

### Keyboard

Focus a thumb to use these keys. Tab moves through the thumbs in order.

| Key                                        | Moves the thumb                                                       |
| ------------------------------------------ | --------------------------------------------------------------------- |
| ArrowRight or ArrowUp                      | One `step` up. In right to left, ArrowRight moves down.               |
| ArrowLeft or ArrowDown                     | One `step` down. In right to left, ArrowLeft moves up.                |
| Page Up, Page Down, or Shift with an arrow | By `largeStep`, ten steps by default.                                 |
| Home or End                                | To the minimum or maximum, or as far as a neighbouring thumb lets it. |

### Tested Behavior

Every line below is an automated test.

**Keyboard**

- Starts at its default value.
- ArrowRight and ArrowUp increase it by one step.
- ArrowLeft and ArrowDown decrease it by one step.
- Page Up and Page Down move by the large step.
- Shift with an arrow key moves by the large step.
- Home and End go to the minimum and the maximum.
- A value never goes past the bounds.
- Tab moves through the thumbs in order.
- Home and End move a range thumb as far as its neighbour.
- A range thumb stops at its neighbour.
- A canceled change keeps the value.
- A controlled slider follows its value.

**Pointer**

- Pressing the track moves the thumb there.
- Pressing the track focuses the thumb.
- Pressing a range's track moves the nearest thumb.
- Dragging a thumb follows the pointer.
- Grabbing a thumb off center doesn't move it.
- Dragging past the end stops at the bound.
- Dragging continues outside the slider.
- Dragging right from stacked thumbs moves the upper one.
- The value commits once, when the pointer lifts.
- A screen reader's adjustment reaches the form as one input and one change.
- A drag sends input as it moves, and change once when the pointer lifts.
- Pressing a thumb without moving commits nothing.
- A press on the track commits.
- The thumb sits at its value along the track.

**Vertical**

- It says it's vertical.
- ArrowUp increases it and ArrowDown decreases it.
- The bottom is the minimum.
- Dragging up increases it.

**Value and state**

- The value part shows the value, and a range joined with a dash.
- The value reads in the format and the locale.
- A disabled slider can't be focused or changed.
- Its parts say when it's dragged.
- A single slider submits its value under its name.

Runs in React, Vue and web components.

Beyond the pattern:

- A dragged range thumb stops at its neighbour, as the APG's multi-thumb slider says.
- Each range thumb's own range ends at its neighbour.
- A form reset returns every slider to its default.
- Holding an arrow key commits once, when the key comes up.
- Dragging left from stacked thumbs moves the lower one.
- Pressing the track beside stacked thumbs moves the one on that side.
- A key moves a thumb as close to its neighbour as the minimum distance allows.
- Touch drags on the control never scroll the page.
- A range submits one start/end value.
- Clicking a range's label focuses its first thumb.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while moving to a slider with a keyboard.
- A range thumb announces how far it can go and its formatted value.

Runs in React, Vue and web components.
