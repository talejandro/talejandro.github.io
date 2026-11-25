# Input

Enter text, add a clear button, and connect the value to your form or state.

An input is a native text field for short values like a name, an email address or a search. It works inside a field and a form, and adds a clear button, text around the input, and change reasons.

```tsx title="basic.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input, InputClear, InputGroup } from "@ui-sdk/react/input"
import { XIcon } from "lucide-react"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <Field name="website">
      <FieldLabel>Website</FieldLabel>
      <InputGroup>
        <span>https://</span>
        <Input
          placeholder="example.com"
          defaultValue="hollisgrant.com"
          onValueChange={(value, details) =>
            log(`${value ? `“${value}”` : "Empty"} (${details.reason})`)
          }
        />
        <InputClear aria-label="Clear website">
          <XIcon aria-hidden="true" />
        </InputClear>
      </InputGroup>
      <FieldDescription>Shown on your public profile.</FieldDescription>
    </Field>
  )
}

export { Example }
```

Edit the website, then press Clear website. The text clears, focus returns to the input and the console logs the reason. Pressing https:// focuses the input too.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build an `Input` or an `InputGroup`:

```text
Input

InputGroup
├── Input
└── InputClear
```

`Input` renders a native `<input>`. Pass its type, placeholder, autocomplete and other native attributes directly. `InputGroup` holds text or buttons around it, and `InputClear` empties it.

## Usage

Import the parts and put them together:

```tsx
import { Input, InputClear, InputGroup } from "@ui-sdk/react/input"

function Example() {
  return (
    <InputGroup>
      <Input type="search" aria-label="Search" />
      <InputClear aria-label="Clear search" />
    </InputGroup>
  )
}

export { Example }
```

## Fields

Wrap the input in a [Field](./field.md) to give it a visible label, a description and errors. The field also supplies its `name` when the input has none.

```tsx
<Field name="username">
  <FieldLabel>Username</FieldLabel>
  <Input autoComplete="username" />
  <FieldDescription>
    Choose a unique username for your account.
  </FieldDescription>
</Field>
```

## Disabled and Read Only

Set `disabled` on the input or its field to prevent editing and leave it out of the tab order and the submitted values. A `readOnly` input can still be focused, selected and submitted.

```tsx
<Field disabled>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" defaultValue="hollis@example.com" />
</Field>

<Field>
  <FieldLabel>Profile URL</FieldLabel>
  <Input readOnly value="example.com/hollis" />
</Field>
```

## Validation

Use native constraints such as `required`, `type="email"` and `pattern`. The field shows its error after a submit attempt and updates it as the value changes. Set `invalid` on the field for an error your app decides; the input gets `aria-invalid`. [Field](./field.md#validation) covers the error parts and their matches.

```tsx
<Field name="email" invalid={emailTaken ? true : undefined}>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" required />
  <FieldError match="valueMissing">Enter your email address.</FieldError>
  <FieldError match>That email is already in use.</FieldError>
</Field>
```

## Input Group

Place text or buttons around an input with `InputGroup`. Pressing the group's text focuses the input. The text is display content, not part of the submitted value.

```tsx
<InputGroup>
  <span>https://</span>
  <Input aria-label="Website" placeholder="example" />
  <span>.com</span>
</InputGroup>
```

## Clear Button

`InputClear` shows while the input has text it can clear. Pressing it empties the value, reports `clear-press` and returns focus to the input. Controlled state and native input listeners receive the change too.

```tsx
<InputGroup>
  <Input type="search" aria-label="Search people" />
  <InputClear aria-label="Clear search">
    <XIcon aria-hidden="true" />
  </InputClear>
</InputGroup>
```

## Controlled

Pass `value` and `onValueChange` to control the input. Native `onChange` still works.

```tsx
const [name, setName] = React.useState("Hollis Grant")

<Input value={name} onValueChange={(value) => setName(value)} />
```

See [State and Events](../state-and-events.md) for the shared controlled-state conventions. Input's [reasons](#reasons) tell typing, clearing, resetting and controller changes apart.

## Filtering What's Typed

Call `details.cancel()` in the value-change callback to reject a change. The previous text and caret position are restored.

```tsx
<Input
  inputMode="numeric"
  maxLength={6}
  onValueChange={(value, details) => {
    if (!/^\d*$/.test(value)) details.cancel()
  }}
/>
```

## Controller

Use `createInputController()` for actions outside the input. Its methods update the input through the same change callbacks as typing.

```tsx
const [message] = React.useState(createInputController)

<Input controller={message} aria-label="Message" />
<button onClick={() => message.setValue("On my way!")}>Quick Reply</button>
<button onClick={() => message.clear()}>Clear</button>
<button onClick={() => message.focus()}>Focus</button>
```

[Controllers](../controllers.md) covers creating and sharing a controller.

## Passwords and Files

Use [Password Input](./password-input.md) to show and hide a password. A native file input works with `type="file"`; use [File Input](./file-input.md) for dropping, previews and validation.

## Styling

Each part has a `data-slot`, such as `input-group`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). Use `data-filled`, `data-disabled`, `data-readonly` and `data-required` on the input, and the field's validation and focus attributes inside a field. For a group's focus ring, style `:has(input:focus-visible)`, so a focused button inside it keeps its own ring.

## Data Attributes

### Input
`[data-slot="input"]`

- `data-filled`: Present while the field holds any text.
- `data-disabled`: Present when the field is disabled, by its own prop or its Field.
- `data-readonly`: Present when the field is read-only.
- `data-required`: Present when the field is required.

### InputGroup
`[data-slot="input-group"]`

- `data-filled`: Present while the field in the group holds any text.
- `data-disabled`: Present while the field in the group is disabled, by itself or a `<fieldset>`.
- `data-readonly`: Present while the field in the group is read-only.

### InputClear
`[data-slot="input-clear"]`

- `data-filled`: Present while the field in the group holds any text.
- `data-disabled`: Present while the field in the group is disabled, by itself or a `<fieldset>`.
- `data-readonly`: Present while the field in the group is read-only.

## API Reference

Props are the same as below, as React props, plus every native input prop.

### Input

- `value?` (`string`): The value, for a controlled field.
- `defaultValue?` (`string`): The value it starts with. A form reset returns here.
- `onValueChange?` (`((value: string, details: ChangeDetails<InputValueChangeReason>) => void)`): Called when the user changes the value: typing (`"input-change"`), a Clear part (`"clear-press"`), a form reset (`"reset"`) or a controller (`"imperative"`). `details.cancel()` keeps the value as it was.
- `controller?` (`object`): Reads and writes the field from anywhere. Create one with `createInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

- `disabled?` (`boolean`): Disables the field.
- `readOnly?` (`boolean`): Makes the field read-only.
- `required?` (`boolean`): Makes the field required.

### InputGroup

- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### InputClear

A `<button>` that empties the input in its group and focuses it. It renders only while there's text to clear.

### State

- `filled` (`boolean`): Whether the field holds any text.
- `disabled` (`boolean`): Whether the field is disabled.
- `readOnly` (`boolean`): Whether the field is read-only.
- `required` (`boolean`): Whether the field is required.

`InputGroup` and `InputClear` receive the state of the input inside the group.

- `filled` (`boolean`): Whether the field in the group holds any text.
- `disabled` (`boolean`): Whether the field in the group is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the field in the group is read-only.

### Reasons

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createInputController()` and pass it as `controller`.

- `getValue()` (`() => string`): The current value.
- `setValue(value, options?)` (`(value: string, options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Sets the value as if the user typed it, so `input` fires. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ChangeOptions<InputValueChangeReason> | undefined) => boolean`): Empties the field, as if the user deleted the text, so `input` fires. Returns false when the change was canceled or nothing changed.
- `focus()` (`() => void`): Moves focus to the field.

## Accessibility

Give the input a visible field label or an `aria-label`, and give the clear button an accessible name. The native input keeps standard text editing, selection, autocomplete and form behavior.

- The label names the input and the description describes it.
- Clicking the label focuses the input.
- An invalid input is marked once the form tries to submit.
- Data-filled follows the text.
- An input group's clear button shows only while there's text.
- <ui-input>'s value property writes the field quietly, and its api reports. Web components only.

**Enhancements**

- Changes report their reason: typing, then a reset.
- A canceled change keeps the text as it was.
- A canceled change keeps a controlled input's text as it was.
- A canceled change waits for an IME to finish before the text goes back.
- A controlled input keeps every keystroke.
- A required input marks its label required.

**Input group**

- The clear button empties the field, reports why, and returns focus.
- Pressing the group's text focuses its field.
- The clear button hides while its field is disabled.

Runs in React, Vue and web components.
