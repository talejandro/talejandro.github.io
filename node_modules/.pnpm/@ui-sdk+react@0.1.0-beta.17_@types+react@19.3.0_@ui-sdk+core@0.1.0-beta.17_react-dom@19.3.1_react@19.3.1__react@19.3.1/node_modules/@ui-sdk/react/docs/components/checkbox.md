# Checkbox

Choose one or more options, individually or as a group.

Use a checkbox for a choice someone can check or uncheck. Use a group when several choices belong to one value.

```tsx title="basic.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <label data-slot="label">
      <Checkbox>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      Accept terms and conditions
    </label>
  )
}

export { Example }
```

Click the checkbox or its label, or focus it and press Space, to accept the terms.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Checkbox`:

```text
Checkbox
└── CheckboxIndicator
```

Wrap the checkbox and its text in a label. The indicator shows while the checkbox is checked or mixed.

## Usage

Import the parts and put them together:

```tsx
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"

function Example() {
  return (
    <label>
      <Checkbox>
        <CheckboxIndicator aria-hidden="true">✓</CheckboxIndicator>
      </Checkbox>
      Accept terms and conditions
    </label>
  )
}

export { Example }
```

## Description

Use `FieldLabel` and `FieldDescription` when a choice needs more explanation. The field connects both to the checkbox.

```tsx title="description.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <Checkbox>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      <div data-slot="stack">
        <FieldLabel>Accept terms and conditions</FieldLabel>
        <FieldDescription>
          By clicking this checkbox, you agree to the terms and conditions.
        </FieldDescription>
      </div>
    </Field>
  )
}

export { Example }
```

Click Accept terms and conditions. The field connects the label and description to the checkbox.

## Disabled

`disabled` prevents focus and changes, and leaves the checkbox out of form submissions. A disabled `fieldset` does the same.

```tsx title="disabled.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="stack">
      <label data-slot="label">
        <Checkbox defaultChecked>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        Product updates
      </label>
      <label data-slot="label">
        <Checkbox defaultChecked disabled>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        Security alerts
      </label>
    </div>
  )
}

export { Example }
```

Security alerts are always on, so that checkbox is disabled. Clicking its label leaves it checked.

## Read-Only

`readOnly` keeps the checkbox focusable and included in form submissions, while preventing the user from changing it.

```tsx title="read-only.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <Checkbox name="two-factor" defaultChecked readOnly>
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      <div data-slot="stack">
        <FieldLabel>Require two-factor authentication</FieldLabel>
        <FieldDescription>
          Your organization requires this setting.
        </FieldDescription>
      </div>
    </Field>
  )
}

export { Example }
```

Tab to the checked checkbox. Space and clicks leave the setting unchanged.

## Indeterminate

An indeterminate checkbox represents a partly checked set. It has `aria-checked="mixed"` and `data-indeterminate`. A press checks it; only your code puts it back into the mixed state.

Start with `defaultChecked="indeterminate"`, or pass `"indeterminate"` as the controlled value. The indicator's state tells it which icon to show. A [parent checkbox](#parent-checkbox) derives this state from a group for you.

```tsx
<Checkbox defaultChecked="indeterminate">
  <CheckboxIndicator>
    {(state) => (state.indeterminate ? <MinusIcon /> : <CheckIcon />)}
  </CheckboxIndicator>
</Checkbox>
```

## Controlled

Pass `checked` and `onCheckedChange` to own the value. A [controller](#checkbox-controller) from `createCheckboxController()` changes it from anywhere, like the Toggle button below.

```tsx title="controlled.tsx"
"use client"

import * as React from "react"
import {
  createCheckboxController,
  type CheckedState,
} from "@ui-sdk/core/checkbox"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [updates] = React.useState(() => createCheckboxController())
  const [checked, setChecked] = React.useState<CheckedState>(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => updates.toggle()}>
          Toggle
        </button>
      </div>
      <label data-slot="label">
        <Checkbox
          checked={checked}
          onCheckedChange={(next, details) => {
            setChecked(next)
            log(
              `${next === "indeterminate" ? "Mixed" : next ? "Checked" : "Unchecked"} (${details.reason})`
            )
          }}
          controller={updates}
        >
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        Email me about product updates
      </label>
    </div>
  )
}

export { Example }
```

Change the checkbox, or press Toggle. The console logs each change and its reason.

## Forms

Set `name` and `value` to include a checked checkbox in a native form. Unchecked and mixed checkboxes submit nothing. The default value is `"on"`. Independent checkboxes can share a name to submit several values; use a [group](#group) when your app also needs one list of checked values.

`required` blocks submission until the checkbox is checked. Reset returns it to `defaultChecked`. Set `form` to a form's id to join it from elsewhere on the page.

```tsx title="form.tsx"
"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = [...new FormData(event.currentTarget)].map(
          ([name, value]) => `${name}=${value}`
        )
        log(
          entries.length
            ? `Submitted ${entries.join("&")}`
            : "Submitted nothing"
        )
      }}
    >
      <Field>
        <Checkbox name="terms" value="yes" required>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        <div data-slot="stack">
          <FieldLabel>Accept terms and conditions</FieldLabel>
          <FieldDescription>
            You agree to our Terms of Service and Privacy Policy.
          </FieldDescription>
        </div>
      </Field>
      <Field>
        <Checkbox name="newsletter" value="weekly" defaultChecked>
          <CheckboxIndicator>
            <CheckIcon aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        <div data-slot="stack">
          <FieldLabel>Send me the weekly newsletter</FieldLabel>
          <FieldDescription>
            Product news and tips, once a week. Unsubscribe anytime.
          </FieldDescription>
        </div>
      </Field>
      <div data-slot="row">
        <button type="submit">Create Account</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
```

Create the account with the terms unchecked to see native validation, then accept them and try again. The console logs what was submitted, and Reset restores the defaults.

## Group

`CheckboxGroup` keeps one list of checked values. Each checkbox supplies its `value`; the group returns selected values in the order the checkboxes appear. Name the group with `aria-label`, `aria-labelledby`, or a [Field](#group-in-a-form).

```tsx title="group.tsx"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

function Example() {
  return (
    <div data-slot="stack">
      <h3 id="basic-toppings">Toppings</h3>
      <CheckboxGroup aria-labelledby="basic-toppings" defaultValue={["cheese"]}>
        {toppings.map((topping) => (
          <label data-slot="label" key={topping.value}>
            <Checkbox value={topping.value}>
              <CheckboxIndicator>
                <CheckIcon aria-hidden="true" />
              </CheckboxIndicator>
            </Checkbox>
            {topping.label}
          </label>
        ))}
      </CheckboxGroup>
    </div>
  )
}

export { Example }
```

Choose several toppings. The group keeps one list of checked values.

## Parent Checkbox

Add a checkbox with `parent` to check or uncheck the group. It is checked when every value is selected, unchecked when none are, and mixed in between. It points to its children with `aria-controls` and submits nothing itself.

Pass `allValues` to the group so the parent has the right state on the first render, including on the server. Otherwise it discovers the values after the checkboxes mount.

```tsx title="group-parent.tsx"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
]

function Example() {
  return (
    <div data-slot="stack">
      <h3 id="parent-toppings">Toppings</h3>
      <CheckboxGroup
        aria-labelledby="parent-toppings"
        defaultValue={["cheese", "olives"]}
        allValues={toppings.map((topping) => topping.value)}
      >
        <label data-slot="label">
          <Checkbox parent>
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
              <MinusIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Select all
        </label>
        <div data-slot="stack">
          {toppings.map((topping) => (
            <label data-slot="label" key={topping.value}>
              <Checkbox value={topping.value}>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
              {topping.label}
            </label>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  )
}

export { Example }
```

Select all checks every topping. Uncheck one topping to put Select all into its mixed state.

## Disabled Group

Disable the group to lock every checkbox, or disable one child to keep just that value fixed. A parent changes only enabled children.

```tsx title="group-disabled.tsx"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

const backups = [
  { value: "photos", label: "Photos" },
  { value: "documents", label: "Documents" },
  { value: "messages", label: "Messages" },
]

const folders = [
  { value: "desktop", label: "Desktop", disabled: true },
  { value: "projects", label: "Projects", disabled: false },
  { value: "downloads", label: "Downloads", disabled: false },
]

function Example() {
  return (
    <div data-slot="stack">
      <div data-slot="stack">
        <h3 id="disabled-backups">Backups</h3>
        <p data-slot="hint">Managed by your organization.</p>
        <CheckboxGroup aria-labelledby="disabled-backups" defaultValue={["photos", "documents"]} disabled>
          {backups.map((item) => (
            <label data-slot="label" key={item.value}>
              <Checkbox value={item.value}>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
              {item.label}
            </label>
          ))}
        </CheckboxGroup>
      </div>
      <div data-slot="stack">
        <h3 id="disabled-folders">Sync folders</h3>
        <CheckboxGroup
          aria-labelledby="disabled-folders"
          defaultValue={["desktop"]}
          allValues={folders.map((item) => item.value)}
        >
          <label data-slot="label">
            <Checkbox parent>
              <CheckboxIndicator>
                <CheckIcon aria-hidden="true" />
                <MinusIcon aria-hidden="true" />
              </CheckboxIndicator>
            </Checkbox>
            Select all
          </label>
          <div data-slot="stack">
            {folders.map((item) => (
              <label data-slot="label" key={item.value}>
                <Checkbox value={item.value} disabled={item.disabled}>
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
                {item.label}
              </label>
            ))}
          </div>
        </CheckboxGroup>
      </div>
    </div>
  )
}

export { Example }
```

The Backups group is disabled. In Sync folders, Select all changes the enabled folders while Desktop stays checked.

## Controlled Group

Pass `value` and `onValueChange` to own the selected values. A [controller](#checkboxgroup-controller) can replace that list, as Select Weekdays and Clear do below.

```tsx title="group-controlled.tsx"
"use client"

import * as React from "react"
import { createCheckboxGroupController } from "@ui-sdk/core/checkbox"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

const days: { value: Day; label: string }[] = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
]

const weekdays: Day[] = ["mon", "tue", "wed", "thu", "fri"]

function Example() {
  const log = useLog()
  const [schedule] = React.useState(() => createCheckboxGroupController<Day>())
  const [value, setValue] = React.useState<Day[]>(["mon", "tue"])

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => schedule.setValue(weekdays)}>
          Select Weekdays
        </button>
        <button type="button" onClick={() => schedule.setValue([])}>
          Clear
        </button>
      </div>
      <h3 id="controlled-days">Working days</h3>
      <CheckboxGroup
        aria-labelledby="controlled-days"
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          const names = days
            .filter((day) => next.includes(day.value))
            .map((day) => day.label)
          log(`${names.join(", ") || "No days"} (${details.reason})`)
        }}
        controller={schedule}
      >
        {days.map((day) => (
          <label data-slot="label" key={day.value}>
            <Checkbox value={day.value}>
              <CheckboxIndicator>
                <CheckIcon aria-hidden="true" />
              </CheckboxIndicator>
            </Checkbox>
            {day.label}
          </label>
        ))}
      </CheckboxGroup>
    </div>
  )
}

export { Example }
```

Choose working days, or press Select Weekdays or Clear. The console logs the group's value and the reason it changed.

## Group in a Form

Set `name` on the group to submit every checked value under that name. `required` requires at least one selection, and Reset restores `defaultValue`. The same `disabled` and `form` options apply as on a single checkbox.

In a field, the field supplies the group's label and description, and `FieldError` shows the validation message inline until a selection makes the group valid. [Forms and Validation](../forms.md) covers the shared field behavior.

```tsx title="group-field.tsx"
"use client"

import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push notifications" },
]

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = [...new FormData(event.currentTarget)].map(
          ([name, value]) => `${name}=${value}`
        )
        log(`Saved ${entries.join("&")}`)
      }}
    >
      <Field>
        <FieldLabel>Notifications</FieldLabel>
        <FieldDescription>
          Choose how we tell you about your orders.
        </FieldDescription>
        <CheckboxGroup name="notifications" required>
          {channels.map((channel) => (
            <label data-slot="label" key={channel.value}>
              <Checkbox value={channel.value}>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
              {channel.label}
            </label>
          ))}
        </CheckboxGroup>
        <div>
          <FieldError>Choose at least one way to be notified.</FieldError>
        </div>
      </Field>
      <button type="submit">Save</button>
    </form>
  )
}

export { Example }
```

Save with nothing checked to see the inline error. Choose a notification method and save; the console logs the submitted values.

## Table

The same parent checkbox can select rows from a table header. Each row supplies its value and accessible name.

```tsx title="table.tsx"
"use client"

import * as React from "react"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import { useLog } from "./log"

const people = [
  {
    id: "hollis",
    name: "Hollis Grant",
    email: "hollis@example.com",
    role: "Owner",
  },
  {
    id: "ines",
    name: "Inès Moreau",
    email: "ines@example.com",
    role: "Editor",
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    role: "Viewer",
  },
  {
    id: "wren",
    name: "Wren Takahashi",
    email: "wren@example.com",
    role: "Editor",
  },
]

function Example() {
  const log = useLog()
  const [selected, setSelected] = React.useState(["hollis"])

  return (
    <CheckboxGroup
      aria-label="Team members"
      value={selected}
      onValueChange={(next) => {
        setSelected(next)
        log(`${next.length} of ${people.length} selected`)
      }}
      allValues={people.map((person) => person.id)}
    >
      <table>
        <caption data-slot="visually-hidden">Team members</caption>
        <thead>
          <tr>
            <th>
              <Checkbox aria-label="Select all" parent>
                <CheckboxIndicator>
                  <CheckIcon aria-hidden="true" />
                  <MinusIcon aria-hidden="true" />
                </CheckboxIndicator>
              </Checkbox>
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id}>
              <td>
                <Checkbox value={person.id} aria-label={`Select ${person.name}`}>
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
              </td>
              <td>{person.name}</td>
              <td>{person.email}</td>
              <td>{person.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CheckboxGroup>
  )
}

export { Example }
```

Select rows individually, or use Select all in the header. The console logs how many are selected.

## Animation

The indicator has `data-starting-style` as it appears and `data-ending-style` while it leaves, and stays mounted until its exit finishes. Transition from those states:

```css
[data-slot="checkbox-indicator"] {
  transition:
    opacity 0.15s,
    scale 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    scale: 0.5;
  }
}
```

`keepMounted` keeps the indicator in the page while unchecked, with `data-unchecked`, for styles that show both states.

```tsx title="indicator.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

const tasks = [
  { label: "Write the release notes", done: false },
  { label: "Update the changelog", done: true },
  { label: "Tag the release", done: false },
]

function Example() {
  return (
    <div data-slot="stack">
      {tasks.map((task) => (
        <label data-slot="label" key={task.label}>
          <Checkbox defaultChecked={task.done}>
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          {task.label}
        </label>
      ))}
    </div>
  )
}

export { Example }
```

Check and uncheck a task. The check scales and fades in, and out before it unmounts.

## Custom Rendering

The checkbox, indicator, and group take `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Keep the part's props on the interactive element so its role, label, and keyboard behavior stay connected.

```tsx title="render.tsx"
import { Checkbox } from "@ui-sdk/react/checkbox"
import { CheckIcon, PlusIcon } from "lucide-react"

const topics = [
  { value: "design", label: "Design", checked: true },
  { value: "engineering", label: "Engineering", checked: false },
  { value: "marketing", label: "Marketing", checked: false },
  { value: "sales", label: "Sales", checked: false },
]

function Example() {
  return (
    <fieldset>
      <legend>Topics you follow</legend>
      <div data-slot="row">
        {topics.map((topic) => (
          <Checkbox
            key={topic.value}
            name="topics"
            value={topic.value}
            defaultChecked={topic.checked}
            render={(props, state) => (
              <button {...props}>
                {state.checked ? <CheckIcon /> : <PlusIcon />}
                {topic.label}
              </button>
            )}
          />
        ))}
      </div>
    </fieldset>
  )
}

export { Example }
```

Choose topics. Each checkbox renders a button that shows a check or a plus from its state.

## Styling

Use `data-checked`, `data-unchecked` and `data-indeterminate` for the checked state, and `data-disabled`, `data-readonly` and `data-required` for the rest. The indicator gets the same state attributes as its checkbox.

Each part has a `data-slot`, such as `checkbox`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### Checkbox
`[data-slot="checkbox"]`

- `data-checked`: Present while checked.
- `data-disabled`: Present when disabled, by its own prop, a group or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-unchecked`: Present while unchecked.
- `data-indeterminate`: Present while indeterminate.

### CheckboxIndicator
`[data-slot="checkbox-indicator"]`

- `data-checked`: Present while checked.
- `data-disabled`: Present when disabled, by its own prop, a group or a `<fieldset>`.
- `data-readonly`: Present when read-only.
- `data-required`: Present when required.
- `data-unchecked`: Present while unchecked.
- `data-indeterminate`: Present while indeterminate.
- `data-starting-style`: Present for the indicator's first frame. Style the state you animate from.
- `data-ending-style`: Present while the indicator animates out. Style the state you animate to.

### CheckboxGroup
`[data-slot="checkbox-group"]`

- `data-disabled`: Present when the group is disabled, by its own prop or a `<fieldset>`.
- `data-required`: Present when at least one checkbox must be checked.

## API Reference

Props and callbacks are the same as below, as React props.

### Checkbox

- `checked?` (`CheckedState`): Whether it's checked. Pass it to control the checkbox.
- `defaultChecked?` (`CheckedState`): Whether it's checked at first, when uncontrolled. A form reset returns to it.
- `onCheckedChange?` (`((checked: CheckedState, details: ChangeDetails<CheckboxCheckedChangeReason>) => void)`): Runs when a user or a form reset wants to change it. `details.reason` says why, and `details.cancel()` stops it.
- `disabled?` (`boolean`): Disables it like a native control: it can't be focused or changed, and isn't submitted.
- `readOnly?` (`boolean`): Keeps it focusable and submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until it's checked, with the browser's own message.
- `name?` (`string`): The name it submits under. Without one, it submits nothing.
- `value?` (`string`): What it submits while checked.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`{ toggle: (details?: Details) => boolean; getChecked: () => CheckedState; setChecked: (checked: CheckedState, details?: Details) => boolean; focus: () => void; }`): Toggles it from anywhere. Create one with `createCheckboxController()`.
- `parent?` (`boolean`): Makes it the parent of its group: it checks or unchecks every checkbox in the group, and shows checked, unchecked or indeterminate from them.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CheckboxIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while unchecked, so it can be styled or animated in both states.

### CheckboxGroup

- `value?` (`T[]`): The checked checkboxes' values. Pass it to control the group.
- `defaultValue?` (`T[]`): The values checked at first, when uncontrolled. A form reset returns to them.
- `onValueChange?` (`((value: T[], details: ChangeDetails<CheckboxGroupValueChangeReason>) => void)`): Runs when a user or a form reset wants to change the value. `details.reason` says why, and `details.cancel()` stops it.
- `allValues?` (`T[]`): Every value a parent checkbox checks. Without it, the parent checks the checkboxes in the group. Pass it to render the parent right on the server.
- `disabled?` (`boolean`): Disables every checkbox in the group, and leaves them out of the form.
- `readOnly?` (`boolean`): Makes every checkbox in the group read-only: focusable and submitted, but presses don't change it.
- `required?` (`boolean`): Blocks form submission until at least one checkbox is checked, with the browser's own message.
- `name?` (`string`): The name every checkbox in the group submits under.
- `form?` (`string`): The id of a form to belong to, when the group isn't inside that form.
- `controller?` (`{ getValue: () => T[]; setValue: (value: T[], details?: Details) => boolean; focus: () => void; }`): Checks values from anywhere. Create one with `createCheckboxGroupController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

What render functions, state-based class names and slots receive.

- `checked` (`boolean`): Whether it's checked. False while indeterminate.
- `indeterminate` (`boolean`): Whether it's `"indeterminate"`, for a partly checked group. A press makes it checked.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but presses don't change it.
- `required` (`boolean`): Whether a form won't submit until it's checked. Indeterminate doesn't count.

The indicator receives the same state.

- `checked` (`boolean`): Whether it's checked. False while indeterminate.
- `indeterminate` (`boolean`): Whether it's `"indeterminate"`, for a partly checked group. A press makes it checked.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether it's read-only: it stays focusable and submitted, but presses don't change it.
- `required` (`boolean`): Whether a form won't submit until it's checked. Indeterminate doesn't count.

The group:

- `value` (`string[]`): The checked values.
- `disabled` (`boolean`): Whether the group is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the group is read-only: its checkboxes stay focusable and submitted, but presses don't change them.
- `required` (`boolean`): Whether a form won't submit until at least one of its checkboxes is checked.

### Reasons

`details.reason` says why the checked state changed.

- `press` (`MouseEvent | KeyboardEvent`): A single-element control was pressed: a checkbox, a switch or a toggle.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a group, it says why the checked values changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Checkbox Controller

Create one with `createCheckboxController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs the change callback like a press, and returns `false` when the change is canceled.

- `toggle(details?)` (`(details?: CheckboxChangeOptions | undefined) => boolean`): Checks it, or unchecks it. An indeterminate checkbox becomes checked.
- `getChecked()` (`() => CheckedState`): Whether it's checked: `true`, `false` or `"indeterminate"`.
- `setChecked(checked, details?)` (`(checked: CheckedState, details?: CheckboxChangeOptions | undefined) => boolean`): Sets whether it's checked, as a user would.
- `focus()` (`() => void`): Moves focus to it.

### CheckboxGroup Controller

Create one with `createCheckboxGroupController()` and pass it as `controller`.

Its write methods work like the checkbox controller's.

- `getValue()` (`() => T[]`): The checked values.
- `setValue(value, details?)` (`(value: T[], details?: CheckboxGroupChangeOptions | undefined) => boolean`): Sets the checked values, as a user would. A disabled group ignores it.
- `focus()` (`() => void`): Moves focus to the first enabled checkbox.

### Events

Callbacks get the new state or value first, then the details.

| Prop              | On              | Receives                                                                               |
| ----------------- | --------------- | -------------------------------------------------------------------------------------- |
| `onCheckedChange` | `Checkbox`      | `(checked, details)`: `true`, `false` or `"indeterminate"`, and the [reason](#reasons) |
| `onValueChange`   | `CheckboxGroup` | `(value, details)`: the checked values, and the [reason](#reasons)                     |

## Accessibility

The checkbox follows the [WAI-ARIA checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), and a group's parent checkbox follows its [mixed checkbox example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/). `Checkbox` renders a button with the `checkbox` role, and a hidden native checkbox that takes part in forms. Every line below is an automated test.

### Keyboard

| Key   | Does                                         |
| ----- | -------------------------------------------- |
| Tab   | Moves to the next checkbox                   |
| Space | Checks or unchecks it, or checks a mixed one |
| Enter | Submits its form                             |

### Tested Behavior

**Checkbox**

- Clicking toggles it.
- Clicking its label toggles it.
- Clicking a label around it toggles it once.
- Space toggles it.
- Enter submits the form and never toggles it.
- Tab moves through checkboxes in order.
- The indicator shows only while checked.
- A change can be cancelled.
- A controlled checkbox follows its value.
- A read-only checkbox can be focused but not changed.
- Exit keyframes keyed on data-unchecked play before the indicator unmounts.
- An infinite exit animation still unmounts the indicator.

Runs in React, Vue and web components.

Groups and parent checkboxes:

- The group is named by its label.
- Starts on its default value.
- Checking a checkbox adds its value to the group.
- Every checked value submits under the group's name, in order.
- A reset returns to the default value.
- A required group blocks submission until one is checked.

**Parent checkbox**

- Is mixed while some checkboxes are checked.
- Checks every checkbox from mixed, then unchecks them all.
- Is checked once every checkbox is.
- Submits nothing itself.

Runs in React, Vue and web components.

In forms:

- The form submits every checked control's name and value.
- Unchecked controls submit nothing.
- A checkbox outside the form joins it with the form attribute.
- Required controls block submission.
- A form reset returns every control to its default.
- A reset returns to the default value, not to nothing.
- A disabled fieldset disables the controls inside it.
- A read-only control still submits.
- A user's change fires native input and change events on the form.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- The first invalid control takes focus in document order.
- A later required field without an error part doesn't take focus from the first.

**Form-associated custom elements**

- Take part in the form with no hidden input. Web components only.
- Report validity like native controls. Web components only.
- Have live checked and value properties. Web components only.
- Are named by their labels. Web components only.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while checking boxes with a keyboard.
- Announcements while choosing a radio with a keyboard.

Runs in React, Vue and web components.
