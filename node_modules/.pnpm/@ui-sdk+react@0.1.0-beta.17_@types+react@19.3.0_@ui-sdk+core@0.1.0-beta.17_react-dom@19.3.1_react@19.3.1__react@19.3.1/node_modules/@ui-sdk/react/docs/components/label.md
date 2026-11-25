# Label

Name any control with a label, and let a press on the label reach it.

A plain `<label>` only reaches inputs, buttons and selects. Label names any control by its `htmlFor`, including a radio group or a slider, and a press on the label moves focus into it.

```tsx title="basic.tsx"
import { Label } from "@ui-sdk/react/label"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function Example() {
  return (
    <div data-slot="stack">
      <Label htmlFor="shipping-speed">Shipping speed</Label>
      <RadioGroup id="shipping-speed" defaultValue="standard">
        {speeds.map((speed) => (
          <Label key={speed.value}>
            <Radio value={speed.value}>
              <RadioIndicator />
            </Radio>
            {speed.label}
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

export { Example }
```

Press Shipping speed. Focus moves to the checked option, and a screen reader names the group Shipping speed.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Usage

Import the label and point its `htmlFor` at the control's `id`:

```tsx
import { Label } from "@ui-sdk/react/label"
import { Radio, RadioGroup } from "@ui-sdk/react/radio"

function Plan() {
  return (
    <>
      <Label htmlFor="plan">Plan</Label>
      <RadioGroup id="plan" defaultValue="pro">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>
    </>
  )
}

export { Plan }
```

Label renders a native `<label>`. When the browser can reach the control on its own, like an input, it does. For anything else, the control takes the label as its name, and a press on the label focuses it, checks it or clicks it, as a native label would.

Inside a [Field](./field.md), use `FieldLabel`, which also ties the field's description and errors to the control.

## Build Your Own

`@ui-sdk/react/label` comes with a ready-made Label. If you'd like to build your own, with your own name, start from the `label` primitive in `@ui-sdk/core`:

```ts title="caption.ts"
"use client"

import { label } from "@ui-sdk/core/label"
import { createParts } from "@ui-sdk/react/primitive"

const { Root: Caption } = createParts(label, { root: "label" })

export { Caption }
```

```tsx
<Caption htmlFor="plan">Plan</Caption>
```

`Caption` keeps the behavior of the ready-made Label: it names the control and reaches it on a press. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Slider

A label for a slider names its thumb, so the thumb reads as **Volume**, and a press on the label focuses it.

```tsx title="slider.tsx"
import { Label } from "@ui-sdk/react/label"
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
    <Slider id="volume" defaultValue={75}>
      <div data-slot="row">
        <Label htmlFor="volume">Volume</Label>
        <SliderValue />
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb />
        </SliderTrack>
      </SliderControl>
    </Slider>
  )
}

export { Example }
```

Press Volume, then use the arrow keys. The thumb moves, and a screen reader reads it as Volume.

## Switch

Point the label at a switch beside it. A press on the label turns the switch on and off.

```tsx title="switch.tsx"
import { Label } from "@ui-sdk/react/label"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

function Example() {
  return (
    <div data-slot="row">
      <Switch id="updates">
        <SwitchThumb />
      </Switch>
      <Label htmlFor="updates">Email me product updates</Label>
    </div>
  )
}

export { Example }
```

Press Email me product updates. The switch turns on.

## Wrapping a Control

Put the control inside the label instead of pointing at it, and you need no `id`.

```tsx title="wrap.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Label } from "@ui-sdk/react/label"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <Label>
      <Checkbox>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      Accept terms and conditions
    </Label>
  )
}

export { Example }
```

Press Accept terms and conditions. The checkbox checks, and a double click doesn't select the text.

## Custom Rendering

Pass `render` to use a different element, such as `render={<span />}`. A label that isn't a `<label>` still names its control and reaches it on a press. See [Parts and Composition](../parts-and-composition.md) for more.

## Styling

The label is unstyled. It has a `data-slot` of `label`.

A double click on the label doesn't select its text, so you don't need `user-select: none` for that.

## API Reference

Props are the same as below, as React props, along with a native label's `htmlFor`.

### Label

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

## Accessibility

A native `<label>` names the element its `for` points at only when that element is labelable, like an input or a button. Label names any other control through `aria-labelledby`, unless the control has an `aria-label` or an `aria-labelledby` of its own, which win. Its press does what a native label's does: it checks a checkbox, a switch or a radio, focuses a group's checked radio, and focuses anything else. A press on a disabled control does nothing.

### Tested Behavior

Every line below is an automated test.

- A label names a native input, and a press focuses it.
- A label names a radio group, and a press focuses its checked radio.
- A label for a slider names its thumb, and a press focuses it.
- A label around a checkbox names it, and a press toggles it.
- A press on the label of a disabled group moves no focus.
- A control its author names keeps that name.
- A label names a control that renders after it.
- A double click on a label doesn't select its text.

Runs in React, Vue and web components.
