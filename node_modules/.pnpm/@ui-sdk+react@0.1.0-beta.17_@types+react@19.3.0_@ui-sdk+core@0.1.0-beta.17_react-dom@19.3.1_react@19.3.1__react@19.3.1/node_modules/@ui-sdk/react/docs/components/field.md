# Field

Connect a form control to its label, description, and validation errors.

A field connects a form control to its label, its description and the errors it shows, and wires up `id`, `for` and `aria-describedby` for you.

```tsx title="input.tsx"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Username</FieldLabel>
        <Input name="username" placeholder="hollis" autoComplete="username" />
        <FieldDescription>
          Choose a unique username for your account.
        </FieldDescription>
      </Field>
    </div>
  )
}

export { Example }
```

Press Username to focus the input, then type a name.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Field`:

```text
Field
├── FieldLabel
├── Input
├── FieldDescription
└── FieldError
```

## Usage

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function UsernameField() {
  return (
    <Field name="username">
      <FieldLabel>Username</FieldLabel>
      <Input autoComplete="username" required />
      <FieldDescription>This is your public name.</FieldDescription>
      <FieldError />
    </Field>
  )
}

export { UsernameField }
```

The control is one of ours, like an [Input](./input.md), a [Textarea](./textarea.md), a [Select](./select.md) or a [Checkbox](./checkbox.md), and it wires itself to the field.

The label names the control, and the description and any error that shows describe it.

Group related fields in a [field set](#field-sets):

```tsx
<FieldSet>
  <FieldLegend />
  <FieldDescription />
  <FieldGroup>
    <Field />
    <Field />
  </FieldGroup>
</FieldSet>
```

## Controls

Use an [Input](./input.md) for a line of text and a [Textarea](./textarea.md) for more:

```tsx
<Field>
  <FieldLabel>Feedback</FieldLabel>
  <Textarea name="feedback" />
</Field>
```

For a control we don't ship, like a native `<select>`, use `FieldControl`. It renders an `<input>`, or another element with `render`, and connects it to the field the same way. An [agent](../agents.md) sees only our components, so it can't fill a `FieldControl`: use ours where there is one.

```tsx
<Field>
  <FieldLabel>Department</FieldLabel>
  <FieldControl render={<select />} name="department">
    <option value="design">Design</option>
    <option value="engineering">Engineering</option>
  </FieldControl>
</Field>
```

A [Checkbox](./checkbox.md), [Switch](./switch.md) or [Radio Group](./radio.md) inside a field uses the field's label and description. Pressing the label toggles a checkbox or switch. A radio group takes the field's label as its name, and each radio keeps a label of its own:

```tsx
<Field>
  <Switch name="mfa" />
  <FieldLabel>Two-factor authentication</FieldLabel>
  <FieldDescription>Ask for a code when you sign in.</FieldDescription>
</Field>

<Field>
  <FieldLabel>Plan</FieldLabel>
  <RadioGroup name="plan" defaultValue="monthly">
    <label>
      <Radio value="monthly" />
      Monthly
    </label>
    <label>
      <Radio value="yearly" />
      Yearly
    </label>
  </RadioGroup>
</Field>
```

## Validation

Use native constraints such as `required`, `type="email"`, and `pattern`. Errors appear after a submit attempt and update as the value changes. The first invalid control takes focus.

Leave an error empty to show the browser's message, or use `match="valueMissing"` and `match="typeMismatch"` for your own messages. Adding an error part replaces the browser's validation bubble with that message in the page.

```tsx title="validation.tsx"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(`Subscribed ${new FormData(event.currentTarget).get("email")}`)
      }}
    >
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required placeholder="hollis@example.com" />
        <FieldDescription
          render={(props, state) => (
            <p {...props}>
              {state.valid
                ? "Looks good."
                : "We'll send you a confirmation link."}
            </p>
          )}
        />
        <FieldError match="valueMissing">Enter your email address.</FieldError>
        <FieldError match="typeMismatch">
          Enter an email address like hollis@example.com.
        </FieldError>
      </Field>
      <Field name="website">
        <FieldLabel>Website</FieldLabel>
        <Input type="url" required placeholder="https://example.com" />
        <FieldError />
      </Field>
      <button type="submit" data-variant="solid">
        Subscribe
      </button>
    </form>
  )
}

export { Example }
```

Press Subscribe with an empty or invalid email, then correct it to clear the error.

## Errors from Your Code

Pass `invalid` when your server or form library supplies an error. `true` shows it immediately. Clear the value to return to the browser's validation.

Give this error its own text and set `match` to `true`. Named matches such as `valueMissing` still refer to native validation. `invalid={false}` hides the field's invalid state, but does not make an invalid native control pass validation.

```tsx
<Field name="email" invalid={serverError ? true : undefined}>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" required onValueChange={() => setServerError(null)} />
  <FieldError match="valueMissing">Enter your email address.</FieldError>
  {serverError && <FieldError match>{serverError}</FieldError>}
</Field>
```

## Required and Disabled

A required control marks every part with `data-required`, and the parts' state has `required`, so a label can show a mark with CSS alone.

A disabled field disables its control and marks every part with `data-disabled`, the way a [disabled field set](#disabled-field-sets) does for every field inside it.

## Character Count

Keep the text in state and show its length in the description. Set `maxLength` on the control to enforce the limit.

```tsx
<Field>
  <FieldLabel>Bio</FieldLabel>
  <Textarea
    maxLength={280}
    value={bio}
    onValueChange={(value) => setBio(value)}
  />
  <FieldDescription>{bio.length} / 280</FieldDescription>
</Field>
```

## Forms

The control submits its value under its own `name`, or the field's name if it has none. Reset restores the control's default and hides validation errors. Disabled controls are left out of the submitted values. See [Forms](../forms.md) for the shared form behavior.

## Field Sets

A field set groups related fields under a legend, and disables them together.

```tsx title="field-set.tsx"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <FieldSet>
      <FieldLegend>Address</FieldLegend>
      <FieldDescription>
        We need your address to deliver your order.
      </FieldDescription>
      <FieldGroup>
        <Field name="street">
          <FieldLabel>Street address</FieldLabel>
          <Input autoComplete="street-address" />
        </Field>
        <div data-slot="grid">
          <Field name="city">
            <FieldLabel>City</FieldLabel>
            <Input autoComplete="address-level2" />
          </Field>
          <Field name="postal-code">
            <FieldLabel>Postal code</FieldLabel>
            <Input autoComplete="postal-code" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

export { Example }
```

Move through the address fields. Their legend and description name the group.

`FieldSet` is a native `<fieldset>` and `FieldLegend` a native `<legend>`, so the set is named, and disabled, before scripts run. Keep the legend the first child. A legend rendered as another element, like `render={<div />}`, still names the set through `aria-labelledby`.

A `FieldDescription` right inside the set, outside any `Field`, describes the set, so screen readers read it as focus enters. `FieldGroup` is a `<div>` that stacks the fields, with no role and no state: the field set is what names and disables a group.

## Disabled Field Sets

Disabling the set disables its controls and nested field sets. The form leaves their values out of submissions.

```tsx
<FieldSet disabled={sameAsShipping}>
  <FieldLegend>Billing address</FieldLegend>
  <Field name="billing-street">
    <FieldLabel>Street address</FieldLabel>
    <Input autoComplete="billing street-address" />
  </Field>
</FieldSet>
```

## Groups in a Field Set

The legend names a [checkbox group](./checkbox.md#group) or a [radio group](./radio.md) inside the set, so the group needs no label of its own.

```tsx
<FieldSet>
  <FieldLegend>Notifications</FieldLegend>
  <CheckboxGroup name="notify" defaultValue={["mentions"]}>
    <label>
      <Checkbox value="mentions" />
      Mentions
    </label>
    <label>
      <Checkbox value="follows" />
      New followers
    </label>
  </CheckboxGroup>
</FieldSet>
```

## Custom Rendering

Every part takes `render`, to render a different element or component in its place, like `render={<select />}` on `FieldControl`. As a function, it receives the props to spread and the field's state:

```tsx
<FieldDescription
  render={(props, state) => (
    <p {...props}>
      {state.invalid ? "Use letters and numbers only." : "Letters and numbers."}
    </p>
  )}
/>
```

`className` and `style` can be functions of the state too. `FieldError`'s state also has the `message` for the current problem.

State is read lazily. A part re-renders for a change only if its render function or slot read that value. Each part's state is listed under [State](#state).

## Custom Controls

`useFieldControl` lets a control of your own join the field around it, the way ours do. Outside a field it returns `null`. Inside one, it returns:

- `name`: the field's `name`, for a control that doesn't set its own.
- `disabled`: whether the field is disabled.
- `props(props)`: the control's props with the field's merged in: the `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `disabled` and the field's data attributes, and a ref that tells the field which element is its control. The control keeps its own `data-slot`.

The control re-renders when the field changes, like when its label or errors appear.

```tsx
import * as React from "react"
import { useFieldControl } from "@ui-sdk/react/field"

export function PhoneInput(props: React.ComponentProps<"input">) {
  const field = useFieldControl()
  const input = {
    type: "tel",
    autoComplete: "tel",
    name: field?.name,
    ...props,
    "data-slot": "phone-input",
  }
  return <input {...(field ? field.props(input) : input)} />
}
```

```tsx
<Field>
  <FieldLabel>Phone</FieldLabel>
  <PhoneInput required />
  <FieldError />
</Field>
```

The field reads validity from the native inputs, selects and textareas inside it, so `required` and `pattern` work on the input above. A control that isn't a native input, like a row of buttons, takes part through a native input of its own: ours render one, visually hidden, beside the control.

To build a control from scratch on the primitives ours use, see [Primitives](../core.md#define-a-primitive).

## Styling

Use `data-invalid` and `data-valid` for validation, and `data-focused`, `data-required` and `data-disabled` for the rest. Every part of a field gets the same attributes, so a label can turn red with its control.

Each part has a `data-slot`, such as `field-label`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### Field
`[data-slot="field"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### FieldLabel
`[data-slot="field-label"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### FieldControl
`[data-slot="field-control"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### FieldDescription
`[data-slot="field-description"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### FieldError
`[data-slot="field-error"]`

- `data-disabled`: Present when the field is disabled.
- `data-invalid`: Present while the field shows as invalid: with `invalid`, or once a submit finds the control invalid.

### FieldSet
`FieldGroup` has `data-slot="field-group"` and no state attributes.

`[data-slot="field-set"]`

- `data-disabled`: Present when the field set is disabled, by its own prop or a `<fieldset>` around it.

### FieldLegend
`[data-slot="field-legend"]`

- `data-disabled`: Present when the field set is disabled, by its own prop or a `<fieldset>` around it.

### FieldDescription in a FieldSet
`[data-slot="field-description"]`

- `data-disabled`: Present when the field set is disabled, by its own prop or a `<fieldset>` around it.

## API Reference

Props are the same as below, as React props.

A field has no change events. Read its state from the parts' data attributes, or from render functions. Set `debug` to log every state change and its reason.

### Field

- `name?` (`string`): The name the control submits under, when the control doesn't set its own.
- `disabled?` (`boolean`): Disables the control, and marks every part.
- `invalid?` (`boolean`): Whether the field shows as invalid, when your code decides, like a form library or an error from the server. `true` shows its errors now, `false` shows none whatever the browser thinks. Leave it out to show the browser's own validation once a submit finds the field invalid.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### FieldError

- `match?` (`boolean | ValidityKey`): When this error shows. `true` shows it always and `false` never. A validity flag, like `"valueMissing"`, shows it only for that problem of the browser's own validation. Without it, any problem shows it.

### FieldSet

- `disabled?` (`boolean`): Disables every control inside it, except those in its legend, and leaves them out of the form.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

- `disabled` (`boolean`): Whether the field is disabled, by itself or by a `<fieldset>`.
- `required` (`boolean`): Whether the control is required, read from its `required` or `aria-required`.
- `focused` (`boolean`): Whether focus is inside the control.
- `invalid` (`boolean`): Whether the field shows as invalid: `invalid` when you pass it, else the browser's validation once shown.
- `valid` (`boolean`): Whether the browser's validation passes, once shown. Always false while you pass `invalid`.

- `disabled` (`boolean`): Whether the field is disabled, by itself or by a `<fieldset>`.
- `required` (`boolean`): Whether the control is required, read from its `required` or `aria-required`.
- `focused` (`boolean`): Whether focus is inside the control.
- `invalid` (`boolean`): Whether the field shows as invalid: `invalid` when you pass it, else the browser's validation once shown.
- `valid` (`boolean`): Whether the browser's validation passes, once shown. Always false while you pass `invalid`.
- `message` (`string`): The browser's message for the current problem. Children you pass show instead.

A `FieldDescription` receives the field's state, or only `disabled` when it describes a field set.

- `disabled` (`boolean`): Whether the field set is disabled, by itself or by a field set around it. Whether the field is disabled, by itself or by a `<fieldset>`.
- `required` (`boolean | undefined`): Whether the control is required, read from its `required` or `aria-required`.
- `focused` (`boolean | undefined`): Whether focus is inside the control.
- `invalid` (`boolean | undefined`): Whether the field shows as invalid: `invalid` when you pass it, else the browser's validation once shown.
- `valid` (`boolean | undefined`): Whether the browser's validation passes, once shown. Always false while you pass `invalid`.

Every part of a field set receives the same state.

- `disabled` (`boolean`): Whether the field set is disabled, by itself or by a field set around it.

## Accessibility

The label names the control with `aria-labelledby`, beside a native `<label for>` where the control can take one. The description and any error that shows describe it with `aria-describedby`, and an invalid control has `aria-invalid`. The tests below cover these connections and keyboard behavior.

**Labelling**

- The label names the control.
- The description describes the control.
- Clicking the label of a text field focuses it.

**A label wrapping a field**

- Names the control inside it.
- Checks its control when clicked anywhere.
- Keeps the field's description on its control.
- Names a control that renders after it.
- Keeps the part's data-slot.
- Warns in development only when a label outside a field labels nothing.
- A description and an error outside a field keep their data-slot. Web components only.
- A hidden error outside a field stays hidden whatever display its class gives. Web components only.
- An error outside a field follows its match. Web components only.
- An error outside a field shows a child that arrives after it. Web components only.

**Errors**

- Stay hidden until the form tries to submit.
- Show the browser's message when they have no text of their own.
- Count another library's form-associated element inside the field.
- Describe the control while they show.
- Update as the value changes once shown.
- Update as state set from script changes the value once shown. Web components only.
- A field marked invalid shows its error right away.
- A field marked valid never shows the browser's errors.
- A form reset hides them again.
- Errors in the page replace the browser's message, and the first invalid control takes focus.

Runs in React, Vue and web components.

In a field set:

- The legend names the group.
- A disabled field set disables the controls inside and leaves them out of the form.
- Enabling it again restores the controls.
- A field set disabled from the start disables its required fields.
- Fields in a disabled field set mark their parts disabled.

**Enhancements**

- The description describes the group.

Runs in React, Vue and web components.

In a form:

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
