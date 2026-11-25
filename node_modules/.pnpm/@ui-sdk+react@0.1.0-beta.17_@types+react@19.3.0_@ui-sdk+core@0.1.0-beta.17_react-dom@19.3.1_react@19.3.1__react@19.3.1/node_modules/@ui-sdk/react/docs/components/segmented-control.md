# Segmented Control

Pick one of a few options from a row of buttons, with an indicator that slides to the choice.

Use a segmented control to switch between a few views or settings, like List and Grid. It works like a radio group, with one value and a single tab stop, and its indicator slides to the checked item.

```tsx title="basic.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <Field>
      <FieldLabel>View</FieldLabel>
      <SegmentedControl defaultValue="list">
        <SegmentedControlIndicator />
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
      </SegmentedControl>
    </Field>
  )
}

export { Example }
```

Choose Grid, then use the arrow keys to move between views. The label above names the control, as in any field.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `SegmentedControl`:

```text
SegmentedControl
├── SegmentedControlIndicator
├── SegmentedControlItem
└── SegmentedControlItem
```

Give each item a `value`. The control's value is the checked item's value, and the indicator sits behind that item.

## Usage

Import the parts and put them together:

```tsx
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <SegmentedControl aria-label="View" defaultValue="list">
      <SegmentedControlIndicator />
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
    </SegmentedControl>
  )
}

export { Example }
```

Name the control with `aria-label`, or put it in a [Field](./field.md) whose label names it. Without `defaultValue`, nothing starts checked and Tab enters on the first enabled item.

## Indicator

`SegmentedControlIndicator` measures the checked item. Position it inside the control and use its [CSS variables](#styling-indicator) to draw the background that slides to the choice. It measures again when an item or the control changes size, and has no box while nothing is checked.

```css
[data-slot="segmented-control"] {
  position: relative;
  display: inline-flex;
  isolation: isolate;
}

[data-slot="segmented-control-indicator"] {
  position: absolute;
  z-index: -1;
  top: var(--segmented-control-indicator-top);
  left: var(--segmented-control-indicator-left);
  width: var(--segmented-control-indicator-width);
  height: var(--segmented-control-indicator-height);
  transition-property: top, left, width, height;
  transition-duration: 200ms;

  &[data-activation-direction="none"] {
    transition: none;
  }
}
```

Skip the transitions while `data-activation-direction` is `"none"`, so the indicator doesn't slide in on its first placement. After that it says which way the checked item moved: `left`, `right`, `up` or `down`.

## Vertical

Set `orientation="vertical"` to stack the items. Arrow keys on both axes still move between them, as in any radio group, and `data-orientation` on every part lets one stylesheet lay out both directions.

```tsx title="vertical.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <Field>
      <FieldLabel>Vertical alignment</FieldLabel>
      <SegmentedControl orientation="vertical" defaultValue="middle">
        <SegmentedControlIndicator />
        <SegmentedControlItem value="top">Top</SegmentedControlItem>
        <SegmentedControlItem value="middle">Middle</SegmentedControlItem>
        <SegmentedControlItem value="bottom">Bottom</SegmentedControlItem>
      </SegmentedControl>
    </Field>
  )
}

export { Example }
```

Choose Bottom, then press the Up arrow. The indicator follows down the column.

## Disabled

Set `disabled` on the control or on one item. Disabled items can't be focused or checked, and arrow keys skip them. A disabled control submits nothing.

```tsx title="disabled.tsx"
"use client"

import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

function Example() {
  return (
    <div data-slot="stack">
      <SegmentedControl aria-label="Theme" defaultValue="system" disabled>
        <SegmentedControlIndicator />
        <SegmentedControlItem value="light">Light</SegmentedControlItem>
        <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
        <SegmentedControlItem value="system">System</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Billing period" defaultValue="monthly">
        <SegmentedControlIndicator />
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
        <SegmentedControlItem value="lifetime" disabled>
          Lifetime
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}

export { Example }
```

The Theme control is disabled. In Billing period, Lifetime is disabled, so the arrow keys move between Monthly and Yearly.

## Controlled

Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the callback to keep the current value. A [controller](#controller) from `createSegmentedControlController()` checks an item from anywhere, like the Show Month button below. Create one controller per mounted control.

```tsx title="controlled.tsx"
"use client"

import {
  createSegmentedControlController,
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [range] = React.useState(() => createSegmentedControlController())
  const [value, setValue] = React.useState<string | null>("week")

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => range.setValue("month")}>
          Show Month
        </button>
      </div>
      <SegmentedControl
        aria-label="Range"
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(`value: ${next} (${details.reason})`)
        }}
        controller={range}
      >
        <SegmentedControlIndicator />
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}

export { Example }
```

Choose Day, then press Show Month. The console logs each change and its reason.

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Form

Each item renders a hidden native radio, so the control takes part in forms. Set `name` to submit the checked value; nothing submits without a name or a checked item. `required` blocks submission until there's a choice, `form` joins a form by its id from elsewhere on the page, and a reset returns to `defaultValue`.

```tsx title="form.tsx"
"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        log(`Saved theme=${data.get("theme")}, density=${data.get("density")}`)
      }}
    >
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <SegmentedControl name="theme" required defaultValue="system">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="light">Light</SegmentedControlItem>
          <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
          <SegmentedControlItem value="system">System</SegmentedControlItem>
        </SegmentedControl>
        <FieldDescription>
          System follows your device's setting.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Density</FieldLabel>
        <SegmentedControl name="density" defaultValue="comfortable">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
          <SegmentedControlItem value="comfortable">
            Comfortable
          </SegmentedControlItem>
        </SegmentedControl>
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

Choose Dark and Compact, then press Save. The console logs both values, and Reset returns each control to its default.

## Read-Only

Set `readOnly` to keep the value while still letting people focus the items. Arrow keys move focus without checking anything, and the value still submits with a form.

## Loop

Arrow keys wrap from the last item to the first. Set `loop` to `false` to stop at the ends.

```tsx
<SegmentedControl aria-label="View" defaultValue="list" loop={false}>
  ...
</SegmentedControl>
```

## Styling

Parts are unstyled. Use `data-checked` and `data-unchecked` for the checked item, and `data-disabled`, `data-readonly` and `data-required` for the rest. `data-orientation` is on the control and the indicator.

Each part has a `data-slot`, such as `segmented-control-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

### SegmentedControlIndicator
- `--segmented-control-indicator-left`: Distance from the control's left edge to the checked item.
- `--segmented-control-indicator-right`: Distance from the control's right edge to the checked item.
- `--segmented-control-indicator-top`: Distance from the control's top edge to the checked item.
- `--segmented-control-indicator-bottom`: Distance from the control's bottom edge to the checked item.
- `--segmented-control-indicator-width`: Width of the checked item.
- `--segmented-control-indicator-height`: Height of the checked item.

## Data Attributes

### SegmentedControl
`[data-slot="segmented-control"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the items run.
- `data-readonly`: Present when the control is read-only.
- `data-required`: Present when the control is required.
- `data-disabled`: Present when disabled, by its own prop, the control or a `<fieldset>`.

### SegmentedControlItem
`[data-slot="segmented-control-item"]`

- `data-checked`: Present on the checked item.
- `data-readonly`: Present when the control is read-only.
- `data-required`: Present when the control is required.
- `data-unchecked`: Present on items that aren't checked.
- `data-disabled`: Present when disabled, by its own prop, the control or a `<fieldset>`.

### SegmentedControlIndicator
`[data-slot="segmented-control-indicator"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the items run.
- `data-activation-direction` (`none`)

## API Reference

Props and callbacks are the same as below, as React props.

### SegmentedControl

- `value?` (`T | null`): The checked item's value. Pass it to control the segmented control. `null` checks nothing.
- `defaultValue?` (`T | null`): The item checked at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`((value: T | null, details: ChangeDetails<SegmentedControlValueChangeReason>) => void)`): Runs when a user or a form reset wants to change the value. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables every item: they can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the items focusable and the value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until an item is checked, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the segmented control submits nothing.
- `form?` (`string`): The id of a form to belong to, when the segmented control isn't inside that form.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `orientation?` (`SegmentedControlOrientation`): Which way the items run, for styling and for screen readers. Arrow keys on both axes move between items either way, as in any radio group.
- `controller?` (`{ getValue: () => T | null; setValue: (value: T | null, details?: SegmentedControlChangeOptions) => boolean; focus: () => void; }`): Checks items from anywhere. Create one with `createSegmentedControlController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### SegmentedControlItem

- `value` (`string`): What the value becomes when this item is checked.
- `disabled?` (`boolean`): Skips the item, like a disabled native radio: arrow keys pass it and it can't be focused or checked.

### State

What render functions, state-based class names and slots receive.

- `value` (`string | null`): The checked item's value.
- `disabled` (`boolean`): Whether the segmented control is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: arrow keys still move focus, but nothing changes the checked item.
- `required` (`boolean`): Whether a form won't submit until an item is checked.
- `orientation` (`SegmentedControlOrientation`): Which way the items run.

- `checked` (`boolean`): Whether this item is the control's value, which the indicator sits behind.
- `disabled` (`boolean`): Whether this item is disabled, by itself, the segmented control or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the control is read-only, so pressing this item changes nothing.
- `required` (`boolean`): Whether a form won't submit until an item is checked.

- `value` (`string | null`): The checked item's value, which the indicator sits behind.
- `orientation` (`SegmentedControlOrientation`): Which way the items run.
- `direction` (`Direction`): Which way the checked item last moved on screen, `"none"` before it first moves.

### Reasons

`details.reason` says why the checked value changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createSegmentedControlController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs the change callback like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T | null`): The checked item's value.
- `setValue(value, details?)` (`(value: T | null, details?: SegmentedControlChangeOptions | undefined) => boolean`): Checks an item, as a user would. Disabled items and read-only controls ignore it.
- `focus()` (`() => void`): Moves focus to the checked item, or the first one.

### Events

Callbacks get the new value first, then the details.

| Prop            | On                 | Receives                                                          |
| --------------- | ------------------ | ----------------------------------------------------------------- |
| `onValueChange` | `SegmentedControl` | `(value, details)`: the checked value, and the [reason](#reasons) |

## Accessibility

A segmented control is a radio group, so it follows the [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) and behaves like native radios that share a name. Each `SegmentedControlItem` renders a button with the `radio` role, and a hidden native radio that takes part in forms. The indicator is presentational, so screen readers skip it.

### Keyboard

| Key        | Does                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Tab        | Moves into the control, onto the checked item or the first enabled one |
| Arrow keys | Move to the next or previous item and check it, skipping disabled ones |
| Space      | Checks the focused item                                                |
| Enter      | Submits its form                                                       |

### Tested Behavior

Every line below is an automated test.

**Selection**

- The default item is checked, and only that one.
- Clicking an item checks it and says why.
- Clicking a disabled item does nothing.
- A change can be cancelled.
- A controller checks an item.

**Keyboard**

- Tab lands on the checked item, and the next Tab leaves.
- Arrow keys on both axes check the next item, skip disabled ones and wrap.

**Orientation**

- A segmented control is horizontal unless it says otherwise.
- A vertical segmented control reports it.

**Indicator**

- The indicator covers the checked item.
- The indicator follows the checked item.
- The indicator says which way the checked item moved, and none at first.
- The indicator covers the checked item in a vertical control.
- The indicator matches items with fractional widths exactly.
- A scaled ancestor doesn't move the indicator off fractional items.
- With nothing checked, the indicator has no box.

**Forms**

- The checked value submits under the control's name.
- A form reset checks the default item again.
- A disabled control submits nothing, and its items can't be focused or checked.

Runs in React, Vue and web components.
