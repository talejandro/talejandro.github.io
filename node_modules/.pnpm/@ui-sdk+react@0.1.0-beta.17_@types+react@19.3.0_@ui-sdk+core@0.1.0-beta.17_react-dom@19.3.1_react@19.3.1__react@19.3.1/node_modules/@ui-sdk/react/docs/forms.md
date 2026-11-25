# Forms

Submit component values, label controls, and show validation errors.

Give a control a `name` to include its value in a form. This works for Select and Combobox as well as inputs and checkboxes.

## Submit a Value

```tsx
import { Checkbox } from "@ui-sdk/react/checkbox"

function Example() {
  return (
    <form action="/preferences" method="post">
      <label>
        <Checkbox name="updates" value="yes" defaultChecked />
        Email me updates
      </label>
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
    </form>
  )
}

export { Example }
```

The checkbox submits `updates=yes` when checked. Reset restores its default value.

## Reset a Controlled Value

A reset also goes through `onCheckedChange`. Update your React state there, just as you would after a click:

```tsx
"use client"

import { Checkbox, type CheckedState } from "@ui-sdk/react/checkbox"
import { useState } from "react"

function Example() {
  const [checked, setChecked] = useState<CheckedState>(true)
  const [reason, setReason] = useState("No change yet")

  return (
    <form>
      <label>
        <Checkbox
          name="updates"
          defaultChecked
          checked={checked}
          onCheckedChange={(next, details) => {
            setChecked(next)
            setReason(details.reason)
          }}
        />
        Email me updates
      </label>
      <button type="reset">Reset</button>
      <output>{reason}</output>
    </form>
  )
}

export { Example }
```

Uncheck the box, then press Reset. `defaultChecked` supplies the reset value, and the callback receives `true` with reason `"reset"`. The callback runs when reset requests a different value; it does not run if the checkbox is already at its default. Without `defaultChecked`, a reset leaves a controlled checkbox as it is, so your state stays the only source of its value.

## Label and Validate a Field

`Field` connects a control to its label, description, and error message:

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <Field name="email">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" required />
      <FieldDescription>We'll only use it for receipts.</FieldDescription>
      <FieldError />
    </Field>
  )
}

export { Example }
```

You can use a Textarea, Checkbox, Switch, Radio Group, or Select in place of the Input. [Field](./components/field.md) shows how they connect.

These props follow native form conventions on controls that support them:

| Prop       | What It Does                                                                |
| ---------- | --------------------------------------------------------------------------- |
| `name`     | Sets the submitted field name. Without one, no value is submitted.          |
| `required` | Requires a value before the form can submit.                                |
| `disabled` | Prevents interaction and leaves the control out of the submission.          |
| `readOnly` | Prevents edits while keeping the control focusable and its value submitted. |
| `form`     | Connects a control to a form by ID when it's outside that form.             |

## Handle a Submission

On a normal submit, the browser checks constraints such as `required` and `type="email"` before running your handler.

Your server may still reject a valid-looking value. Pass `invalid` to the field and show the server’s message. When the user edits the field, clear the message and return `invalid` to `undefined` so the field uses native validation again. This example expects a `/api/preferences` endpoint:

```tsx
"use client"

import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import * as React from "react"

function Example() {
  const [error, setError] = React.useState("")

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch("/api/preferences", {
      method: "POST",
      body: new FormData(event.currentTarget),
    })
    setError(response.ok ? "" : "That email is already taken.")
  }

  return (
    <form onSubmit={save}>
      <Field name="email" invalid={error ? true : undefined}>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required onValueChange={() => setError("")} />
        <FieldError>{(state) => error || state.message}</FieldError>
      </Field>
      <button type="submit">Save</button>
    </form>
  )
}

export { Example }
```

Without a handler, the form submits through its `action`, including a React server action.
