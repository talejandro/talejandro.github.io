# Password Input

Enter a password, show or hide it, and use it in a native form.

A Password Input is a native password field with a button that shows and hides what's typed. It keeps the caret in place, offers the right password to password managers, and hides the password again when its form submits.

```tsx title="basic.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput>
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>Use at least 8 characters.</FieldDescription>
    </Field>
  )
}

export { Example }
```

Type a password, then choose Show password to reveal or hide it. Clicking the toggle keeps the caret in the field. With a keyboard, Tab to the toggle and press Space or Enter.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `PasswordInput`:

```text
PasswordInput
├── PasswordInputControl
└── PasswordInputToggle
```

`PasswordInput` holds the value and visibility state. `PasswordInputControl` renders the native input; `PasswordInputToggle` renders the button that shows and hides it. The toggle switches the input between `password` and `text`, and is a `type="button"`, so pressing Enter in the input still submits the form.

Put form options such as `name`, `form`, `required`, `disabled`, and `readOnly` on `PasswordInput`. Put other native input attributes, such as `placeholder` or `id`, on `PasswordInputControl`.

## Usage

Import the parts and put them together:

```tsx
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"

function Example() {
  return (
    <PasswordInput name="password">
      <PasswordInputControl aria-label="Password" />
      <PasswordInputToggle aria-label="Show password">Show</PasswordInputToggle>
    </PasswordInput>
  )
}

export { Example }
```

## New Password

Use `autoComplete="new-password"` on the root when creating or changing a password. It tells the browser and password manager which kind of password to offer. The default is `current-password` for signing in.

The example derives a checklist from the current value. Those rules belong to the example; the component does not impose a password policy.

```tsx title="new-password.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import * as React from "react"

const rules = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  { label: "A number", test: (password: string) => /\d/.test(password) },
  {
    label: "An uppercase and a lowercase letter",
    test: (password: string) =>
      /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
]

function Example() {
  const [password, setPassword] = React.useState("")
  return (
    <Field name="new-password">
      <FieldLabel>Create a password</FieldLabel>
      <PasswordInput
        value={password}
        autoComplete="new-password"
        onValueChange={(value) => setPassword(value)}
      >
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <ul data-slot="stack" aria-label="Password requirements">
        {rules.map((rule) =>
          rule.test(password) ? (
            <li data-slot="row" key={rule.label}>
              <CheckIcon aria-hidden="true" />
              <span data-slot="visually-hidden">Done:</span>
              {rule.label}
            </li>
          ) : (
            <li data-slot="row" key={rule.label}>
              <XIcon aria-hidden="true" />
              <span data-slot="visually-hidden">To do:</span>
              {rule.label}
            </li>
          )
        )}
      </ul>
    </Field>
  )
}

export { Example }
```

Type a password and watch the checklist update. Try adding digits and both uppercase and lowercase letters, then toggle its visibility.

## Shown at First

Set `defaultVisible` to start with the text visible, and `defaultValue` for its initial value. This can be useful for a Wi-Fi password someone needs to read or copy.

```tsx title="default-visible.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="wifi-password">
      <FieldLabel>Wi-Fi password</FieldLabel>
      <PasswordInput defaultVisible defaultValue="maple-orbit-42" autoComplete="new-password">
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>
        Guests read it from here, so it starts shown.
      </FieldDescription>
    </Field>
  )
}

export { Example }
```

Read the Wi-Fi password, then choose Show password to hide it. Choose it again to reveal the value.

## Caps Lock

Use `data-capslock` or the part's `capsLock` state for a warning. It updates from key events while the input is focused. The example reserves space for the icon and warning.

```tsx title="caps-lock.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"

function Example() {
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput>
        {(state) => (
          <>
            <PasswordInputControl />
            <span>{state.capsLock && <LockIcon aria-hidden="true" />}</span>
            <PasswordInputToggle aria-label="Show password">
              {(toggle) =>
                toggle.visible ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )
              }
            </PasswordInputToggle>
          </>
        )}
      </PasswordInput>
      <p data-slot="caps-lock">Caps Lock is on.</p>
    </Field>
  )
}

export { Example }
```

Focus Password and press Caps Lock. The warning appears while Caps Lock is on. Turn it off or leave the field to hide the warning.

## Disabled

Set `disabled` on the root, its Field, or an enclosing fieldset to disable both the input and the toggle. The value is omitted from form submission.

```tsx title="disabled.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field disabled name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput defaultValue="hunter22">
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>
        Your administrator manages this password.
      </FieldDescription>
    </Field>
  )
}

export { Example }
```

Try to edit Password or press its toggle. Both controls are disabled and are skipped by Tab.

## Read-Only

Set `readOnly` when the value can be read but not edited. The input stays focusable, the toggle still works, and the value still participates in form submission.

```tsx title="read-only.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function Example() {
  return (
    <Field name="recovery-key">
      <FieldLabel>Recovery key</FieldLabel>
      <PasswordInput readOnly defaultValue="7Hq2-vX9p-Lm4c" autoComplete="off">
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show recovery key">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
      <FieldDescription>
        Keep it somewhere safe. You can show it, but not change it.
      </FieldDescription>
    </Field>
  )
}

export { Example }
```

Choose Show recovery key to read it. Try to type in the input; its value stays unchanged.

## Controlled Visibility

Pass `visible` and update it in `onVisibleChange`. The [reason](#reasons) distinguishes a toggle press, form submission, reset, page hide, or a controller action.

```tsx title="controlled.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [visible, setVisible] = React.useState(false)
  return (
    <Field name="password">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput
        visible={visible}
        onVisibleChange={(next, details) => {
          setVisible(next)
          log(`${next ? "Shown" : "Hidden"} (${details.reason})`)
        }}
      >
        <PasswordInputControl />
        <PasswordInputToggle aria-label="Show password">
          {(state) =>
            state.visible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )
          }
        </PasswordInputToggle>
      </PasswordInput>
    </Field>
  )
}

export { Example }
```

Toggle Show password. The console logs each change and its reason.

Call `details.cancel()` in the change callback to reject a visibility change. During form submission, the native input is temporarily a password field even if the callback rejects hiding it.

## Controller

Create a `createPasswordInputController()` and pass it as `controller` for actions outside the input. Read or change the value, toggle visibility, or focus the input. Writes use the `imperative` reason.

```tsx title="controller.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createPasswordInputController,
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [password] = React.useState(createPasswordInputController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={() => {
            password.setValue("plum-kettle-orbit-42")
            password.setVisible(true)
          }}
        >
          Suggest
        </button>
        <button type="button" onClick={() => password.toggleVisible()}>
          Toggle
        </button>
        <button type="button" onClick={() => password.clear()}>
          Clear
        </button>
        <button
          type="button"
          onClick={() =>
            log(
              `${password.getValue().length} characters, ${password.isVisible() ? "shown" : "hidden"}`
            )
          }
        >
          Read
        </button>
        <button type="button" onClick={() => password.focus()}>
          Focus
        </button>
      </div>
      <Field name="new-password">
        <FieldLabel>New password</FieldLabel>
        <PasswordInput controller={password} autoComplete="new-password">
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Show password">
            {(state) =>
              state.visible ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )
            }
          </PasswordInputToggle>
        </PasswordInput>
      </Field>
    </div>
  )
}

export { Example }
```

Choose Suggest to fill and reveal a sample value. Try Toggle, Read, Clear, and Focus to call each action from outside the field.

[Controllers](../controllers.md) covers how to create and share a controller.

## Forms

The native input participates in `FormData`, validation, and reset. Use `form` to associate it with a form elsewhere in the page, as this example does.

```tsx title="form.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <form
        data-slot="stack"
        id="sign-in"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const length = String(data.get("password")).length
          log(
            `Signed in as ${data.get("email")}, with a password of ${length} characters`
          )
        }}
      >
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" required autoComplete="username" />
        </Field>
      </form>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <PasswordInput name="password" form="sign-in" required>
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Show password">
            {(state) =>
              state.visible ? (
                <EyeOffIcon aria-hidden="true" />
              ) : (
                <EyeIcon aria-hidden="true" />
              )
            }
          </PasswordInputToggle>
        </PasswordInput>
      </Field>
      <div data-slot="row">
        <button type="submit" form="sign-in" data-variant="solid">
          Sign In
        </button>
        <button type="reset" form="sign-in">
          Reset
        </button>
      </div>
    </div>
  )
}

export { Example }
```

Enter an email and password, reveal the password, then press Enter in the field. Submission hides it again, and the console logs its length. Reset clears the form. Empty required fields block submission.

Submission, reset, and page hiding request that the password be hidden again. A reset also restores its default value. Spellcheck, autocorrection, and automatic capitalization stay disabled when the password is visible.

## Controlled Value

Pass `value` and update it in `onValueChange`. The [New Password example](#new-password) derives its checklist this way. [State and Events](../state-and-events.md) covers the shared state conventions.

```tsx
const [password, setPassword] = React.useState("")

<PasswordInput value={password} onValueChange={(value) => setPassword(value)}>
  <PasswordInputControl aria-label="Password" />
  <PasswordInputToggle aria-label="Show password">Show</PasswordInputToggle>
</PasswordInput>
```

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. `className`, `style` and `children` can be functions of the same state: whether the password is `visible`, whether Caps Lock is on (`capsLock`), and whether the field is `filled`. See [Parts and Composition](../parts-and-composition.md) for the rendering conventions.

```tsx
<PasswordInputToggle
  aria-label="Show password"
  render={(props, state) => (
    <button {...props}>
      {state.visible ? (
        <EyeOffIcon aria-hidden="true" />
      ) : (
        <EyeIcon aria-hidden="true" />
      )}
    </button>
  )}
/>
```

## Styling

Style the root as the field's box, with the native input and the toggle inside it. `data-visible` marks every part while the password is shown, and the toggle also sets `aria-pressed`. Use `data-capslock` for a Caps Lock warning, and `data-filled`, `data-disabled` and `data-readonly` for the field's other states. Inside Field, the native input also receives validation attributes such as `data-invalid`. Use logical spacing so the field and toggle follow the surrounding direction.

Each part has a `data-slot`, such as `password-input-toggle`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### PasswordInput
`[data-slot="password-input"]`

- `data-visible`: Present while the password is shown, so the field is a text field.
- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when a password is required.
- `data-capslock`: Present while Caps Lock is on and the field has focus.

### PasswordInputControl
`[data-slot="password-input-control"]`

- `data-visible`: Present while the password is shown, so the field is a text field.
- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when a password is required.
- `data-capslock`: Present while Caps Lock is on and the field has focus.

### PasswordInputToggle
`[data-slot="password-input-toggle"]`

- `data-visible`: Present while the password is shown, so the field is a text field.
- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when a password is required.
- `data-capslock`: Present while Caps Lock is on and the field has focus.

## API Reference

Props and callbacks are the same as below, as React props.

### PasswordInput

- `value?` (`string`): The value, for a controlled field.
- `defaultValue?` (`string`): The value it starts with. A form reset returns here.
- `onValueChange?` (`((value: string, details: ChangeDetails<InputValueChangeReason>) => void)`): Called when the user changes the value: typing (`"input-change"`), a Clear part (`"clear-press"`), a form reset (`"reset"`) or a controller (`"imperative"`). `details.cancel()` keeps the value as it was.
- `visible?` (`boolean`): Whether the password is shown. Pass it to control it.
- `defaultVisible?` (`boolean`): Whether the password is shown at first, when uncontrolled.
- `onVisibleChange?` (`((visible: boolean, details: ChangeDetails<PasswordInputVisibleChangeReason>) => void)`): Runs when the password wants to be shown or hidden: the toggle (`"toggle-press"`), submitting or resetting its form (`"form-submit"`, `"reset"`), the page being hidden (`"page-hide"`) or a controller (`"imperative"`). `details.cancel()` keeps it as it was; the field is a password field while the browser reads a submitted form either way.
- `autoComplete?` (`"current-password" | "new-password" | "off" | (string & {})`): What the browser and password managers fill in: `"current-password"` for signing in, `"new-password"` for signing up or changing it.
- `name?` (`string`): The name the password submits under. Inside a Field, the Field's name.
- `form?` (`string`): The id of the form the field belongs to, when it isn't inside it.
- `required?` (`boolean`): Whether a password is required to submit the form.
- `disabled?` (`boolean`): Disables the field and the toggle. Inside a Field or a disabled `<fieldset>`, they follow it.
- `readOnly?` (`boolean`): Makes the field read-only. The toggle still shows and hides it.
- `controller?` (`object`): Reads, writes, shows and hides it from anywhere. Create one with `createPasswordInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

What render functions, state-based class names and slots receive. Every part gets the same state.

- `visible` (`boolean`): Whether the password is shown.
- `capsLock` (`boolean`): Whether Caps Lock is on while the field has focus.
- `filled` (`boolean`): Whether the field holds any text.
- `disabled` (`boolean`): Whether the field is disabled, by itself, its Field or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the field is read-only.
- `required` (`boolean`): Whether a form won't submit while the field is empty.

### Reasons

`details.reason` says why the value changed. Autofill and a password manager's fill are `input-change`.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the password was shown or hidden:

- `toggle-press` (`MouseEvent | KeyboardEvent`): A toggle was pressed: a password input's, which shows or hides the password, or a carousel's, which starts or stops rotation.
- `form-submit` (`SubmitEvent`): The form was submitted, which hides a shown password so the browser offers to save it.
- `reset` (`none`): A form reset.
- `page-hide` (`PageTransitionEvent`): The page was hidden, like when navigating away, which hides a shown password before the browser keeps the page.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createPasswordInputController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, and runs the change callback like typing or a press. `setVisible()` and `toggleVisible()` return `false` when the change is canceled.

- `getValue()` (`() => string`): The current value.
- `setValue(value, options?)` (`(value: string, options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Sets the value as if the user typed it, so `input` fires. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Empties the field, as if the user deleted the text, so `input` fires. Returns false when the change was canceled or nothing changed.
- `isVisible()` (`() => boolean`): Whether the password is shown.
- `setVisible(visible, options?)` (`(visible: boolean, options?: ChangeOptions<PasswordInputVisibleChangeReason> | undefined) => boolean`): Shows or hides the password. Returns false when canceled.
- `toggleVisible(options?)` (`(options?: ChangeOptions<PasswordInputVisibleChangeReason> | undefined) => boolean`): Shows the password if it's hidden, and hides it if it's shown. Returns false when canceled.
- `focus()` (`() => void`): Moves focus to the field.

### Events

Callbacks get the new value first, then the details.

| Prop              | On              | Receives                                                                             |
| ----------------- | --------------- | ------------------------------------------------------------------------------------ |
| `onValueChange`   | `PasswordInput` | `(value, details)`: the new password and the [reason](#reasons)                      |
| `onVisibleChange` | `PasswordInput` | `(visible, details)`: whether the password wants to show, and the [reason](#reasons) |

## Accessibility

There's no WAI-ARIA pattern for a password field. The input stays a native password field named by its Field label or an `aria-label`, and the toggle follows the [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) as a toggle button. Name the toggle by what it does, such as “Show password”, and keep that name the same: its `aria-pressed` state tells screen readers whether the password is shown, and `aria-controls` points to the input.

### Keyboard

Tab moves from the input to the toggle, and Space or Enter on the toggle shows or hides the password. Enter in the input submits its form; it never presses the toggle.

### Focus

A pointer press on the toggle keeps focus in the input, with the caret and selection where they were. A press from elsewhere brings focus back to the input. A keyboard press keeps focus on the toggle.

### Tested Behavior

Every line below is an automated test.

- The field is a password field named by its label and described by its description.
- The toggle is a button that says what it does, and isn't pressed.
- Pressing the toggle shows the password, and pressing it again hides it.
- Space on the focused toggle shows the password and keeps focus on the toggle.
- Enter on the focused toggle shows the password and keeps focus on the toggle.
- The toggle keeps its name when the password shows.
- Enter in the field submits the form, and never presses the toggle.
- The password submits under its name.
- The password can start shown.
- A change can be canceled.
- A disabled password input disables the field and the toggle.
- A read-only field can still be shown.
- The controller shows and hides the password.
- A controlled password input follows its owner. React and Vue only.
- A click with no pointer behind it, like a screen reader's, shows the password.

Runs in React, Vue and web components.

Beyond the pattern:

- Showing the password keeps focus in the field, with the caret where it was.
- Showing and hiding the password keeps the selection.
- A click on the toggle while typing never blurs the field.
- A click on the toggle from elsewhere brings focus back to the field.
- Submitting hides a shown password before the page's own submit handler runs.
- Submitting hides the password even when the change is canceled, while the browser reads the form.
- Resetting the form hides the password.
- Hiding the page hides the password, so the browser never keeps it as text.
- A shown password is never spellchecked, autocorrected or capitalized.
- The field asks password managers for the current password, or a new one.
- Caps Lock marks the input while the field has focus.
- A click into the field with Caps Lock on shows the warning before any key.
- A web field keeps an autocomplete changed after it connects. Web components only.
- The toggle has its own id and controls the field.
- A disabled fieldset disables the toggle too.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while showing and hiding a password with a keyboard.

Runs in React, Vue and web components.

Also tested:

- No axe violations at rest.
- No axe violations with the password shown.
- No axe violations while disabled.
- No axe violations while read-only.
- The field is named by its label, and the toggle by its aria-label.
- Accessibility tree.

Runs in React, Vue and web components.
