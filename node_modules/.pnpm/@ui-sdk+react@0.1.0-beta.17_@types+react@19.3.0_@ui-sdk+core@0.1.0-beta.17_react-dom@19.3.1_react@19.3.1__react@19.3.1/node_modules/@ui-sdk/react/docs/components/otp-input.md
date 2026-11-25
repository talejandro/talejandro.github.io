# OTP Input

Enter a one-time code with support for pasting, autofill, and native form validation.

Use an OTP Input for a short code sent by text or email, like a sign-in or verification code. Each character gets its own slot, and a pasted or autofilled code fills them all at once.

```tsx title="basic.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@ui-sdk/react/otp-input"
import { MinusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Verification code</FieldLabel>
      <OTPInput maxLength={6}>
        <OTPInputGroup>
          <OTPInputSlot index={0} />
          <OTPInputSlot index={1} />
          <OTPInputSlot index={2} />
        </OTPInputGroup>
        <OTPInputSeparator>
          <MinusIcon aria-hidden="true" />
        </OTPInputSeparator>
        <OTPInputGroup>
          <OTPInputSlot index={3} />
          <OTPInputSlot index={4} />
          <OTPInputSlot index={5} />
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
```

Type a six-digit code or paste 123-456. Click a slot to edit it, use the arrow keys to move, and use your usual undo shortcut to undo a change.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build an `OTPInput`:

```text
OTPInput
└── OTPInputGroup
    ├── OTPInputSlot
    └── OTPInputSlot
```

`OTPInput` creates the native input and holds the code. `OTPInputGroup` lays out a run of slots. Each `OTPInputSlot` displays the character at its zero-based `index`. Add `OTPInputSeparator` between groups when the code is easier to read in sections, like the dash in the example above.

Groups and separators change the presentation of one value. They do not create additional fields or tab stops: the slots display the value of a single native input, which handles selection, paste, undo, form submission, and autofill. It uses `autocomplete="one-time-code"` so supported browsers and password managers can offer a saved or received code.

## Usage

Import the parts and put them together:

```tsx
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <OTPInput maxLength={4} aria-label="Verification code">
      <OTPInputGroup>
        <OTPInputSlot index={0} />
        <OTPInputSlot index={1} />
        <OTPInputSlot index={2} />
        <OTPInputSlot index={3} />
      </OTPInputGroup>
    </OTPInput>
  )
}

export { Example }
```

## Four Digits

Set `maxLength` to the code's length and render that many slots. The default length is six.

```tsx title="four-digits.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <Field>
      <FieldLabel>PIN</FieldLabel>
      <OTPInput maxLength={4} textAlign="center">
        <OTPInputGroup>
          {[0, 1, 2, 3].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
```

Enter four digits in PIN. Once it is full, typing another digit replaces the selected slot. Click another slot to edit it.

## Alphanumeric

Set `pattern` to `digits`, `letters`, or `alphanumeric`. The default is `digits`. The pattern filters characters and selects a suitable keyboard on touch devices.

```tsx title="alphanumeric.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@ui-sdk/react/otp-input"
import { MinusIcon } from "lucide-react"

function Example() {
  return (
    <Field>
      <FieldLabel>Recovery code</FieldLabel>
      <OTPInput maxLength={8} pattern="alphanumeric">
        <OTPInputGroup>
          {[0, 1, 2, 3].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
        <OTPInputSeparator>
          <MinusIcon aria-hidden="true" />
        </OTPInputSeparator>
        <OTPInputGroup>
          {[4, 5, 6, 7].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
```

Type letters and digits into Recovery code, or paste ab12-cd34. The hyphen is removed and the eight characters fill the slots.

## Custom Pattern

Pass a regular expression, such as `/[0-9A-F]/i` to accept hexadecimal characters. Use `inputMode` to choose the keyboard separately. The example displays letters in uppercase without changing their stored case.

```tsx title="pattern.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"

function Example() {
  return (
    <Field>
      <FieldLabel>Device code</FieldLabel>
      <OTPInput maxLength={6} pattern={/[0-9A-F]/i} inputMode="text">
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
```

Try typing 12zzab into Device code. The z characters are rejected; the accepted value is 12ab, displayed as 12AB.

## Validation

Inside a [Field](./field.md), pass `invalid` when your code rejects the value, such as a code the server didn't accept. The field marks the input with `aria-invalid` and connects its `FieldError`. Outside a field, pass `aria-invalid` and `aria-describedby` yourself.

```tsx title="invalid.tsx"
"use client"

import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import * as React from "react"

function Example() {
  const [invalid, setInvalid] = React.useState(true)

  return (
    <Field invalid={invalid}>
      <FieldLabel>Verification code</FieldLabel>
      <OTPInput defaultValue="482913" onValueChange={() => setInvalid(false)}>
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
      <FieldError>That code has expired. Request a new one.</FieldError>
    </Field>
  )
}

export { Example }
```

Verification code is marked invalid, and the error below explains why. Edit any digit to clear the error.

## Controlled

Pass `value` and update it in `onValueChange`. Call `details.cancel()` in the change callback to reject a change. Incoming values are filtered by the pattern and limited to `maxLength`, just like typed values.

```tsx title="controlled.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState("")

  return (
    <Field>
      <FieldLabel>One-time password</FieldLabel>
      <OTPInput
        value={value}
        onValueChange={(value, details) => {
          setValue(value)
          log(`${value || "Empty"} (${details.reason})`)
        }}
      >
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
```

Enter, paste, or delete digits in One-time password. The console logs each new code and its reason.

See [State and Events](../state-and-events.md) for the shared state conventions. The [reason](#reasons) distinguishes typing, pasting, undo, and controller actions.

## On Complete

`onValueCommit` runs when a change fills every slot, including typing, paste, autofill, and controller writes. Changing an already-full code runs it again. Form resets and page restoration do not.

```tsx title="complete.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Verification code</FieldLabel>
      <OTPInput
        onValueCommit={(value, details) =>
          log(`Checking ${value} (${details.reason})`)
        }
      >
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot key={index} index={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { Example }
```

Fill all six slots. The console logs the complete code and the change reason. Replace a digit to log it again; deleting one logs nothing.

## Forms

Set `name` to include the code in `FormData`. `required` blocks an empty code, and a partial code fails length validation. Reset restores the default value. Use `form` to associate a control outside the form with its ID.

```tsx title="form.tsx"
"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <form
        id="verify-sign-in"
        onSubmit={(event) => {
          event.preventDefault()
          const data = [...new FormData(event.currentTarget)].map(
            ([name, value]) => `${name}=${value}`
          )
          log(`Submitted ${data.join(", ")}`)
        }}
      >
        <Field>
          <FieldLabel>Verification code</FieldLabel>
          <OTPInput name="code" required>
            <OTPInputGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <OTPInputSlot key={index} index={index} />
              ))}
            </OTPInputGroup>
          </OTPInput>
          <FieldDescription>
            Enter the six-digit code we sent to hollis@example.com.
          </FieldDescription>
          <FieldError />
        </Field>
      </form>
      <Field>
        <FieldLabel>Recovery code (optional)</FieldLabel>
        <OTPInput name="recovery" form="verify-sign-in" maxLength={8} pattern="alphanumeric">
          <OTPInputGroup>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <OTPInputSlot key={index} index={index} />
            ))}
          </OTPInputGroup>
        </OTPInput>
        <FieldError />
      </Field>
      <div data-slot="row">
        <button type="reset" form="verify-sign-in">
          Reset
        </button>
        <button type="submit" form="verify-sign-in" data-variant="solid">
          Verify
        </button>
      </div>
    </div>
  )
}

export { Example }
```

Choose Verify with an empty or partial code to see validation. Enter all six digits and choose Verify to log the form values. Recovery code sits outside the form but submits with it. Reset clears both fields.

A typed partial code reports `tooShort`. Partial default values and controller writes are checked through the native input's pattern, because browsers do not apply minlength validation to those values.

## Disabled and Read-Only

A disabled input cannot be focused, changed, or submitted. `readOnly` prevents changes while keeping the input focusable and included in form data.

```tsx
<OTPInput disabled defaultValue="123456" aria-label="Disabled code">
  ...
</OTPInput>
<OTPInput readOnly defaultValue="654321" aria-label="Read-only code">
  ...
</OTPInput>
```

## Controller

Create a `createOTPInputController()` and pass it as `controller` to read, fill, clear, or focus the input from another control. Writes use the `imperative` reason and pass through the same filtering and change callbacks as typing.

```tsx
const [code] = React.useState(() => createOTPInputController())

<button onClick={() => code.setValue("123456")}>Fill</button>
<button onClick={() => code.clear()}>Clear</button>
<button onClick={() => console.log(code.getValue())}>Read</button>
<button onClick={() => code.focus()}>Focus</button>
<OTPInput controller={code} aria-label="Verification code">
  ...
</OTPInput>
```

[Controllers](../controllers.md) covers creating and sharing a controller.

## Custom Rendering

The root's state exposes all `slots`. Each slot exposes `char`, `active`, and `hasFakeCaret` if you want to draw its contents yourself. See [Parts and Composition](../parts-and-composition.md) for the rendering conventions.

## Styling

Draw the active slot and caret with `data-active` and `data-fake-caret`. The examples include the caret animation and disable it for reduced motion. Keep `position: relative` on each slot so its caret stays inside it.

Each part has a `data-slot`, such as `otp-input-slot`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### OTPInput
`[data-slot="otp-input"]`

- `data-complete`: Present while every slot is filled.
- `data-filled`: Present while the code holds any character.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-focused`: Present while the input has focus.

### OTPInputGroup
`[data-slot="otp-input-group"]`

- `data-complete`: Present while every slot is filled.
- `data-filled`: Present while the code holds any character.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-focused`: Present while the input has focus.

### OTPInputSlot
`[data-slot="otp-input-slot"]`

- `data-filled`: Present while the slot holds a character.
- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-active`: Present on the slot typing goes to: the selected character, or the empty slot after the last one. Only while focused.
- `data-fake-caret`: Present on the active slot while it's empty. Draw a blinking caret in it; the input's own caret is hidden.

### OTPInputSeparator
`[data-slot="otp-input-separator"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.

## API Reference

Props and callbacks are the same as below, as React props. `id`, `autoFocus`, `aria-label`,
`aria-labelledby`, `aria-describedby` and `aria-invalid` go to the input.

### OTPInput

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `value?` (`string`): The code, for a controlled input.
- `defaultValue?` (`string`): The code it starts with, when uncontrolled. A form reset returns here.
- `onValueChange?` (`((value: string, details: ChangeDetails<OTPInputValueChangeReason>) => void)`): Runs when the code changes: typing or deleting (`"input-change"`), a paste (`"paste"`), the browser's undo and redo, a form reset, or a controller. Autofill and codes from the keyboard's suggestions are `"input-change"`. `details.cancel()` keeps the code as it was.
- `onValueCommit?` (`((value: string, details: CommitDetails<OTPInputValueChangeReason>) => void)`): Runs when a change fills every slot, with the whole code, like to verify it. A controller filling it counts, so does a code that changes while full.
- `maxLength?` (`number`): How many characters the code has, one slot each.
- `pattern?` (`OTPInputPattern`): Which characters it accepts: `"digits"`, `"letters"`, `"alphanumeric"`, or a regular expression each character must match, like `/[A-F0-9]/i`. Anything else typed, pasted or dropped is ignored.
- `inputMode?` (`"decimal" | "none" | "numeric" | "tel" | "text"`): The keyboard touch screens show.
- `textAlign?` (`"center" | "end" | "start"`): Where the invisible input keeps its text and caret. It decides where the browser puts its own popups, like the paste menu on phones. `"start"` and `"end"` follow the reading direction.
- `autoComplete?` (`string`): The input's `autocomplete`. `"one-time-code"` lets phones offer a code from a message, and password managers fill it.
- `disabled?` (`boolean`): Disables it like a native input: it can't be focused, and isn't submitted.
- `readOnly?` (`boolean`): Makes it read-only: focusable and submitted, but the code can't change.
- `required?` (`boolean`): Requires a code before the form submits. A partial code is too short either way.
- `name?` (`string`): The name it submits the code under.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `controller?` (`{ getValue: () => string; setValue: (value: string, options?: OTPInputChangeOptions) => boolean; clear: (options?: OTPInputChangeOptions) => boolean; focus: () => void; }`): Reads and writes the code from anywhere. Create one with `createOTPInputController()`.

### OTPInputSlot

- `index` (`number`): Which character of the code the slot shows, from 0.

### State

What render functions, state-based class names and slots receive. The root, groups and separators get the
input's state.

- `value` (`string`): The code.
- `slots` (`OTPInputSlotData[]`): One entry per slot: its character, whether it's active, and whether it draws a caret.
- `focused` (`boolean`): Whether the input has focus.
- `complete` (`boolean`): Whether every slot is filled.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.

Slots get their own:

- `char` (`string | null`): The character in the slot, or null when it's empty.
- `active` (`boolean`): Whether the slot is where typing goes: the selected character, or the empty slot after the last one.
- `hasFakeCaret` (`boolean`): Whether the slot should draw a caret: it's active and empty. The real caret is hidden.
- `index` (`number`): Which character of the code the slot shows.
- `focused` (`boolean`): Whether the input has focus.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.

### Reasons

`details.reason` says why the code changed. Autofill and a code from the keyboard's suggestions are `input-change`.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `undo` (`KeyboardEvent | InputEvent`): Undo, from the keyboard, the Edit menu or a controller.
- `redo` (`KeyboardEvent | InputEvent`): Redo, from the keyboard, the Edit menu or a controller.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createOTPInputController()` and pass it as `controller`.

`setValue()` and `clear()` take an optional `{ reason, event }`, and run the change callback like typing.

- `getValue()` (`() => string`): The code.
- `setValue(value, options?)` (`(value: string, options?: OTPInputChangeOptions | undefined) => boolean`): Sets the code, as typing it would. Characters that don't fit the pattern are dropped. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: OTPInputChangeOptions | undefined) => boolean`): Empties the code. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the input.

### Events

Callbacks get the code first, then the details.

| Prop            | On         | Receives                                                        |
| --------------- | ---------- | --------------------------------------------------------------- |
| `onValueChange` | `OTPInput` | `(value, details)`: the new code and the [reason](#reasons)     |
| `onValueCommit` | `OTPInput` | `(value, details)`: the full code and the reason that filled it |

## Accessibility

Name the input with FieldLabel, a native label, `aria-label`, or `aria-labelledby`. Screen readers encounter one input with the whole code; the visual slots, groups, and separators are hidden from them.

### Keyboard

The input keeps its native keys. Arrow keys, Home, and End move the selection between slots, Backspace deletes, and your usual shortcuts undo and redo. Pasting a code such as `123-456` removes the separators.

### Tested Behavior

Every line below is an automated test.

- Typing fills the slots in order.
- Characters the pattern doesn't accept are ignored.
- Filling every slot completes the code.
- Backspace deletes the last character.
- ArrowLeft goes back a slot, and typing replaces its character.
- Pressing a filled slot lets you retype it.
- Pasting a code with a dash fills every slot.
- The form submits the code under its name.
- A partial default code is too short to submit.
- A typed partial code is too short, not the wrong format.
- A canceled change keeps the code.
- A disabled code can't be typed into.
- A code of letters and digits takes both.
- The input asks for a one-time code and a numeric keyboard.
- Typing a whole code with no waits fills it.

Runs in React, Vue and web components.
