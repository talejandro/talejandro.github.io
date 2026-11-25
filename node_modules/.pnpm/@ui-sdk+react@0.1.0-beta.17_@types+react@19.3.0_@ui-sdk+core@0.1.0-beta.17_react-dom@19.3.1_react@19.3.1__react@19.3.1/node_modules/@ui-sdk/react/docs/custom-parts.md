# Custom Parts

Write a part with its own React logic and connect it to a primitive.

The parts from [Rendering Primitives](./rendering.md) are enough until one needs its own logic. You can replace just that part and keep the same `rating.ts` definition from [Compose Behaviors](./core.md#complete-primitive).

## Write a Root Part

Here's a replacement for the generated `RatingRoot`. `usePrimitive` creates its instance, and `usePart` connects the `root` slot:

```tsx title="rating-root.tsx"
"use client"

import type { StateOf } from "@ui-sdk/core"
import { usePart, usePrimitive, type PartProps } from "@ui-sdk/react/primitive"
import { rating, type RatingOptions } from "./rating"

function RatingRoot({
  value,
  defaultValue,
  onValueChange,
  ...props
}: RatingOptions &
  Omit<PartProps<"div", StateOf<typeof rating, "root">>, "defaultValue">) {
  const handle = usePrimitive(rating, { value, defaultValue, onValueChange })
  return usePart(handle, "root", {}, props, "div")
}

export { RatingRoot }
```

Pass primitive options to `usePrimitive` and element props to `usePart`. The empty `{}` is for slot props; this root doesn't need any. `usePart` shares the instance with child parts and renders nothing when the slot isn't present.

The adapter keeps options current and manages the instance's lifetime. Call `handle.api` from event handlers or effects. To render changing state, use a part's `children` or `render` function; reading `handle.state` alone doesn't subscribe to changes.

## Connect a Child Part

A child can pass the primitive itself to `usePart`. It finds the instance shared by the root above it.

This `RatingStar` works inside the manual root above or the generated `RatingRoot`. It adds a default accessible label:

```tsx
"use client"

import { usePart, type PartProps } from "@ui-sdk/react/primitive"
import { rating } from "./rating"

function RatingStar({
  value,
  ...props
}: { value: string } & Omit<PartProps<"button">, "value">) {
  const label = `${value} ${value === "1" ? "star" : "stars"}`
  return usePart(
    rating,
    "star",
    { value },
    { "aria-label": label, ...props },
    "button"
  )
}

export { RatingStar }
```

`{ value }` identifies the star. The remaining props go to its button. A caller can override the label with `aria-label`.

Use it in place of the generated star in [Render the Rating](./rendering.md#render-the-rating). Keep it inside `RatingRoot` so it can find the instance.

## Merge Props

Use `mergeProps` when your part adds props that need to combine with the caller's. For example, an input can select its text on focus while still accepting an `onFocus` handler:

```tsx
"use client"

import {
  mergeProps,
  renderElement,
  type PartProps,
} from "@ui-sdk/react/primitive"
import type { FocusEvent } from "react"

function SelectOnFocusInput({ render, ...props }: PartProps<"input">) {
  const own = {
    onFocus: (event: FocusEvent<HTMLInputElement>) =>
      event.currentTarget.select(),
  }
  return renderElement("input", mergeProps(own, props), render)
}

export { SelectOnFocusInput }
```

The caller's handler runs first and can call `preventDefault()` to skip yours. Class names join, styles merge, and refs combine. Other values from later arguments win; `undefined` doesn't replace an existing value.

For native `pointerenter` and `pointerleave` slot listeners, canceling React's handler doesn't cancel the slot's listener.

## An Element Without a Primitive

`renderElement` also works for a plain wrapper. It gives the wrapper the same `render` prop as the other parts:

```tsx
"use client"

import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

function Card({ render, ...props }: PartProps<"div">) {
  return renderElement("div", props, render)
}

export { Card }
```

`PartProps` supplies the element props and `render`. Add its second type argument when `className`, `style`, or `children` should receive your part's state.

`renderElement` uses no hooks, so a wrapper like `Card` also works in a Server Component. Anything built on `usePrimitive`, `usePart` or `createParts` still needs a client component, since those use hooks. [Server Rendering](./server-rendering.md#wrappers-in-a-server-component) shows one.

## Compose a Popup

A custom part can render an existing Popover or Dialog and connect its open state. [Compose Ours](./core.md#compose-ours) shows that connection with an emoji picker.
