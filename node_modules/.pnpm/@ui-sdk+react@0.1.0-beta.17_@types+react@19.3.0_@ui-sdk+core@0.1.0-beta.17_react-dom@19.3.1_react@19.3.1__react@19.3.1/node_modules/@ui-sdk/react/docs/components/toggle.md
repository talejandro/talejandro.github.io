# Toggle

Keep a button pressed, or group toggles with a shared value and arrow-key navigation.

Use a toggle for a button that stays on until you press it again, like starring a document or turning on Bold. Put several in a toggle group to share one value, as a text editor's formatting buttons or a view switcher do.

```tsx title="basic.tsx"
import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <div data-slot="card">
      <div data-slot="stack">
        <h3>Q3 Roadmap</h3>
        <p data-slot="hint">Edited by Hollis Grant</p>
      </div>
      <Toggle aria-label="Star">
        <ToggleIcon data-variant="fill">
          <StarIcon />
        </ToggleIcon>
      </Toggle>
    </div>
  )
}

export { Example }
```

Press the star beside Q3 Roadmap, or focus it and press Enter or Space. It fills in while pressed, and its accessible name stays Star.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Toggle`:

```text
Toggle
└── ToggleIcon
```

And a `ToggleGroup`:

```text
ToggleGroup
├── Toggle
│   └── ToggleIcon
└── Toggle
    └── ToggleIcon
```

`Toggle` renders a native button that reports its state with `aria-pressed`. `ToggleIcon` is optional: it holds an icon and hides it from screen readers. In a group, give each toggle a `value`; the group's value lists the pressed ones.

## Usage

Import the parts and put them together:

```tsx
import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { StarIcon } from "lucide-react"

function Example() {
  return (
    <Toggle aria-label="Star">
      <ToggleIcon>
        <StarIcon />
      </ToggleIcon>
    </Toggle>
  )
}

export { Example }
```

Keep the label the same in both states: screen readers announce whether the button is pressed. An icon-only toggle needs an `aria-label`, as above. Set `defaultPressed` to start pressed. The toggle always uses `type="button"`, so pressing it never submits a form.

## Group

Put toggles in a `ToggleGroup`, from the same `@ui-sdk/react/toggle` entry, to share a value and arrow-key navigation. Give the group an accessible name and each toggle a `value`. Set `multiple` to let several toggles stay pressed.

```tsx title="group.tsx"
import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"

function Example() {
  return (
    <ToggleGroup multiple aria-label="Text formatting">
      <Toggle value="bold" aria-label="Bold">
        <ToggleIcon>
          <BoldIcon />
        </ToggleIcon>
      </Toggle>
      <Toggle value="italic" aria-label="Italic">
        <ToggleIcon>
          <ItalicIcon />
        </ToggleIcon>
      </Toggle>
      <Toggle value="underline" aria-label="Underline">
        <ToggleIcon>
          <UnderlineIcon />
        </ToggleIcon>
      </Toggle>
    </ToggleGroup>
  )
}

export { Example }
```

Press Bold and Italic to keep both pressed. Left and Right move focus without changing either.

The group owns which toggles are pressed, so a toggle's own `pressed` and `defaultPressed` don't apply inside it. Its value is always an array, in the toggles' document order.

## Single Selection

Without `multiple`, pressing a toggle unpresses the others. Pressing the pressed toggle again clears the selection, unless you set `deselectable` to `false`, as this alignment group does. `deselectable` doesn't choose an initial value for you, so pair it with `defaultValue`.

```tsx title="group-single.tsx"
import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import {
  TextAlignCenterIcon,
  TextAlignEndIcon,
  TextAlignStartIcon,
} from "lucide-react"

const alignments = [
  {
    value: "start",
    label: "Align start",
    icon: TextAlignStartIcon,
    mirror: true,
  },
  {
    value: "center",
    label: "Align center",
    icon: TextAlignCenterIcon,
    mirror: false,
  },
  { value: "end", label: "Align end", icon: TextAlignEndIcon, mirror: true },
]

function Example() {
  return (
    <ToggleGroup defaultValue={["start"]} deselectable={false} aria-label="Text alignment">
      {alignments.map((item) => (
        <Toggle key={item.value} value={item.value} aria-label={item.label}>
          <ToggleIcon mirror={item.mirror}>
            <item.icon />
          </ToggleIcon>
        </Toggle>
      ))}
    </ToggleGroup>
  )
}

export { Example }
```

Press Align center to replace Align start, then press Align center again. One alignment always stays pressed.

`mirror` on Align start and Align end flips their icons in right-to-left text. Use [Radio](./radio.md) instead when the arrow keys should select an option as they move; a toggle group moves focus first and waits for a press.

## Icon and Label

Put an icon beside the label with `ToggleIcon`. The icon is hidden from screen readers, so the text alone names the button.

```tsx
<Toggle>
  <ToggleIcon>
    <PinIcon />
  </ToggleIcon>
  Pin
</Toggle>
```

## Disabled

Set `disabled` on a toggle or a group to prevent presses. A disabled toggle can still start pressed, and a disabled `<fieldset>` around it disables it too.

```tsx
<Toggle disabled defaultPressed>
  Pin
</Toggle>
```

A disabled toggle on its own leaves the tab order. In a group, disabled toggles stay reachable with the arrow keys and report `aria-disabled`, but ignore presses.

```tsx
<ToggleGroup multiple aria-label="Text formatting">
  <Toggle value="bold">Bold</Toggle>
  <Toggle value="italic">Italic</Toggle>
  <Toggle value="underline" disabled>
    Underline
  </Toggle>
</ToggleGroup>
```

## Focusable When Disabled

Set `focusableWhenDisabled` to keep a disabled toggle focusable. It uses `aria-disabled` and still ignores presses. Use `aria-describedby` to explain why it's unavailable:

```tsx
<Toggle disabled focusableWhenDisabled aria-describedby="pin-hint">
  Pin
</Toggle>
<p id="pin-hint">Only owners can pin messages.</p>
```

## Controlled

Pass `pressed` and update it in `onPressedChange`. Call `details.cancel()` in the callback to keep the current state. A [controller](#toggle-controller) from `createToggleController()` presses the toggle from anywhere, such as a keyboard shortcut. Create one controller per mounted toggle.

```tsx
"use client"

import * as React from "react"
import {
  createToggleController,
  Toggle,
  ToggleIcon,
} from "@ui-sdk/react/toggle"
import { StarIcon } from "lucide-react"

function StarButton() {
  const [starred, setStarred] = React.useState(false)
  const [star] = React.useState(createToggleController)

  return (
    <>
      <Toggle
        aria-label="Star"
        pressed={starred}
        onPressedChange={setStarred}
        controller={star}
      >
        <ToggleIcon>
          <StarIcon />
        </ToggleIcon>
      </Toggle>
      <button type="button" onClick={() => star.toggle()}>
        Toggle Star
      </button>
    </>
  )
}

export { StarButton }
```

The callback receives the new state and `details`, whose `reason` is `"press"` or `"imperative"`.

## Controlled Group

Pass `value` and update it in `onValueChange` to own the group's value, or to show it somewhere else. A toggle's own `onPressedChange` runs before the group's, and calling `details.cancel()` in either cancels the change. A [controller](#togglegroup-controller) from `createToggleGroupController()` changes the value from anywhere: `setValue([])` clears it.

```tsx
"use client"

import * as React from "react"
import {
  createToggleGroupController,
  Toggle,
  ToggleGroup,
} from "@ui-sdk/react/toggle"

function Formatting() {
  const [formats, setFormats] = React.useState(["bold"])
  const [editor] = React.useState(createToggleGroupController)

  return (
    <>
      <ToggleGroup
        multiple
        aria-label="Text formatting"
        value={formats}
        onValueChange={setFormats}
        controller={editor}
      >
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
      </ToggleGroup>
      <button type="button" onClick={() => editor.setValue([])}>
        Clear Formatting
      </button>
    </>
  )
}

export { Formatting }
```

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Vertical

Set `orientation="vertical"` to move with Up and Down instead of Left and Right. The group and its toggles get `data-orientation`.

```tsx
<ToggleGroup orientation="vertical" aria-label="Tool">
  ...
</ToggleGroup>
```

## Loop

Arrow keys wrap from the last toggle to the first. Set `loop` to `false` to stop at the ends.

```tsx
<ToggleGroup multiple loop={false} aria-label="Text formatting">
  ...
</ToggleGroup>
```

## Forms

Toggles don't submit values. Use [Checkbox](./checkbox.md) for several form choices or [Radio](./radio.md) for one. If you keep a toggle group in a form, copy its value into hidden inputs yourself.

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. A toggle's state has `pressed`, and a group's has `value`, its pressed values. Keep the part's props on the button, so its `aria-pressed` and keyboard behavior stay connected. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```tsx title="render.tsx"
"use client"

import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { HeartIcon } from "lucide-react"

function Example() {
  return (
    <Toggle
      aria-label="Favorite"
      render={(props, state) => (
        <button {...props}>
          <ToggleIcon>
            <HeartIcon fill={state.pressed ? "currentColor" : "none"} />
          </ToggleIcon>
        </button>
      )}
    />
  )
}

export { Example }
```

Press Favorite. The heart renders filled or empty from the toggle's pressed state.

## Styling

Style the pressed state with `data-pressed`, and use `data-disabled` for unavailable toggles. A toggle with a `ToggleIcon` gets `data-has-icon`, and its group gets `data-has-icons` while any toggle has one, which helps align icon and text content. `data-orientation` tells a group's toggles which way it runs.

Each part has a `data-slot`, such as `toggle`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### Toggle
`[data-slot="toggle"]`

- `data-pressed`: Present while pressed.
- `data-disabled`: Present when disabled, by its own prop or its group.
- `data-orientation` (`horizontal`, `vertical`): Inside a group, the group's orientation.
- `data-has-icon`: Present while the toggle holds an icon part.

### ToggleIcon
`[data-slot="toggle-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### ToggleGroup
`[data-slot="toggle-group"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between toggles.
- `data-disabled`: Present when the whole group is disabled.
- `data-has-icons`: Present while any toggle inside holds an icon part, so toggles without one can line up.

## API Reference

Props and callbacks are the same as below, as React props.

### Toggle

- `pressed?` (`boolean`): Whether it's pressed. Pass it to control the toggle. Inside a group, the group's value decides.
- `defaultPressed?` (`boolean`): Whether it's pressed at first, when uncontrolled.
- `onPressedChange?` (`((pressed: boolean, details: ChangeDetails<TogglePressedChangeReason>) => void)`): Runs when a press wants to change it. `details.reason` says why, and `details.cancel()` stops it. Inside a group, it runs before the group's `onValueChange`, and canceling it cancels the group's change too.
- `value?` (`string`): Identifies the toggle inside a group, whose value lists the pressed toggles' values. Defaults to a generated id.
- `disabled?` (`boolean`): Stops presses. Alone, the toggle is natively disabled, unless `focusableWhenDisabled` is set. Inside a group or a toolbar, it stays focusable with `aria-disabled`, so arrow keys still reach it.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled toggle in the tab order with `aria-disabled` instead of the native attribute. Toggles in a group or a toolbar always are.
- `controller?` (`{ isPressed: () => boolean; setPressed: (pressed: boolean, options?: ToggleChangeOptions) => boolean; toggle: (options?: ToggleChangeOptions) => boolean; focus: () => void; }`): Presses it from anywhere. Create one with `createToggleController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ToggleIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### ToggleGroup

- `value?` (`T[]`): The pressed toggles' values. Pass it to control the group.
- `defaultValue?` (`T[]`): The toggles pressed at first, when uncontrolled.
- `onValueChange?` (`((value: T[], details: ChangeDetails<ToggleGroupValueChangeReason>) => void)`): Runs when a toggle wants to be pressed or unpressed. `details.reason` says why, and `details.cancel()` stops it.
- `multiple?` (`boolean`): Whether several toggles can be pressed at once. Otherwise pressing one unpresses the others.
- `deselectable?` (`boolean`): Whether the pressed toggle can be unpressed when only one may be pressed. With `false`, one toggle stays pressed once any is. Ignored with `multiple`.
- `disabled?` (`boolean`): Stops every toggle from being pressed. They stay focusable with `aria-disabled`, so the group keeps its tab stop and stays discoverable.
- `orientation?` (`ToggleGroupOrientation`): Which arrow keys move between toggles: left and right, or up and down.
- `loop?` (`boolean`): Whether arrow keys wrap from the last toggle to the first.
- `controller?` (`object`): Presses toggles from anywhere. Create one with `createToggleGroupController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

What render functions, state-based class names and slots receive.

- `pressed` (`boolean`): Whether it's pressed. Inside a group, it follows the group's value.
- `disabled` (`boolean`): Whether it's disabled, by itself, its group or a fieldset around it.

In a group, a toggle's `disabled` includes the group's. The group:

- `value` (`T[]`): The pressed toggles' values.
- `multiple` (`boolean`): Whether several toggles can be pressed at once.
- `disabled` (`boolean`): Whether the whole group is disabled, by its `disabled` option or a disabled fieldset around it.
- `orientation` (`ToggleGroupOrientation`): The group's `orientation` option, or `"horizontal"` when it's unset or invalid.

`ToggleIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

### Reasons

`details.reason` says why the toggle was pressed or unpressed.

- `press` (`MouseEvent | KeyboardEvent`): A single-element control was pressed: a checkbox, a switch or a toggle.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a group, it says why the pressed toggles changed.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Toggle Controller

Create one with `createToggleController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs the change callback like a press, and returns `false` when the change is canceled.

- `isPressed()` (`() => boolean`): Whether it's pressed. Inside a group, it follows the group's value.
- `setPressed(pressed, options?)` (`(pressed: boolean, options?: ToggleChangeOptions | undefined) => boolean`): Presses or unpresses it, as a user would. A disabled toggle ignores it. Returns false when canceled.
- `toggle(options?)` (`(options?: ToggleChangeOptions | undefined) => boolean`): Presses it, or unpresses it.
- `focus()` (`() => void`): Moves focus to it.

### ToggleGroup Controller

Create one with `createToggleGroupController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs `onValueChange` like a press, and returns `false` when the change is canceled.

- `getValue()` (`() => T[]`): The pressed toggles' values, in the order they appear.
- `setValue(value, options?)` (`(value: T[], options?: ToggleGroupChangeOptions | undefined) => boolean`): Sets the pressed toggles. Only the first counts unless `multiple` is set. Returns false when canceled.
- `isPressed(value)` (`(value: T) => boolean`): Whether a toggle is pressed.
- `toggle(value, options?)` (`(value: T, options?: ToggleGroupChangeOptions | undefined) => boolean`): Presses a toggle, or unpresses a pressed one, as a user would. Disabled toggles and `deselectable={false}` refuse it.
- `focus(value?)` (`(value?: T | undefined) => void`): Moves focus to a toggle, or to the one that holds the group's tab stop.

### Events

Callbacks get the new state or value first, then the details. `onValueChange` never runs on mount.

| Prop              | On            | Receives                                                                                                                     |
| ----------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `onPressedChange` | `Toggle`      | `(pressed, details)`: the new state, and the [reason](#reasons). In a group, it runs first and can cancel the group's change |
| `onValueChange`   | `ToggleGroup` | `(value, details)`: the pressed toggles' values, and the [reason](#reasons)                                                  |

## Accessibility

A toggle follows the toggle button in the [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/): a native button with `aria-pressed`. A group follows the keyboard of the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/), with one tab stop and arrow keys between toggles. It has the `group` role, not `toolbar`, so it can sit inside a [Toolbar](./toolbar.md), and not `radiogroup`, since its toggles are buttons.

### Keyboard

A group is one tab stop. Tab first enters on its first enabled pressed toggle, or its first enabled toggle, and later returns to the last focused one.

| Key          | Does                                                    |
| ------------ | ------------------------------------------------------- |
| Enter, Space | Presses or unpresses the focused toggle                 |
| Tab          | Moves into or out of a group                            |
| Left, Right  | Move focus in a horizontal group, swapped right to left |
| Up, Down     | Move focus in a vertical group                          |
| Home, End    | Move focus to the first or last toggle                  |

### Tested Behavior

Every line below is an automated test.

- A toggle starts unpressed.
- Clicking a toggle presses it, and clicking again unpresses it.
- Space presses a focused toggle.
- Enter presses a focused toggle.
- A toggle can start pressed.
- A change can be cancelled.
- A toggle keeps its name when it's pressed.

Runs in React, Vue and web components.

In a group:

**One pressed at a time**

- The group is named and its default toggle is pressed.
- Pressing a toggle unpresses the others.
- Pressing the pressed toggle unpresses it.
- A change can be cancelled.

**Several pressed at once**

- Pressing toggles adds them to the value.
- A disabled toggle can't be pressed.
- A disabled group presses nothing.

**Keyboard**

- Tab moves into the group once, and out of it.
- Only one toggle in a group is a tab stop.
- ArrowRight and ArrowLeft move focus without pressing.
- Focus wraps at both ends.
- Home and End move to the first and last toggles.
- ArrowUp and ArrowDown do nothing in a horizontal group.
- Space presses the focused toggle.
- Enter presses the focused toggle.
- Tab returns to the toggle focused last.
- The group itself is never a tab stop.
- Keys pressed without waiting still land.
- Arrow keys with a modifier are left to the browser.

**Options**

- With loop off, arrows stop at the ends.
- A vertical group moves with ArrowDown and ArrowUp.
- The group carries its orientation.

Runs in React, Vue and web components.
