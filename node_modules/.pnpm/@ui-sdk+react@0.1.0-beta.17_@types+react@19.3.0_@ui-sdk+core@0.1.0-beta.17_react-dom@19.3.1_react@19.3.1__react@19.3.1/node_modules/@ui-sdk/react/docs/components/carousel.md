# Carousel

Page through slides with native scrolling, keyboard controls, and optional rotation.

Use a Carousel to show a set of slides one view at a time, like product photos or featured stories. It scrolls natively, so swipes and trackpads work, and Previous and Next buttons page through the slides.

```tsx title="basic.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured">
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
```

Use Previous and Next, swipe the slides, or focus the viewport and use the arrow keys.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Carousel`:

```text
Carousel
├── CarouselViewport
│   └── CarouselContent
│       ├── CarouselItem
│       └── CarouselItem
├── CarouselPrevious
└── CarouselNext
```

Put the slides inside a viewport, then add the controls you need.

The viewport is the scrolling window, and the content is the row of slides inside it, a flex row (a column when vertical). Name the carousel with `aria-label`, like "Featured products", and give Previous, Next, the indicators and the play toggle text, or an `aria-label` when they hold an icon.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  Carousel,
  CarouselViewport,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@ui-sdk/react/carousel"

function FeaturedSlides() {
  return (
    <Carousel aria-label="Featured">
      <CarouselViewport>
        <CarouselContent>
          <CarouselItem>First slide</CarouselItem>
          <CarouselItem>Second slide</CarouselItem>
        </CarouselContent>
      </CarouselViewport>
      <CarouselPrevious>Previous</CarouselPrevious>
      <CarouselNext>Next</CarouselNext>
    </Carousel>
  )
}

export { FeaturedSlides }
```

## Vertical

`orientation="vertical"` scrolls up and down. Give the viewport a height. Up and down arrows page it, not left and right.

```tsx title="vertical.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured" orientation="vertical">
      <CarouselViewport>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <div data-slot="tile">{slide}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronUpIcon />
        </CarouselPrevious>
        <CarouselNext aria-label="Next slide">
          <ChevronDownIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
```

Scroll vertically, or use the up and down controls.

## Loop

`loop` makes the slides go round. Next on the last page goes to the first, which comes in after the last, and a swipe, a drag or a wheel back from the first page reaches the last, with native scrolling all the way. Rotation always wraps.

The slides take turns at the ends of the content with CSS `order` while the carousel rests, so the current page always has slides on both sides. They keep their place in the document, so screen readers and Tab follow the slides' own order. The content needs to lay its slides out in a row with even gaps, as flex and grid do, and hold a page of slides to either side of the current one. With fewer, like two slides one to a view, Next on the last page scrolls back to the first instead.

```tsx title="loop.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured" loop>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
```

Keep moving forward or backward to wrap around the slides.

## Align

`align` lines pages up at the viewport's `start` (the default), `center` or `end`. Centered slides narrower than the viewport let their neighbors peek in. The first and last pages stay at the ends of the content, so there's no empty space before the first slide.

```tsx title="align.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import * as React from "react"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]
const alignments = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]

function Example() {
  const [align, setAlign] = React.useState<"start" | "center" | "end">("center")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={alignments}
          value={align}
          onValueChange={(next) => next && setAlign(next as typeof align)}
        >
          <SelectLabel>Align</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {alignments.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Carousel aria-label="Photos" align={align} defaultPage={2}>
        <div data-slot="row">
          <CarouselPrevious aria-label="Previous slide">
            <ChevronLeftIcon />
          </CarouselPrevious>
          <CarouselViewport>
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.name}>
                  <div data-slot="tile">{photo.name}</div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </CarouselViewport>
          <CarouselNext aria-label="Next slide">
            <ChevronRightIcon />
          </CarouselNext>
        </div>
      </Carousel>
    </div>
  )
}

export { Example }
```

Choose Start, Center or End, then page through the slides. Centered slides let their neighbors peek in on both sides.

## Default Page

`defaultPage` is the page it starts on, when uncontrolled. It's 1 by default.

```tsx title="default-page.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  return (
    <Carousel aria-label="Featured" defaultPage={3}>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
```

Start on the chosen page, then move forward or backward.

## Indicators

Indicators are a tablist: one Tab stop on the current page, arrows to move between them and show their page, Home and End for the ends. Each controls the slides of its page.

Write one per slide. Those past the page count hide themselves, so the same markup works however many slides
fit. An indicator's `page` is inferred from their order; pass it to render the selected one on the server.

```tsx title="indicators.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselViewport,
} from "@ui-sdk/react/carousel"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function Example() {
  return (
    <Carousel aria-label="Photos">
      <CarouselViewport>
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.name}>
              <div data-slot="tile">{photo.name}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <CarouselIndicatorGroup aria-label="Choose a photo">
        {photos.map((photo, index) => (
          <CarouselIndicator key={photo.name} page={index + 1} aria-label={photo.name} />
        ))}
      </CarouselIndicatorGroup>
    </Carousel>
  )
}

export { Example }
```

Choose a named indicator, then use arrows, Home, and End to move between them.

## Pages

`slidesPerPage` is how many slides a page holds: Next moves that many, and each indicator stands for that
many. `"auto"` fits as many as show. Pages that can't reach the start, like the last few slides, merge into
the last page. With three slides in view, five slides make three pages at one slide per page, or two pages at three per page.

```tsx title="pages.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const products = [1, 2, 3, 4, 5, 6, 7, 8]

function Example() {
  return (
    <Carousel aria-label="Products" slidesPerPage={3}>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous page">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product}>
                <div data-slot="tile">{product}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next page">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
      <div data-slot="row">
        <CarouselIndicatorGroup aria-label="Choose a page">
          {(state) =>
            Array.from({ length: state.pageCount ?? 3 }, (_, index) => (
              <CarouselIndicator key={index} page={index + 1} aria-label={`Page ${index + 1}`} />
            ))
          }
        </CarouselIndicatorGroup>
      </div>
    </Carousel>
  )
}

export { Example }
```

Move through groups of slides using the page controls.

## Thumbnails

A gallery and a strip of thumbnails share the selected page. The thumbnail carousel scrolls freely with `dragFree` and fits as many as show. Pressing a thumbnail selects its slide.

```tsx title="thumbnails.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import * as React from "react"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function Example() {
  const [page, setPage] = React.useState(1)
  const strip = React.useRef<HTMLDivElement>(null)
  const show = (next: number) => {
    setPage(next)
    strip.current
      ?.querySelectorAll("button")
      [next - 1]?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }
  return (
    <div data-slot="stack">
      <Carousel aria-label="Photos" page={page} onPageChange={show}>
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.name}>
                <div data-slot="tile">{photo.name}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
      </Carousel>
      <Carousel ref={strip} aria-label="Thumbnails" dragFree slidesPerPage="auto">
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem key={photo.name} aria-label={photo.name}>
                <button
                  type="button"
                  aria-pressed={page === index + 1}
                  onClick={() => setPage(index + 1)}
                >
                  {photo.name}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
      </Carousel>
    </div>
  )
}

export { Example }
```

Choose a thumbnail to change the gallery, or scroll either strip.

## Autoplay

`defaultPlaying` starts rotating, every `interval` milliseconds (5000 by default). `CarouselPlayToggle`
starts and stops it; label it from `playing` in its state.

As the carousel pattern asks, rotation stops when keyboard focus moves in and doesn't restart until the user asks, and pauses while the mouse is over it. It also pauses while the tab is hidden, while the carousel is scrolled out of view and while a finger is down. Changing slides yourself stops it. The slides are a polite live region only while it isn't rotating, so screen readers aren't interrupted every few seconds. It doesn't start on its own when the user prefers reduced motion.

`--carousel-interval` on the root is the interval, and `data-paused` is there while it's paused, so a progress bar can time itself with CSS.

```tsx title="autoplay.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "./log"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

function Example() {
  const log = useLog()
  return (
    <Carousel
      aria-label="Photos"
      defaultPlaying
      interval={4000}
      onPlayingChange={(playing, details) =>
        log(`${playing ? "Playing" : "Stopped"} (${details.reason})`)
      }
    >
      <div data-slot="controls">
        <CarouselPlayToggle>
          {(state) => (state.playing ? "Pause" : "Play")}
        </CarouselPlayToggle>
      </div>
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.name}>
                <div data-slot="tile">{photo.name}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
```

Start or stop rotation. Hover to pause it, or move keyboard focus inside to stop it. The console logs each change and why.

## Progress

`--carousel-progress` on the root says how far the slides have scrolled, from 0 at the first page to 1 at the last, on every frame of a scroll or a spring, with no re-renders, so a progress bar can follow it in CSS. With `loop`, it goes round from 0 to 1 and back to 0. The controller's `getProgress()` reads the same number.

`onPageChangeComplete` runs once the slides come to rest on a page, after a spring, a drag or a scroll.
Start work there that would stutter the motion, like loading the next slides' images.

```tsx title="progress.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "./log"

const slides = [1, 2, 3, 4, 5]

function Example() {
  const log = useLog()
  return (
    <Carousel
      aria-label="Featured"
      onPageChangeComplete={(page) => log(`Rested on slide ${page}`)}
    >
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
      <div data-slot="row">
        <div data-slot="bar">
          <div />
        </div>
      </div>
    </Carousel>
  )
}

export { Example }
```

Move through the slides. The progress bar follows the scroll position, and the console logs the slide it rests on.

## Controlled

Pass `page` and `onPageChange` to control the page, from 1. The root's state has `pageCount`, which is null
until the slides are measured.

Every change carries a [reason](#reasons): `next-press` and `previous-press` for the parts, `item-press` for an indicator, `list-navigation` for arrow keys, `swipe` for a finger or a mouse drag, `scroll` for a wheel or trackpad, `timeout` for rotation and `imperative` from a [controller](#controller). Call `details.cancel()` to stay on the page: a swipe or drag springs back. A controlled page that doesn't change scrolls back too.

```tsx title="controlled.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const slides = [1, 2, 3, 4, 5]

function Example() {
  const [page, setPage] = React.useState(1)
  const log = useLog()
  return (
    <Carousel
      aria-label="Featured"
      page={page}
      onPageChange={(next, details) => {
        setPage(next)
        log(`Page ${next} (${details.reason})`)
      }}
    >
      <div data-slot="row">
        <CarouselPrevious aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
      </div>
    </Carousel>
  )
}

export { Example }
```

Change the page. The console logs each page and the reason for the change.

## Paging from Anywhere

A [controller](#controller), from `createCarouselController()`, pages the carousel from anywhere. Pass it
as `controller` to the carousel, and to `CarouselPrevious`, `CarouselNext`, `CarouselIndicatorGroup` or
`CarouselPlayToggle` placed outside it, like in a section header.

`drag={false}` turns off swiping and dragging, so only the parts, keys and controllers move it.

```tsx title="controller.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
  createCarouselController,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useState } from "react"

const slides = [1, 2, 3, 4, 5]

function Example() {
  const [carousel] = useState(createCarouselController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <CarouselPrevious controller={carousel} aria-label="Previous slide">
          <ChevronLeftIcon />
        </CarouselPrevious>
        <CarouselNext controller={carousel} aria-label="Next slide">
          <ChevronRightIcon />
        </CarouselNext>
        <button type="button" onClick={() => carousel.setPage(5)}>
          Show the Last Slide
        </button>
      </div>
      <Carousel aria-label="Featured" controller={carousel} drag={false}>
        <CarouselViewport>
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide}>
                <div data-slot="tile">{slide}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
      </Carousel>
    </div>
  )
}

export { Example }
```

Use the controls outside the carousel to change its page.

## Swipes and Drags

Touch, trackpads and wheels scroll the viewport natively, with CSS scroll snap doing the paging. Native scrolling and snapping also work before JavaScript loads. A mouse or pen drags the slides too: they follow the pointer, stretch past the ends, and spring from the release velocity to the page a fling would reach. A drag that moved never clicks the link it started on, and fields inside slides keep their pointer.

Without `skipSnaps`, one swipe moves at most one page. `dragFree` lets swipes coast to wherever they stop,
and the nearest page becomes the current one.

Buttons, keys, indicators, rotation, and controllers animate the scroll position. A second press updates the destination while it is moving. Reduced motion makes those changes immediate.

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives
the props and the part's state. `className`, `style` and `children` can be functions of the same state: a
slide's `index`, `active` and `inView`, a step's `disabled`, an indicator's `page` and `selected`, the play
toggle's `playing` and `paused`.

```tsx title="render.tsx"
"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@ui-sdk/react/carousel"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const photos = [
  { name: "Dunes" },
  { name: "Forest" },
  { name: "Glacier" },
  { name: "Canyon" },
  { name: "Meadow" },
  { name: "Harbor" },
]

const nextFocused = () =>
  typeof document !== "undefined" &&
  document.activeElement?.getAttribute("data-slot") === "carousel-next"

function Example() {
  return (
    <Carousel aria-label="Photos">
      <CarouselViewport>
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.name}>
              {(state) => (
                <div data-slot="tile">
                  {photo.name}
                  <span data-slot="hint">
                    {state.index + 1} / {photos.length}
                    {state.active && " · showing"}
                  </span>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div data-slot="row">
        <CarouselPrevious>
          <ChevronLeftIcon />
          Previous
        </CarouselPrevious>
        <CarouselNext
          render={(props, state) =>
            state.disabled ? (
              <a
                href="https://example.com/gallery"
                ref={nextFocused() ? (link) => link?.focus() : undefined}
              >
                See all photos
              </a>
            ) : (
              <button {...props}>
                Next
                <ChevronRightIcon />
              </button>
            )
          }
        />
      </div>
    </Carousel>
  )
}

export { Example }
```

Change slides to see each slide and control describe its current state.

## Styling

Use `data-disabled` on Previous and Next at their end, `data-selected` on the current indicator, `data-active` on the current page's slides, `data-in-view` on slides in view, and `data-playing` and `data-paused` on the root.

Slides size themselves: give them a `flex-basis` of 100% for one to a view or a third for three, and put the gap on the content, taking it out of each basis. The viewport writes the few styles scrolling needs inline: its overflow, `scroll-snap-type` and `overscroll-behavior`. Slides get `flex-shrink: 0` and their snap alignment. Hide the scrollbar with `scrollbar-width: none` if you like.

Each part has a `data-slot`, such as `carousel-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

### Carousel
- `--carousel-interval`: How long each page shows while rotating, like `500ms`. Time a progress bar's animation with it.
- `--carousel-progress`: How far the slides have scrolled, from 0 at the first page to 1 at the last, or round the loop. It follows every frame of a scroll or spring.

## Data Attributes

### Carousel
`[data-slot="carousel"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.
- `data-playing`: Present while it rotates on its own.
- `data-paused`: Present while rotation is paused for now: hovered, the tab hidden, scrolled out of view or held. Pause a progress animation with it.

### CarouselViewport
`[data-slot="carousel-viewport"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.
- `data-dragging`: Present while a mouse or pen drags the slides.

### CarouselContent
`[data-slot="carousel-content"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.

### CarouselItem
`[data-slot="carousel-item"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the slides scroll, and which arrow keys page.
- `data-active`: Present on the slides of the current page.
- `data-in-view`: Present on slides at least half in view. Slides without it are inert and hidden from screen readers.

### CarouselPrevious
`[data-slot="carousel-previous"]`

- `data-disabled`: Present on Previous or Next when there's no page that way, beside `aria-disabled`. It stays focusable and does nothing.

### CarouselIndicator
`[data-slot="carousel-indicator"]`

- `data-selected`: Present on the current page's indicator, beside `aria-selected`.

### CarouselPlayToggle
`[data-slot="carousel-play-toggle"]`

- `data-playing`: Present while it rotates on its own.
- `data-paused`: Present while rotation is paused for now: hovered, the tab hidden, scrolled out of view or held. Pause a progress animation with it.

## API Reference

Props and callbacks are the same as below, as React props.

### Carousel

- `page?` (`number`): The current page, from 1. Pass it to control the carousel.
- `defaultPage?` (`number`): The page it starts on, from 1, when uncontrolled.
- `onPageChange?` (`((page: number, details: ChangeDetails<CarouselPageChangeReason>) => void)`): Runs when the page wants to change. `details.reason` says why, and `details.cancel()` stays on the page.
- `onPageChangeComplete?` (`((page: number) => void)`): Runs once the slides come to rest on a page, after a spring, a drag or a scroll, with that page. Start work there that would stutter the motion.
- `playing?` (`boolean`): Whether it rotates through the pages on its own. Pass it to control rotation.
- `defaultPlaying?` (`boolean`): Whether it starts rotating, when uncontrolled. It doesn't when the user prefers reduced motion; the play toggle still starts it.
- `onPlayingChange?` (`((playing: boolean, details: ChangeDetails<CarouselPlayingChangeReason>) => void)`): Runs when rotation wants to start or stop. Keyboard focus moving in and the user paging stop it, as the carousel pattern asks.
- `interval?` (`number`): How long each page shows while rotating, in ms. Hovering, a hidden tab and scrolling the carousel out of view pause it.
- `orientation?` (`CarouselOrientation`): Which way the slides scroll, and which arrow keys page.
- `align?` (`CarouselAlign`): Where a page lines up in the viewport.
- `slidesPerPage?` (`CarouselSlidesPerPage`): How many slides one page holds: Next moves this many, and each indicator stands for this many. `"auto"` fits as many as the viewport shows.
- `loop?` (`boolean`): Whether the slides go round: Next on the last page goes to the first, which comes in after the last, and a swipe back from the first page reaches the last. With fewer than a page of slides to either side, Next on the last page scrolls back to the first instead.
- `skipSnaps?` (`boolean`): Whether a fast swipe can pass over pages. Without it, one swipe moves one page.
- `dragFree?` (`boolean`): Whether swipes and drags coast to wherever they stop instead of a page. The nearest page becomes the current one.
- `drag?` (`boolean`): Whether swiping, dragging and scrolling move the slides. Without it, only the parts, keys and controllers do.
- `controller?` (`object`): Pages the carousel from anywhere. Create one with `createCarouselController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CarouselViewport

The scrolling area. Renders a `div` that scrolls and snaps natively, and takes focus for the arrow keys.

### CarouselContent

Holds the slides. Renders a `div` that announces slides coming into view, except while rotating.

### CarouselItem

One slide. Renders a `div` with the group role, named by its position, like "2 of 5".

### CarouselPrevious

- `controller?` (`object`): The carousel this part drives when it isn't inside one, like buttons in a page header.

### CarouselNext

Shows the next page. Takes the same props as `CarouselPrevious`.

### CarouselIndicatorGroup

Groups the indicators. Renders a `div` with the tablist role. Takes the same props as `CarouselPrevious`.

### CarouselIndicator

- `page?` (`number`): The page it shows and selects, from 1. Inferred from the indicators' order when left out.

### CarouselPlayToggle

Starts and stops rotation. Renders a `button`. Takes the same props as `CarouselPrevious`.

### State

What render functions, state-based class names and slots receive, per part.

`Carousel`:

- `page` (`number`): The current page, from 1.
- `pageCount` (`number | null`): How many pages there are, or null before the slides are measured, like on the server.
- `playing` (`boolean`): Whether it rotates on its own.
- `orientation` (`CarouselOrientation`): Which way the slides scroll.

`CarouselViewport`:

- `orientation` (`CarouselOrientation`): Which way the slides scroll.
- `dragging` (`boolean`): Whether a mouse or pen is dragging the slides.

`CarouselContent`:

- `orientation` (`CarouselOrientation`): Which way the slides scroll.

`CarouselItem`:

- `index` (`number`): The slide's position among the slides, from 0. -1 until it's measured.
- `active` (`boolean`): Whether the slide belongs to the current page.
- `inView` (`boolean`): Whether at least half of the slide shows. Slides out of view are inert.

`CarouselPrevious` and `CarouselNext`:

- `disabled` (`boolean`): Whether there's no page that way, so pressing does nothing. It stays focusable.

`CarouselIndicatorGroup`:

- `page` (`number`): The current page, from 1.
- `pageCount` (`number | null`): How many pages there are, or null before the slides are measured.

`CarouselIndicator`:

- `page` (`number`): The page it stands for, from 1, or 0 before it's known.
- `selected` (`boolean`): Whether its page is the current one.

`CarouselPlayToggle`:

- `playing` (`boolean`): Whether it rotates on its own.
- `paused` (`boolean`): Whether rotation is paused for now: hovered, the tab hidden, scrolled out of view or held.

### Reasons

`details.reason` says why the page changed.

- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `scroll` (`Event | undefined`): The user scrolled a carousel some other way: a wheel, a trackpad, a scrollbar, or the browser bringing focus or a find in page into view.
- `timeout` (`none`): A duration ran out, like a toast's, or a rotating carousel's interval.
- `content-resize` (`none`): The content or the screen changed size, and the drawer's snap point or the carousel's page went away, so it moved to the nearest one.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why rotation started or stopped.

- `previous-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Previous part was pressed.
- `next-press` (`MouseEvent | KeyboardEvent`): A pagination's or a carousel's Next part was pressed.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `scroll` (`Event | undefined`): The user scrolled a carousel some other way: a wheel, a trackpad, a scrollbar, or the browser bringing focus or a find in page into view.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `toggle-press` (`MouseEvent | KeyboardEvent`): A toggle was pressed: a password input's, which shows or hides the password, or a carousel's, which starts or stops rotation.
- `focus-in` (`FocusEvent`): Keyboard focus moved into the component, which stops a rotating carousel, as the carousel pattern asks, or onto a canvas item, which brought it into view, or onto a calendar's day another way, like a screen reader's.

### Controller

Create one with `createCarouselController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, passed to the change callback, and returns `false` when the change is canceled or there's nowhere to go.

- `getPage()` (`() => number`): The current page, from 1.
- `getPageCount()` (`() => number | null`): How many pages there are, or null before the carousel has measured its slides.
- `setPage(page, options?)` (`(page: number, options?: CarouselPageOptions | undefined) => boolean`): Goes to a page, from 1, clamped to the pages there are. Returns false when canceled or already there.
- `next(options?)` (`(options?: CarouselPageOptions | undefined) => boolean`): Goes to the next page, or the first one after the last with `loop`. Returns false at the end.
- `previous(options?)` (`(options?: CarouselPageOptions | undefined) => boolean`): Goes to the previous page, or the last one before the first with `loop`. Returns false at the start.
- `canNext()` (`() => boolean`): Whether there's a next page, always with `loop`.
- `canPrevious()` (`() => boolean`): Whether there's a previous page, always with `loop`.
- `getProgress()` (`() => number`): How far the slides have scrolled, from 0 at the first page to 1 at the last, or round the loop. Also `--carousel-progress` on the root.
- `isPlaying()` (`() => boolean`): Whether it rotates on its own.
- `setPlaying(playing, options?)` (`(playing: boolean, options?: CarouselPlayingOptions | undefined) => boolean`): Starts or stops rotation. Returns false when canceled or unchanged.
- `play(options?)` (`(options?: CarouselPlayingOptions | undefined) => boolean`): Starts rotation.
- `pause(options?)` (`(options?: CarouselPlayingOptions | undefined) => boolean`): Stops rotation.

### Events

Callbacks get the new value first, then the details.

| Prop                   | On         | Receives                                                    |
| ---------------------- | ---------- | ----------------------------------------------------------- |
| `onPageChange`         | `Carousel` | `(page, details)`: the new page, and the [reason](#reasons) |
| `onPageChangeComplete` | `Carousel` | `(page)`: the page the slides came to rest on               |
| `onPlayingChange`      | `Carousel` | `(playing, details)`: whether it rotates, and the reason    |

## Accessibility

It follows the [WAI-ARIA carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/): a region described as a carousel, slides as groups described as slides and labelled by position, Previous and Next that control the slides, a rotation control, and indicators as a tablist. Every line below is an automated test.

Each slide is labelled by its position, like "1 of 5", unless it has an `aria-label` of its own, which is also how you translate it. Slides less than half in view are `inert` and hidden from screen readers, so Tab and the virtual cursor only reach what shows.

### Keyboard

Arrow keys follow the orientation, and swap left and right in right-to-left text.

| Key                                       | Does                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Tab                                       | Reaches the play toggle, links and controls in slides in view, Previous, Next and the current indicator |
| ArrowRight, ArrowLeft                     | In the viewport, the next and previous page. ArrowDown and ArrowUp when vertical                        |
| Home, End                                 | In the viewport or the indicators, the first and last page                                              |
| ArrowRight, ArrowLeft, ArrowDown, ArrowUp | In the indicators, the next and previous indicator, which shows its page                                |
| Enter, Space                              | Presses Previous, Next, an indicator or the play toggle                                                 |

Fields and widgets inside slides keep their arrow keys: a text field's caret moves, and the carousel stays put. When arrow keys page away from a slide that has focus, focus moves to the slide that comes in, so it never stays on something out of view. Previous and Next stay focusable at the ends, with `aria-disabled`, so focus never drops to the page when Next reaches the last slide.

### Tested Behavior

**Structure**

- The carousel is a named region described as a carousel.
- Each slide is a group described as a slide.
- The first slide shows first.

**Previous and next**

- Next shows the next slide.
- Previous shows the previous slide.
- Previous is disabled on the first slide and Next on the last.
- Next on the last slide does nothing.
- Next and Previous are buttons that don't submit a form.

**Keyboard**

- ArrowRight in a slide shows the next slide, and ArrowLeft the previous.
- ArrowLeft on the first slide stays there.

**Pages**

- With three slides to a view, Next moves one slide, and the last page shows the last three.
- Three slides to a page move three at a time.
- Auto pages fit as many slides as show.
- It can start on another page.
- A controller pages it from outside.

**Rest**

- It reports the page once the slides come to rest.

**Loop**

- Next on the last slide shows the first.
- Previous on the first slide shows the last.
- Previous and Next are never disabled.
- Next on the last slide carries on the same way to the first.
- Pressing Next quickly keeps going forward, round past the last slide.
- A mouse drag back from the first slide shows the last.
- With three slides to a view, the last slide shows before the first.
- A vertical carousel drags down from the first slide to the last.

**Dragging**

- Dragging the slides with a mouse shows the next one.
- A short, slow drag settles back on the same slide.
- Dragging back shows the previous slide.
- A drag that starts on a link doesn't follow it.
- Without dragging, a drag moves nothing.

**More**

- A vertical carousel drags up and down.
- Pressing keys with no waits lands on the right slide.
- A fast flick moves one page, not more.
- The current slide stays in view when the slides change size.

Runs in React, Vue and web components.

Beyond the baseline:

**Focus**

- Next keeps focus when it reaches the last slide.
- Tab reaches only the slides in view.
- Slides out of view are hidden from assistive technology.
- Arrow keys bring the next slide in and move focus to it.
- A text field in a slide keeps its arrow keys.
- Home and End go to the first and last slide.

**Orientation**

- A vertical carousel pages with ArrowDown and ArrowUp.

**Indicators**

- Indicators are a tablist with the current page selected.
- Pressing an indicator shows its page.
- Arrow keys move between indicators and show their page.
- The indicators are one tab stop, on the current page.
- An indicator controls the slides of its page.
- Indicators past the page count hide themselves.

**Changes**

- A change can be canceled.
- A canceled drag springs back.
- Every change says why.
- A horizontal wheel scrolls to the next slide.
- With loop, a wheel back from the first slide scrolls natively to the last.
- --carousel-progress on the root follows the slides, for progress bars in CSS.
- With loop, --carousel-progress goes round, whatever the track's rotation.
- Next outside the carousel works through its controller.

**Rotation**

- It rotates on its own, past the last slide to the first.
- The play toggle stops and starts rotation, and its name says which.
- Keyboard focus moving in stops rotation, as the pattern asks.
- Hovering pauses rotation, and leaving resumes it.
- Pressing Next stops rotation.
- The slides are a live region only while not rotating.
- It doesn't start rotating when the user prefers reduced motion.
- Reduced motion pages without animating.

**Pages**

- Indicators follow a change in size.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the carousel with a keyboard.

Runs in React, Vue and web components.
