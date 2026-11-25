# Separator

Divide groups of content with a horizontal or vertical line.

Use a separator between groups of content that a reader should take as separate, like a profile's header and its bio.

```tsx title="basic.tsx"
import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack">
      <div data-slot="stack">
        <h3>Hollis Grant</h3>
        <p data-slot="hint">hollis@example.com</p>
      </div>
      <Separator />
      <p>
        Designs the billing and onboarding flows, and reviews every new pricing
        page.
      </p>
    </div>
  )
}

export { Example }
```

Read the profile with a screen reader. It announces a separator between Hollis Grant's name and email and the bio below.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Usage

Import the separator and put it between two groups of content:

```tsx
import { Separator } from "@ui-sdk/react/separator"

function Profile() {
  return (
    <section>
      <h2>Hollis Grant</h2>
      <Separator />
      <p>Designs the billing and onboarding flows.</p>
    </section>
  )
}

export { Profile }
```

## Build Your Own

`@ui-sdk/react/separator` comes with a ready-made Separator. If you'd like to build your own, with your own name, start from the `separator` primitive in `@ui-sdk/core`:

```ts title="divider.ts"
"use client"

import { separator } from "@ui-sdk/core/separator"
import { createParts } from "@ui-sdk/react/primitive"

const { Root: Divider } = createParts(separator, { root: "div" })

export { Divider }
```

```tsx
<Divider orientation="vertical" />
```

`Divider` keeps the behavior, state and data attributes of the ready-made Separator: the `separator` role, `aria-orientation` and `data-orientation`. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Vertical

Set `orientation="vertical"` for a line between items in a row. It takes the row's height.

```tsx title="vertical.tsx"
import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <nav aria-label="Legal" data-slot="row">
      <a href="#">Privacy</a>
      <Separator orientation="vertical" />
      <a href="#">Terms</a>
      <Separator orientation="vertical" />
      <a href="#">Cookies</a>
    </nav>
  )
}

export { Example }
```

Read across Privacy, Terms and Cookies. A screen reader announces a vertical separator between each link.

## Stacked Content

A vertical separator stretches to the tallest item in its row, so it spans a number and its label.

```tsx title="menu.tsx"
import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="row">
      <div data-slot="stack">
        <span>24</span>
        <span data-slot="hint">Projects</span>
      </div>
      <Separator orientation="vertical" />
      <div data-slot="stack">
        <span>1,280</span>
        <span data-slot="hint">Followers</span>
      </div>
      <Separator orientation="vertical" />
      <div data-slot="stack">
        <span>312</span>
        <span data-slot="hint">Following</span>
      </div>
    </div>
  )
}

export { Example }
```

Compare the lines with the stats. Each one runs the full height of Projects, Followers and Following.

## Rows

Put a separator between each pair of rows to divide a list of details.

```tsx title="list.tsx"
import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack">
      <dl>
        <dt>Plan</dt>
        <dd>Pro</dd>
      </dl>
      <Separator />
      <dl>
        <dt>Seats</dt>
        <dd>8 of 10</dd>
      </dl>
      <Separator />
      <dl>
        <dt>Renews</dt>
        <dd>December 1, 2026</dd>
      </dl>
    </div>
  )
}

export { Example }
```

Read the plan details with a screen reader. It announces a separator between Plan, Seats and Renews.

## Decorative

Set `decorative` when the line adds no information. Here, the word “or” already says the two ways to sign in are separate, so a screen reader skips the lines.

```tsx title="decorative.tsx"
import { Separator } from "@ui-sdk/react/separator"

function Example() {
  return (
    <div data-slot="stack">
      <button type="button" data-variant="solid">
        Sign In with Passkey
      </button>
      <div data-slot="row">
        <Separator decorative />
        <span>or</span>
        <Separator decorative />
      </div>
      <button type="button">Email Me a Link</button>
    </div>
  )
}

export { Example }
```

Read from Sign In with Passkey to Email Me a Link with a screen reader. It reads “or” and skips the lines.

A decorative separator gets `role="none"` and no `aria-orientation`. It keeps `data-orientation` for styling.

## Custom Rendering

Pass `render` to use a different element, such as `render={<hr />}`. See [Parts and Composition](../parts-and-composition.md) for reading the separator's state.

## Styling

The separator is unstyled. Give it a background, a height when it's horizontal and a width when it's vertical, and use `data-orientation` to tell them apart. A vertical line takes its row's height with `align-self: stretch`.

The separator has a `data-slot` of `separator`, and its `data-orientation` is listed under [Data Attributes](#data-attributes).

## Data Attributes

### Separator
`[data-slot="separator"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the line runs.

## API Reference

Props are the same as below, as React props.

### Separator

- `orientation?` (`SeparatorOrientation`): Which way the line runs. A vertical separator divides items in a row.
- `decorative?` (`boolean`): Hides the separator from assistive technology with `role="none"`, for a line that's only visual. Leave it off when the separator divides content a screen reader should hear as separate, like groups of menu items.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

What render functions and state-based class names receive.

- `orientation` (`SeparatorOrientation`): Which way the line runs.

## Accessibility

The component follows the [WAI-ARIA separator role](https://www.w3.org/TR/wai-aria-1.2/#separator). A separator divides content a screen reader should hear as separate, and it's announced with `role="separator"` and its `aria-orientation`. A decorative separator is only visual: it gets `role="none"`, so screen readers skip it. Use `decorative` only when the surrounding content already conveys the division. Either way, a separator never takes focus, so Tab moves past it.

### Tested Behavior

Every line below is an automated test.

- A separator is announced with its orientation.
- A separator can't be focused.
- A separator carries its orientation for styling.

Runs in React, Vue and web components.
