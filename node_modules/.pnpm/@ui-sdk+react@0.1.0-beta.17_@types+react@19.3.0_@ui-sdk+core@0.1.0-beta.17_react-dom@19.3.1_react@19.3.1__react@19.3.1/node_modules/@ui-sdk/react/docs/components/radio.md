# Radio

Choose one option, move the selection with arrow keys, and submit it with a form.

Use radios for a short list of choices where only one can be picked, like a shipping speed or a plan. The group keeps one value and gives the whole list a single tab stop.

```tsx title="basic.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const speeds = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Shipping speed</FieldLabel>
      <RadioGroup defaultValue="standard">
        {speeds.map((speed) => (
          <label data-slot="label" key={speed.value}>
            <Radio value={speed.value}>
              <RadioIndicator />
            </Radio>
            {speed.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

Choose Express, then use the arrow keys to move the selection between speeds.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `RadioGroup`:

```text
RadioGroup
├── Radio
│   └── RadioIndicator
└── Radio
    └── RadioIndicator
```

Give each radio a `value` and wrap it with its text in a label. The group's value is the checked radio's value, and the indicator shows while its radio is checked.

## Usage

Import the parts and put them together:

```tsx
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

function Example() {
  return (
    <Field>
      <FieldLabel>Shipping speed</FieldLabel>
      <RadioGroup defaultValue="standard">
        <label>
          <Radio value="standard">
            <RadioIndicator />
          </Radio>
          Standard
        </label>
        <label>
          <Radio value="express">
            <RadioIndicator />
          </Radio>
          Express
        </label>
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

The field's label names the group. Without a field, name it with `aria-label` or `aria-labelledby`. Without `defaultValue`, nothing starts checked and Tab enters on the first enabled radio.

## Description

Put each radio in its own `Field` with a `FieldLabel` and `FieldDescription` when an option needs more explanation. That field connects both to its radio, while the outer field still names the group.

```tsx title="description.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const frequencies = [
  { value: "instant", label: "Instantly", description: "An email right away." },
  {
    value: "daily",
    label: "Daily digest",
    description: "One email each morning.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "A summary every Monday.",
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Email notifications</FieldLabel>
      <RadioGroup defaultValue="daily">
        {frequencies.map((frequency) => (
          <Field key={frequency.value}>
            <Radio value={frequency.value}>
              <RadioIndicator />
            </Radio>
            <div data-slot="stack">
              <FieldLabel>{frequency.label}</FieldLabel>
              <FieldDescription>{frequency.description}</FieldDescription>
            </div>
          </Field>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

Choose Weekly digest by its label. Each radio is also described by the line under it.

## Choice Card

Wrap an option's content in its label to make the whole card clickable. `:has([data-checked])` lets the card reflect the radio inside it.

```tsx title="choice-card.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const plans = [
  {
    value: "hobby",
    label: "Hobby",
    description: "Free for personal projects.",
  },
  {
    value: "pro",
    label: "Pro",
    description: "$20 per month for growing teams.",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom pricing and support.",
  },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Plan</FieldLabel>
      <RadioGroup defaultValue="hobby">
        {plans.map((plan) => (
          <label data-slot="card" key={plan.value}>
            <span data-slot="stack">
              <span>{plan.label}</span>
              <span data-slot="hint">{plan.description}</span>
            </span>
            <Radio value={plan.value}>
              <RadioIndicator />
            </Radio>
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

Click anywhere on the Pro card to choose it. Arrow keys move the selection between cards too.

## Fieldset and Legend

Use `FieldSet` and `FieldLegend` to describe a set of choices together. Connect the group to the legend with `aria-labelledby`, and to the description with `aria-describedby`.

```tsx title="legend.tsx"
"use client"

import { FieldDescription, FieldLegend, FieldSet } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import * as React from "react"

const periods = [
  { value: "monthly", label: "Monthly", price: "$12 per month" },
  { value: "yearly", label: "Yearly", price: "$120 per year" },
]

function Example() {
  const id = React.useId()
  return (
    <FieldSet>
      <FieldLegend id={`${id}-legend`}>Billing period</FieldLegend>
      <FieldDescription id={`${id}-description`}>
        Yearly billing gets you two months free.
      </FieldDescription>
      <RadioGroup
        defaultValue="monthly"
        aria-labelledby={`${id}-legend`}
        aria-describedby={`${id}-description`}
      >
        {periods.map((period) => (
          <label data-slot="label" key={period.value}>
            <Radio value={period.value}>
              <RadioIndicator />
            </Radio>
            {period.label}
            <span data-slot="hint">({period.price})</span>
          </label>
        ))}
      </RadioGroup>
    </FieldSet>
  )
}

export { Example }
```

Choose Yearly. The legend and the line under it describe both billing periods.

## Disabled

Set `disabled` on the group or on one radio. Disabled radios can't be focused or checked, and arrow keys skip them. A disabled fieldset disables the group too, and a disabled group submits nothing.

```tsx title="disabled.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const backups = [
  { value: "hourly", label: "Hourly", disabled: true },
  { value: "daily", label: "Daily", disabled: false },
  { value: "weekly", label: "Weekly", disabled: false },
]

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <FieldDescription>Set by your organization.</FieldDescription>
        <RadioGroup defaultValue="light" disabled>
          {themes.map((theme) => (
            <label data-slot="label" key={theme.value}>
              <Radio value={theme.value}>
                <RadioIndicator />
              </Radio>
              {theme.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
      <Field>
        <FieldLabel>Backups</FieldLabel>
        <FieldDescription>Hourly backups need the Pro plan.</FieldDescription>
        <RadioGroup defaultValue="daily">
          {backups.map((backup) => (
            <label data-slot="label" key={backup.value}>
              <Radio value={backup.value} disabled={backup.disabled}>
                <RadioIndicator />
              </Radio>
              {backup.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}

export { Example }
```

The Theme group is disabled. In Backups, Hourly is disabled, so the arrow keys move between Daily and Weekly.

## Read-Only

Set `readOnly` on the group to keep its value while still letting people focus and read the options. Arrow keys move focus without checking anything, and the value still submits with a form.

```tsx title="read-only.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Your plan</FieldLabel>
      <FieldDescription>Ask an admin to change plans.</FieldDescription>
      <RadioGroup defaultValue="pro" readOnly>
        {plans.map((plan) => (
          <label data-slot="label" key={plan.value}>
            <Radio value={plan.value}>
              <RadioIndicator />
            </Radio>
            {plan.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

Click Team, or focus Pro and press the Down arrow. Pro stays checked.

## Controlled

Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the callback to keep the current value. A [controller](#controller) from `createRadioGroupController()` checks a radio from anywhere, like the Choose Team button below. Create one controller per mounted group.

```tsx title="controlled.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createRadioGroupController,
  Radio,
  RadioGroup,
  RadioIndicator,
} from "@ui-sdk/react/radio"
import * as React from "react"
import { useLog } from "./log"

type Plan = "starter" | "pro" | "team"

const plans: { value: Plan; label: string }[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
]

function Example() {
  const log = useLog()
  const [planGroup] = React.useState(() => createRadioGroupController<Plan>())
  const [value, setValue] = React.useState<Plan | null>("pro")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => planGroup.setValue("team")}>
          Choose Team
        </button>
      </div>
      <Field>
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup
          value={value}
          onValueChange={(next, details) => {
            setValue(next)
            log(
              `${plans.find((plan) => plan.value === next)?.label ?? "None"} (${details.reason})`
            )
          }}
          controller={planGroup}
        >
          {plans.map((plan) => (
            <label data-slot="label" key={plan.value}>
              <Radio value={plan.value}>
                <RadioIndicator />
              </Radio>
              {plan.label}
            </label>
          ))}
        </RadioGroup>
      </Field>
    </div>
  )
}

export { Example }
```

Choose Starter, then press Choose Team. The console logs each change and its reason.

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Form

Each radio renders a button with the `radio` role and a hidden native radio, so the group takes part in forms. Set `name` to submit the checked value; the group submits nothing without a name or a checked radio. `required` blocks submission until there's a choice, and a reset returns to `defaultValue`.

Set `form` to a form's id to join it from elsewhere on the page, as this group does.

```tsx title="form.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import * as React from "react"
import { useLog } from "./log"

const speeds = [
  { value: "standard", label: "Standard", detail: "Free, 5 to 7 days" },
  { value: "express", label: "Express", detail: "$9, 2 days" },
  { value: "overnight", label: "Overnight", detail: "$24, next day" },
]

function Example() {
  const log = useLog()
  const id = React.useId()

  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Shipping speed</FieldLabel>
        <RadioGroup name="shipping" form={`${id}-checkout`} required defaultValue="standard">
          {speeds.map((speed) => (
            <label data-slot="label" key={speed.value}>
              <Radio value={speed.value}>
                <RadioIndicator />
              </Radio>
              {speed.label}
              <span data-slot="hint">({speed.detail})</span>
            </label>
          ))}
        </RadioGroup>
      </Field>
      <form
        data-slot="row"
        id={`${id}-checkout`}
        onSubmit={(event) => {
          event.preventDefault()
          log(
            `Submitted shipping=${new FormData(event.currentTarget).get("shipping")}`
          )
        }}
      >
        <button type="submit" data-variant="solid">
          Continue
        </button>
        <button type="reset">Reset</button>
      </form>
    </div>
  )
}

export { Example }
```

Choose Express and press Continue. The console logs the submitted value, and Reset returns the choice to Standard.

## Validation

Put a required group in a [Field](./field.md) with a `FieldError`. Submitting without a choice shows the error under the group and moves focus to it. The [Forms guide](../forms.md) covers the shared field behavior.

```tsx title="invalid.tsx"
"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import { useLog } from "./log"

const channels = [
  { value: "email", label: "Email only" },
  { value: "sms", label: "SMS only" },
  { value: "both", label: "Email and SMS" },
]

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(`Saved updates=${new FormData(event.currentTarget).get("updates")}`)
      }}
    >
      <Field>
        <FieldLabel>Order updates</FieldLabel>
        <FieldDescription>
          Choose how we tell you about your orders.
        </FieldDescription>
        <RadioGroup name="updates" required>
          {channels.map((channel) => (
            <label data-slot="label" key={channel.value}>
              <Radio value={channel.value}>
                <RadioIndicator />
              </Radio>
              {channel.label}
            </label>
          ))}
        </RadioGroup>
        <FieldError>Choose how to get order updates.</FieldError>
      </Field>
      <div data-slot="row">
        <button type="submit" data-variant="solid">
          Save
        </button>
      </div>
    </form>
  )
}

export { Example }
```

Press Save without a choice to see the error. Choose SMS only and save again; the console logs the saved value.

## Animation

The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:

```css
[data-slot="radio-indicator"] {
  transition:
    opacity 0.15s,
    scale 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    scale: 0.5;
  }
}
```

`keepMounted` keeps the indicator in the page while unchecked, with `data-unchecked`. Here it lets a hovered option preview its dot.

```tsx title="indicator.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Theme</FieldLabel>
      <RadioGroup defaultValue="system">
        {themes.map((theme) => (
          <label data-slot="label" key={theme.value}>
            <Radio value={theme.value}>
              <RadioIndicator keepMounted />
            </Radio>
            {theme.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

Hover Light to preview its dot, then choose it. The dot scales in on Light and out of System.

## Loop

Arrow keys wrap from the last radio to the first. Set `loop` to `false` to stop at the ends.

```tsx
<RadioGroup defaultValue="low" loop={false}>
  ...
</RadioGroup>
```

## Custom Rendering

The group, radio and indicator take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the interactive element so its role, label and keyboard behavior stay connected. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```tsx title="render.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup } from "@ui-sdk/react/radio"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const options = [
  {
    value: "all",
    label: "Everything",
    description: "Every message and update.",
  },
  {
    value: "mentions",
    label: "Mentions",
    description: "Only when someone mentions you.",
  },
  { value: "none", label: "Nothing", description: "Turn notifications off." },
]

function Example() {
  const id = React.useId()
  return (
    <Field>
      <FieldLabel>Notify me about</FieldLabel>
      <RadioGroup defaultValue="mentions">
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            aria-labelledby={`${id}-${option.value}-label`}
            aria-describedby={`${id}-${option.value}-description`}
            render={(props, state) => (
              <button {...props}>
                <span data-slot="stack">
                  <span id={`${id}-${option.value}-label`}>{option.label}</span>
                  <span data-slot="hint" id={`${id}-${option.value}-description`}>
                    {option.description}
                  </span>
                </span>
                <CheckIcon aria-hidden="true" data-checked={state.checked ? "" : undefined} />
              </button>
            )}
          />
        ))}
      </RadioGroup>
    </Field>
  )
}

export { Example }
```

Choose Nothing. Each radio renders a full-width button that shows a check from its state.

## Styling

Use `data-checked` and `data-unchecked` for the checked state, and `data-disabled`, `data-readonly` and `data-required` for the rest. The indicator gets the same state attributes as its radio, and the group gets `data-disabled`, `data-readonly` and `data-required`.

Each part has a `data-slot`, such as `radio`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### RadioGroup
`[data-slot="radio-group"]`

- `data-readonly`: Present when the group is read-only.
- `data-required`: Present when the group is required.
- `data-disabled`: Present when disabled, by its own prop, the group or a `<fieldset>`.

### Radio
`[data-slot="radio"]`

- `data-checked`: Present on the checked radio.
- `data-readonly`: Present when the group is read-only.
- `data-required`: Present when the group is required.
- `data-unchecked`: Present on radios that aren't checked.
- `data-disabled`: Present when disabled, by its own prop, the group or a `<fieldset>`.

### RadioIndicator
`[data-slot="radio-indicator"]`

- `data-checked`: Present on the checked radio.
- `data-readonly`: Present when the group is read-only.
- `data-required`: Present when the group is required.
- `data-unchecked`: Present on radios that aren't checked.
- `data-disabled`: Present when disabled, by its own prop, the group or a `<fieldset>`.
- `data-starting-style`: Present for the indicator's first frame. Style the state you animate from.
- `data-ending-style`: Present while the indicator animates out. Style the state you animate to.

## API Reference

Props and callbacks are the same as below, as React props.

### RadioGroup

- `value?` (`T | null`): The checked radio's value. Pass it to control the group. `null` checks nothing.
- `defaultValue?` (`T | null`): The radio checked at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`((value: T | null, details: ChangeDetails<RadioGroupValueChangeReason>) => void)`): Runs when a user or a form reset wants to change the value. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables every radio like native ones: they can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the items focusable and the value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until an item is checked, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the group submits nothing.
- `form?` (`string`): The id of a form to belong to, when the group isn't inside that form.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `controller?` (`{ getValue: () => T | null; setValue: (value: T | null, details?: Details) => boolean; focus: () => void; }`): Checks radios from anywhere. Create one with `createRadioGroupController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### Radio

- `value` (`string`): What the group's value becomes when this item is checked.
- `disabled?` (`boolean`): Skips the item, like a disabled native radio: arrow keys pass it and it can't be focused or checked.

### RadioIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item is unchecked.

### State

What render functions, state-based class names and slots receive.

- `value` (`string | null`): The checked item's value.
- `disabled` (`boolean`): Whether the group is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only: arrow keys still move focus, but nothing changes the checked item.
- `required` (`boolean`): Whether a form won't submit until an item is checked.

- `checked` (`boolean`): Whether this item is checked.
- `disabled` (`boolean`): Whether this item is disabled, by itself, its group or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only.
- `required` (`boolean`): Whether the group is required.

- `checked` (`boolean`): Whether this item is checked.
- `disabled` (`boolean`): Whether this item is disabled, by itself, its group or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only.
- `required` (`boolean`): Whether the group is required.

### Reasons

`details.reason` says why the checked value changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createRadioGroupController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs the change callback like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T | null`): The checked radio's value.
- `setValue(value, details?)` (`(value: T | null, details?: RadioGroupChangeOptions | undefined) => boolean`): Checks a radio, as a user would. Disabled radios and read-only groups ignore it.
- `focus()` (`() => void`): Moves focus to the checked radio, or the first one.

### Events

Callbacks get the new value first, then the details.

| Prop            | On           | Receives                                                          |
| --------------- | ------------ | ----------------------------------------------------------------- |
| `onValueChange` | `RadioGroup` | `(value, details)`: the checked value, and the [reason](#reasons) |

## Accessibility

Radio groups follow the [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), and behave like native radios that share a name. `Radio` renders a button with the `radio` role, and a hidden native radio that takes part in forms.

### Keyboard

| Key        | Does                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Tab        | Moves into the group, onto the checked radio or the first enabled one   |
| Arrow keys | Move to the next or previous radio and check it, skipping disabled ones |
| Space      | Checks the focused radio                                                |
| Enter      | Submits its form                                                        |

### Tested Behavior

Every line below is an automated test.

**Selection**

- Nothing is checked at first without a default value.
- Clicking an item checks it and unchecks the others.
- Clicking an item's label checks it.
- Clicking a disabled item does nothing.
- A change can be cancelled.

**Keyboard**

- Tab lands on the first item when nothing is checked.
- Tab lands on the checked item.
- Tab leaves the group after one stop.
- Space checks the focused item.
- ArrowDown and ArrowRight move to the next item and check it.
- ArrowUp and ArrowLeft move to the previous item and check it.
- Arrow keys skip disabled items.
- Arrow keys wrap at both ends.
- Enter never checks an item.
- Keys pressed in quick succession are never lost.
- Enter on an item submits the form.

**Read-only and disabled**

- A read-only group moves focus with arrow keys but checks nothing.
- A disabled group can't be focused or changed.
- Clicking a radio in a disabled group doesn't focus it.
- Clicking the label of a radio in a disabled group neither focuses nor checks it.

**Animation**

- The indicator animates in from its starting style.

Runs in React, Vue and web components.

In a field:

**With every radio enabled**

- Each radio is named by the label of its own field.
- The field around the group still names the group.
- Clicking a radio's label checks it and unchecks the others.
- The group keeps one tab stop.
- Arrow keys move between the radios and check them.

**A disabled radio**

- A disabled field around the first radio moves the tab stop to the next.
- Disabling the first radio after it renders moves the tab stop to the next.
- Enabling the first radio again gives it back the tab stop.

Runs in React, Vue and web components.

In right-to-left pages:

- ArrowLeft moves to the next radio and ArrowRight to the previous one.
- ArrowDown and ArrowUp keep their direction.

Runs in React, Vue and web components.
