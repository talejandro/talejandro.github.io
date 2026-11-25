# Image Cropper

Choose the part of an image to keep by moving and resizing a selection, or by panning and zooming the image under it.

Use an image cropper to choose the part of a photo to keep, like a profile picture or a cover image. The crop is a box in the image's own pixels, with a quarter-turn rotation and a flip, ready to pass to [`cropImage`](../core.md#images).

<ComponentExample
  name="image-cropper/basic"
  inspect
  caption="Pick a ratio, drag the selection or one of its handles, then press Crop. Tab to the selection and use the arrow keys, with Shift to move further."
/>

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build an `ImageCropper`:

```text
ImageCropper
├── ImageCropperViewport
│   ├── ImageCropperImage
│   ├── ImageCropperSelection
│   │   └── ImageCropperGrid
│   └── ImageCropperHandle
├── ImageCropperZoom
├── ImageCropperRotate
└── ImageCropperFlip
```

- **ImageCropper** holds the crop and the image's `src`, and is a group around the parts.
- **ImageCropperViewport** is the area the image shows in. Give it a size, and its padding keeps the image off its edges.
- **ImageCropperImage** is the image, turned and flipped. Give it `alt`.
- **ImageCropperSelection** shows the crop over the image. It's a slider you drag or move with the arrow keys.
- **ImageCropperGrid** draws lines across the selection, in thirds, for you to style.
- **ImageCropperHandle** resizes the selection from one edge or corner, its `position`, like `"se"` for the bottom right. It goes beside the selection, not inside it, and sits on its edge or corner.
- **ImageCropperZoom** is a range input from 1, the largest crop, to `maxZoom`.
- **ImageCropperRotate** turns the image a quarter clockwise.
- **ImageCropperFlip** mirrors the image left to right, or top to bottom with `direction="vertical"`.

The viewport, image and selection are needed. The rest are optional.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  ImageCropper,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@ui-sdk/react/image-cropper"

function CoverPhoto({ src }: { src: string }) {
  return (
    <ImageCropper aria-label="Cover photo" src={src} aspectRatio={3}>
      <ImageCropperViewport>
        <ImageCropperImage alt="Your cover photo" />
        <ImageCropperSelection />
        <ImageCropperHandle position="nw" />
        <ImageCropperHandle position="se" />
      </ImageCropperViewport>
    </ImageCropper>
  )
}

export { CoverPhoto }
```

Name the cropper with `aria-label`. Until the image loads, the root has `data-loading` and `aria-busy`, and the selection is hidden. The crop then starts in the middle at `aspectRatio`, four fifths as large as the image allows so its edges show, or as large as it allows in a frame, unless you pass `defaultCrop`:

```tsx
<ImageCropper
  aria-label="Photo"
  src={src}
  defaultCrop={{ x: 40, y: 40, width: 320, height: 240 }}
>
  {/* … */}
</ImageCropper>
```

## Aspect Ratio

Set `aspectRatio` to keep the crop's width over its height, like `1` for a square or `16 / 9`. Changing it fits the crop to the new ratio about its middle. Without one, the crop is free, and holding Shift while dragging a handle keeps its current ratio. `minWidth` and `minHeight` stop it getting too small, in image pixels.

```tsx title="aspect-ratio.tsx"
"use client"

import * as React from "react"
import {
  ImageCropper,
  ImageCropperFlip,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@ui-sdk/react/image-cropper"

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

const ratios = [
  { label: "Free", value: undefined },
  { label: "Square", value: 1 },
  { label: "Wide", value: 16 / 9 },
]

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const

function Example() {
  const [aspectRatio, setAspectRatio] = React.useState<number>()
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        {ratios.map((ratio) => (
          <button
            key={ratio.label}
            type="button"
            aria-pressed={aspectRatio === ratio.value}
            onClick={() => setAspectRatio(ratio.value)}
          >
            {ratio.label}
          </button>
        ))}
      </div>
      <ImageCropper
        aria-label="Photo"
        src={photo}
        aspectRatio={aspectRatio}
        minWidth={64}
        minHeight={64}
      >
        <ImageCropperViewport>
          <ImageCropperImage alt="Mountains at sunset" />
          <ImageCropperSelection>
            <ImageCropperGrid />
          </ImageCropperSelection>
          {handles.map((position) => (
            <ImageCropperHandle key={position} position={position} />
          ))}
        </ImageCropperViewport>
        <div data-slot="row">
          <ImageCropperFlip>Flip</ImageCropperFlip>
          <ImageCropperFlip direction="vertical">
            Flip Vertically
          </ImageCropperFlip>
        </div>
      </ImageCropper>
    </div>
  )
}

export { Example }
```

Choose Square or Wide, then drag an edge. Flip mirrors the image and the crop with it.

## Frame Mode

Set `mode="frame"` for an avatar editor. The selection stays still and as large as it fits, and you pan the image under it with a drag, and zoom with the wheel, a pinch or the zoom input. Handles don't show in a frame.

`shape="circle"` rounds the selection, but the crop is still its box, so pass `shape: "circle"` to `cropImage` too. Here, Save Avatar crops a 128 pixel round file:

```tsx title="avatar.tsx"
"use client"

import * as React from "react"
import { cropImage } from "@ui-sdk/react/image"
import {
  ImageCropper,
  ImageCropperImage,
  ImageCropperRotate,
  ImageCropperSelection,
  ImageCropperViewport,
  ImageCropperZoom,
  type ImageCrop,
} from "@ui-sdk/react/image-cropper"

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

function Example() {
  const [crop, setCrop] = React.useState<ImageCrop>()
  const [avatar, setAvatar] = React.useState<string>()

  React.useEffect(
    () => () => {
      if (avatar) {
        URL.revokeObjectURL(avatar)
      }
    },
    [avatar]
  )

  async function save() {
    if (!crop) {
      return
    }
    const file = await cropImage(photo, crop, { width: 128, shape: "circle" })
    setAvatar(URL.createObjectURL(file))
  }

  return (
    <ImageCropper
      aria-label="Profile photo"
      src={photo}
      mode="frame"
      aspectRatio={1}
      shape="circle"
      maxZoom={4}
      crop={crop}
      onCropChange={setCrop}
    >
      <ImageCropperViewport>
        <ImageCropperImage alt="Mountains at sunset" />
        <ImageCropperSelection />
      </ImageCropperViewport>
      <div data-slot="row">
        <ImageCropperZoom />
        <ImageCropperRotate>Rotate</ImageCropperRotate>
      </div>
      <div data-slot="row">
        <button type="button" onClick={save}>
          Save Avatar
        </button>
        {avatar && (
          <img data-slot="image-cropper-avatar" src={avatar} alt="Your new avatar" />
        )}
      </div>
    </ImageCropper>
  )
}

export { Example }
```

Drag the image or move the zoom, then press Save Avatar. The new avatar shows beside the button.

## Rotate and Flip

`ImageCropperRotate` turns the image a quarter clockwise, and R does the same from the keyboard, with Shift to turn it back. `ImageCropperFlip` mirrors the image. The crop turns and flips with the image, so it keeps the same part of the photo. Its `x` and `y` count from the top left of the image as it shows, turned and flipped, which is what `cropImage` takes.

## Disabled

Set `disabled`. The selection and handles can't be focused or dragged, and the zoom input and buttons are disabled.

```tsx
<ImageCropper aria-label="Photo" src={src} disabled>
  {/* … */}
</ImageCropper>
```

## Controlled

Pass `crop` and update it in `onCropChange`. Each change carries a [reason](#reasons), like `drag`, `step-key` or `zoom-input`. Call `details.cancel()` in the callback to keep the current crop.

`onCropChange` runs on every step of a drag and once the image loads. `onCropCommit` runs once, when the drag, key press or wheel ends, so use it to save. A controller from `createImageCropperController()` sets the crop from anywhere:

```tsx
"use client"

import * as React from "react"
import {
  createImageCropperController,
  ImageCropper,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@ui-sdk/react/image-cropper"

function Photo({ src }: { src: string }) {
  const [controller] = React.useState(() => createImageCropperController())
  return (
    <>
      <ImageCropper
        aria-label="Photo"
        src={src}
        controller={controller}
        onCropCommit={(crop, details) => console.log(crop, details.reason)}
      >
        <ImageCropperViewport>
          <ImageCropperImage alt="Your photo" />
          <ImageCropperSelection />
        </ImageCropperViewport>
      </ImageCropper>
      <button type="button" onClick={() => controller.setZoom(2)}>
        Zoom In
      </button>
    </>
  )
}

export { Photo }
```

See [State and Events](../state-and-events.md) for controlled state, cancellation and debugging.

## Custom Rendering

Every part takes `render`, to render a different element or component in its place. `render`, `className` and `children` can be functions of the part's state. Every part has the `crop`, the `zoom`, and whether it's `loading`, has an `error` or is `dragging`:

```tsx
<ImageCropper aria-label="Photo" src={src}>
  {({ loading, error, zoom }) => (
    <>
      <ImageCropperViewport>
        <ImageCropperImage alt="Your photo" />
        <ImageCropperSelection />
      </ImageCropperViewport>
      {loading && <p>Loading…</p>}
      {error && <p>The image didn't load.</p>}
      <output>{Math.round(zoom * 100)}%</output>
    </>
  )}
</ImageCropper>
```

See [Parts and Composition](../parts-and-composition.md) for the rendering contract and [State](#state) for each part's fields.

## Styling

Parts are unstyled, apart from the positions they need: the viewport is `position: relative` with `overflow: hidden`, and the image, the selection and each handle get their place as inline styles in pixels. A handle's place is the point on its edge or corner, so give it a size and center it with `translate: -50% -50%`. Give the viewport a size too.

A box viewport fits the whole image, so set its `aspect-ratio` to `--image-cropper-aspect-ratio`. A wide `box-shadow` on the selection dims the image outside it. Show the grid only while `data-dragging` is on it.

Each part has a `data-slot`, such as `image-cropper-selection`, and its state attributes are listed under [Data Attributes](#data-attributes).

### ImageCropperViewport
- `--image-cropper-aspect-ratio`: The image's width over its height as it shows, turned, once it loads. Give the viewport `aspect-ratio: var(--image-cropper-aspect-ratio)` to fit the image.

## Data Attributes

### ImageCropper
`[data-slot="image-cropper"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.
- `data-dragging`: Present while a pointer drags the selection, the image or, on a handle, that handle. Show the grid with it.

### ImageCropperViewport
`[data-slot="image-cropper-viewport"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.
- `data-dragging`: Present while a pointer drags the selection, the image or, on a handle, that handle. Show the grid with it.

### ImageCropperImage
`[data-slot="image-cropper-image"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.

### ImageCropperSelection
`[data-slot="image-cropper-selection"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.
- `data-dragging`: Present while a pointer drags the selection, the image or, on a handle, that handle. Show the grid with it.

### ImageCropperGrid
`[data-slot="image-cropper-grid"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.
- `data-dragging`: Present while a pointer drags the selection, the image or, on a handle, that handle. Show the grid with it.

### ImageCropperHandle
`[data-slot="image-cropper-handle"]`

- `data-position` (`n`, `e`, `s`, `w`, `ne`, `nw`, `se`, `sw`): The edge or corner the handle resizes.
- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.
- `data-dragging`: Present while a pointer drags the selection, the image or, on a handle, that handle. Show the grid with it.

### ImageCropperZoom
`[data-slot="image-cropper-zoom"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.

### ImageCropperRotate
`[data-slot="image-cropper-rotate"]`

- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.

### ImageCropperFlip
`[data-slot="image-cropper-flip"]`

- `data-direction` (`horizontal`, `vertical`): Which way the button mirrors the image.
- `data-mode` (`box`, `frame`): How the crop changes.
- `data-shape` (`rectangle`, `circle`): The selection's shape.
- `data-loading`: Present until the image loads, while nothing can change.
- `data-disabled`: Present when the cropper is disabled.
- `data-error`: Present when the image failed to load.

## API Reference

Props and callbacks are the same as below, as React props.

### ImageCropper

- `src?` (`string`): The image's URL, like an object URL for a file someone picked.
- `crop?` (`ImageCrop`): The crop, in the image's own pixels, from the top left of the image as it shows once turned and flipped, with its `rotation`, `flipX` and `flipY`. Pass it straight to `cropImage`. Pass it to control the cropper.
- `defaultCrop?` (`ImageCrop`): The crop at first, when uncontrolled.
- `onCropChange?` (`((crop: Required<ImageCrop>, details: ImageCropperCropChangeDetails) => void)`): Runs while the crop changes: on every step of a drag, a key or the wheel, and once an image loads. `details.cancel()` stops it.
- `onCropCommit?` (`((crop: Required<ImageCrop>, details: ImageCropperCropCommitDetails) => void)`): Runs once an interaction that changed the crop ends: the pointer lifts, a key is pressed, the wheel pauses. For saving.
- `mode?` (`ImageCropperMode`): `"box"` moves and resizes a selection over the whole image. `"frame"` keeps the selection still and as large as it fits, and pans and zooms the image under it, like an avatar editor.
- `aspectRatio?` (`number`): Keeps the crop's width over its height, like `1` for a square or `16 / 9`. Changing it fits the crop to the new ratio.
- `shape?` (`ImageCropperShape`): The selection's shape, as `data-shape`. A circle is still a box to the crop, so pass `shape: "circle"` to `cropImage` too.
- `minWidth?` (`number`): The narrowest the crop gets, in image pixels.
- `minHeight?` (`number`): The shortest the crop gets, in image pixels.
- `maxZoom?` (`number`): How far the crop magnifies the image, where 1 is the largest crop the image allows.
- `disabled?` (`boolean`): Stops every change: the selection can't be focused, and the buttons and zoom are disabled.
- `controller?` (`object`): Sets the crop from anywhere. Create one with `createImageCropperController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ImageCropperHandle

- `position` (`ImageCropperHandlePosition`): The edge or corner it resizes, like `"nw"` for the top left corner.

### ImageCropperFlip

- `direction?` (`ImageCropperFlipDirection`): Which way it mirrors the image.

### State

What render functions, state-based class names and slots receive. Every part gets the cropper's state.

- `crop` (`Required<ImageCrop> | null`): The crop, or null until the image loads.
- `zoom` (`number`): How far the crop magnifies: 1 when it's as large as the image allows at its ratio.
- `loading` (`boolean`): Whether the image is still loading, so nothing can change yet.
- `error` (`boolean`): Whether the image failed to load.
- `dragging` (`boolean`): Whether a pointer is dragging the selection, a handle or the image.
- `mode` (`ImageCropperMode`): How the crop changes.
- `shape` (`ImageCropperShape`): The selection's shape.
- `disabled` (`boolean`): Whether the `disabled` option stops every change.

Handles add their own:

- `crop` (`Required<ImageCrop> | null`): The crop, or null until the image loads.
- `zoom` (`number`): How far the crop magnifies: 1 when it's as large as the image allows at its ratio.
- `loading` (`boolean`): Whether the image is still loading, so nothing can change yet.
- `error` (`boolean`): Whether the image failed to load.
- `dragging` (`boolean`): Whether a pointer is dragging the selection, a handle or the image.
- `mode` (`ImageCropperMode`): How the crop changes.
- `shape` (`ImageCropperShape`): The selection's shape.
- `disabled` (`boolean`): Whether the `disabled` option stops every change.
- `position` (`ImageCropperHandlePosition`): The edge or corner it resizes.

### Reasons

`details.reason` says why the crop changed.

- `image-load` (`Event | undefined`): An image loaded. No event when it was already in the browser's cache.
- `drag` (`PointerEvent`): A slider thumb or a resize handle was dragged, or an item was dragged to a new place in a list.
- `pinch`
- `wheel` (`WheelEvent`): The mouse wheel stepped a focused number input.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `zoom-key`
- `zoom-input`
- `rotate-key`
- `rotate-press`
- `flip-press`
- `aspect-ratio-change`
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createImageCropperController()` and pass it as `controller`.

Each write method takes an optional `{ reason, event }`, runs the change callback like a drag, and returns `false` when nothing changed or the change is canceled.

- `getCrop()` (`() => Required<ImageCrop> | null`): The crop, or null until the image loads.
- `setCrop(crop, options?)` (`(crop: ImageCrop, options?: ImageCropperChangeOptions | undefined) => boolean`): Sets the crop, as a user would. Returns whether it changed.
- `rotate(direction?, options?)` (`(direction?: 1 | -1 | undefined, options?: ImageCropperChangeOptions | undefined) => boolean`): Turns the image a quarter clockwise, or counterclockwise with `-1`.
- `flip(direction?, options?)` (`(direction?: ImageCropperFlipDirection | undefined, options?: ImageCropperChangeOptions | undefined) => boolean`): Mirrors the image left to right, or top to bottom with `"vertical"`.
- `getZoom()` (`() => number`): How far the crop magnifies: 1 when it's as large as the image allows at its ratio.
- `setZoom(zoom, options?)` (`(zoom: number, options?: ImageCropperChangeOptions | undefined) => boolean`): Zooms to a level, about the crop's middle, within 1 and `maxZoom`.
- `focus()` (`() => void`): Moves focus to the selection.

### Events

Callbacks get the new crop first, then the details.

| Prop           | On             | Receives                                                          |
| -------------- | -------------- | ----------------------------------------------------------------- |
| `onCropChange` | `ImageCropper` | `(crop, details)`: the new crop and the [reason](#reasons)        |
| `onCropCommit` | `ImageCropper` | `(crop, details)`: the crop once the interaction ends, its reason |

## Accessibility

No WAI-ARIA pattern covers an image cropper, so it's built from ones that do. The cropper is a group. The selection and each handle follow the [WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/), and say the crop in words, like "300 by 300 pixels, at 50, 0". The zoom is a native range input that says its level, like "125%".

The selection, handles and zoom are named in English by default. Pass `aria-label` to name them in another language.

### Keyboard

| Key                 | Does                                                     |
| ------------------- | -------------------------------------------------------- |
| Arrow keys          | Move the selection, or on a handle, move its edges       |
| Shift with an arrow | Moves ten times as far                                   |
| Plus or Minus       | Zooms in or out, about the crop's middle                 |
| R                   | Turns the image a quarter clockwise, or back with Shift  |
| Escape              | During a drag, puts the crop back where the drag started |

Each key press commits, like the end of a drag.

### Tested Behavior

Every line below is an automated test.

**Loading**

- The crop starts once the image loads, as four fifths of the largest at the ratio.

**Box**

- A drag moves the selection over the image and commits once.
- A handle resizes from its corner, within the image.
- Each handle sits on its edge or corner of the selection, and follows it.
- At a ratio, a handle keeps it.
- Escape during a drag puts the selection back.

**Keyboard**

- Arrows move the selection, ten times as far with Shift.
- Arrows on a handle move its edges, and the next Tab reaches it.
- Plus and minus zoom about the middle, and R turns the image.

**Controls**

- The zoom input zooms the crop.
- Rotate turns the image a quarter clockwise, and flip mirrors it.
- A controller sets the crop, and a canceled change keeps it.
- Disabled, nothing takes focus or changes.

**Frame**

- The selection stays put and a drag pans the image under it.
- Escape during a pan puts the image back.
- The wheel zooms at the pointer and commits after a pause.

Runs in React, Vue and web components.
