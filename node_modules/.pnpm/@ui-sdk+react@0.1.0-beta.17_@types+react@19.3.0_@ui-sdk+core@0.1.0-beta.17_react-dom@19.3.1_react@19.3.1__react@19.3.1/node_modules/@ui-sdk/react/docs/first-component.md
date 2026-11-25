# First Component

Add a component to your app and style its state.

Let's add a Bookmark toggle. Press it once to turn it on, then again to turn it off.

If you haven't installed the packages yet, start with [Installation](./installation.md).

## Create the Component

Create `bookmark-button.tsx` next to your app component and render a `Toggle`:

```tsx title="bookmark-button.tsx"
import { Toggle } from "@ui-sdk/react/toggle"

function BookmarkButton() {
  return <Toggle>Bookmark</Toggle>
}

export { BookmarkButton }
```

`Toggle` renders a button. It keeps track of its pressed state, handles Enter and Space, and sets `aria-pressed` for screen readers.

## Use It in Your App

In your app component (`app.tsx` here), import and render `BookmarkButton`:

```tsx title="app.tsx"
import { BookmarkButton } from "./bookmark-button"

function App() {
  return <BookmarkButton />
}

export { App }
```

Open your app. You should see a button labeled Bookmark. Next, add styles so you can tell when it is pressed.

## Add Styles

When the toggle is pressed, it has a `data-pressed` attribute. Use that attribute to change its appearance.

With Tailwind CSS configured in your app, add utility classes to `className`. The `data-pressed:` variant applies while the toggle is pressed:

```tsx title="bookmark-button.tsx"
import { Toggle } from "@ui-sdk/react/toggle"

function BookmarkButton() {
  return (
    <Toggle className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 data-pressed:bg-neutral-900 data-pressed:text-white">
      Bookmark
    </Toggle>
  )
}

export { BookmarkButton }
```

Try the styled toggle:

```tsx title="first-component.tsx"
import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return <Toggle data-variant="outline">Bookmark</Toggle>
}

export { Example }
```

Click Bookmark to turn it on or off. A filled background means it is on. You can also focus the button with Tab and press Enter or Space.

Keep the label the same in both states. `aria-pressed` tells a screen reader whether the toggle is on.

## Keep Going

- [Toggle](./components/toggle.md) covers disabled states, controlled state, and groups of toggles.
- [Components](./README.md) lists the other components you can add with the same install.
- [Parts and Composition](./parts-and-composition.md) shows how to put a component with several parts together.
- [State and Events](./state-and-events.md) shows how to read changes and control state from your app.
- [Styling and Animation](./styling-and-animation.md) covers state attributes, CSS variables, and transitions.
