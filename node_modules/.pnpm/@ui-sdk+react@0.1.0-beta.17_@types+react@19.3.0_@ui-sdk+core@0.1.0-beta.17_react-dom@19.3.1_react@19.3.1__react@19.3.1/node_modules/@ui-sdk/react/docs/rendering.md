# Rendering Primitives

Turn a Core primitive into React components with createParts.

This page renders the rating from [Compose Behaviors](./core.md#compose-behaviors). Start with that guide's [complete `rating.ts`](./core.md#complete-primitive): it already handles selection, arrow keys, and focus. Here we'll connect its `root` and `star` slots to React.

## Create the Parts

`createParts` maps slots to elements. Save this beside `rating.ts`:

```ts title="rating-parts.ts"
"use client"

import { createParts } from "@ui-sdk/react/primitive"
import { rating } from "./rating"

const { Root: RatingRoot, Star: RatingStar } = createParts(rating, {
  root: "div",
  star: "button",
})

export { RatingRoot, RatingStar }
```

`Root` creates the instance and shares it with the parts inside. Each mapped slot becomes a component. Slot names become Pascal case: `star` becomes `Star`, and `tab-icon` would become `TabIcon`.

If you leave out the `root` tag, `Root` still shares the instance but renders only its children.

## Render the Rating

The root accepts the primitive's options and the element's props. Each star receives its slot value and a name a screen reader can announce:

```tsx
"use client"

import { RatingRoot, RatingStar } from "./rating-parts"

function Example() {
  return (
    <RatingRoot defaultValue={4} aria-label="Rating" className="flex gap-1">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <RatingStar
          key={star}
          value={String(star)}
          aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
          className="opacity-40 data-filled:opacity-100"
        >
          ★
        </RatingStar>
      ))}
    </RatingRoot>
  )
}

export { Example }
```

The primitive supplies `data-filled`; these classes make the filled stars easier to see. [Styling and Animation](./styling-and-animation.md) covers other ways to style parts.

Generated parts also support the same `render` prop and state callbacks as the components in the catalog. Use [Parts and Composition](./parts-and-composition.md) when you want to change their markup.

## Wrap the Parts

If callers always want a row of stars, wrap the parts in one `Rating` component. This version adds `max` and `starLabel` while forwarding the primitive options and root element props. You can use it instead of the separate parts above.

```tsx
// rating-react.tsx
"use client"

import { createParts, type PartProps } from "@ui-sdk/react/primitive"
import { rating, type RatingOptions } from "./rating"

const parts = createParts(rating, { root: "div", star: "button" })

function Rating({
  max = 5,
  starLabel = (star) => `${star} ${star === 1 ? "star" : "stars"}`,
  ...props
}: RatingOptions & {
  max?: number
  starLabel?: (star: number) => string
} & Omit<PartProps<"div">, "defaultValue">) {
  return (
    <parts.Root {...props}>
      {Array.from({ length: max }, (_, index) => index + 1).map((star) => (
        <parts.Star
          key={star}
          value={String(star)}
          aria-label={starLabel(star)}
        >
          ★
        </parts.Star>
      ))}
    </parts.Root>
  )
}

export { Rating }
```

```tsx
import { Rating } from "./rating-react"

function Example() {
  return (
    <Rating
      defaultValue={4}
      aria-label="Rating"
      className="flex gap-1 [&>button]:opacity-40 [&>[data-filled]]:opacity-100"
    />
  )
}

export { Example }
```

Pass classes to the rendered parts. [Styling and Animation](./styling-and-animation.md) also shows how to use CSS Modules.

## Add Logic to a Part

Keep `createParts` when mapping slots to elements is enough. [Custom Parts](./custom-parts.md) uses the same rating to show how `usePrimitive` and `usePart` let you write your own root or child part.
