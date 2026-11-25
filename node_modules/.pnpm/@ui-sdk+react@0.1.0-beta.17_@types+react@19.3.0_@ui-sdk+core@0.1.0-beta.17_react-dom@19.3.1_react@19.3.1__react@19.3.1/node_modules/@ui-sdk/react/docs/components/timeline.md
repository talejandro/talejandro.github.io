# Timeline

Show dated events in order, like an activity feed, a changelog or an order's progress, with arrow keys between them.

Use a Timeline for a list of things that happened, or will: a project's activity, an order's status history, a release's milestones. It's a list for screen readers, with one tab stop for keyboards, and the arrow keys move between events.

```tsx title="demo.tsx"
"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"

const events = [
  {
    title: "Deployed to production",
    dateTime: "2026-11-10T14:32",
    time: "Today, 2:32 PM",
    description: "Version 2.4.1 is live in every region.",
  },
  {
    title: "Checks passed",
    dateTime: "2026-11-10T14:20",
    time: "Today, 2:20 PM",
    description: "312 tests and the bundle size budget.",
  },
  {
    title: "Pull request merged",
    dateTime: "2026-11-10T13:58",
    time: "Today, 1:58 PM",
    description: "Ada merged Cache search results into main.",
  },
  {
    title: "Review requested",
    dateTime: "2026-11-09T17:05",
    time: "Yesterday, 5:05 PM",
    description: "Grace and Linus were asked to review.",
  },
]

function Example() {
  return (
    <Timeline aria-label="Activity">
      {events.map((event) => (
        <TimelineItem key={event.title}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{event.title}</TimelineTitle>
          <TimelineTime dateTime={event.dateTime}>{event.time}</TimelineTime>
          <TimelineDescription>{event.description}</TimelineDescription>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export { Example }
```

Tab into the activity, then use Up and Down to move between events. Home and End jump to the first and last.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Timeline`:

```text
Timeline
├── TimelineItem
│   ├── TimelineMarker
│   ├── TimelineConnector
│   ├── TimelineTitle
│   ├── TimelineTime
│   └── TimelineDescription
└── TimelineItem
```

Every part inside an item is optional. `TimelineMarker` is the dot or icon on the line, and `TimelineConnector` the line to the next event. Both are hidden from screen readers, so they're only for looks.

## Usage

Import the parts and put them together:

```tsx
import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"

function Example() {
  return (
    <Timeline aria-label="Activity">
      <TimelineItem>
        <TimelineMarker />
        <TimelineConnector />
        <TimelineTitle>Deployed to production</TimelineTitle>
        <TimelineTime dateTime="2026-11-10T14:32">2:32 PM</TimelineTime>
        <TimelineDescription>Version 2.4.1 is live.</TimelineDescription>
      </TimelineItem>
    </Timeline>
  )
}

export { Example }
```

`Timeline` renders a `<div>` with the `list` role and each item a `<div>` with the `listitem` role. With `feed`, the same markup becomes a feed of articles. Pass `dateTime` to `TimelineTime`, so the date is machine readable while the text stays friendly.

When focus lands on an event, screen readers read its title as its name, then its time and description. Links and buttons inside an event stay in the tab order: Tab moves from the event to them, and arrow keys pressed on them stay with them.

## Horizontal

Set `orientation="horizontal"` for a row, like a roadmap. Left and Right move between events instead of Up and Down, and they swap in right-to-left text. Set `loop={false}` to stop at either end.

```tsx title="horizontal.tsx"
"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"

const milestones = [
  { title: "Kickoff", dateTime: "2026-01", time: "January" },
  { title: "Design review", dateTime: "2026-03", time: "March" },
  { title: "Beta", dateTime: "2026-06", time: "June" },
  { title: "Launch", dateTime: "2026-09", time: "September" },
]

function Example() {
  return (
    <Timeline orientation="horizontal" loop={false} aria-label="Roadmap">
      {milestones.map((milestone) => (
        <TimelineItem key={milestone.title}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{milestone.title}</TimelineTitle>
          <TimelineTime dateTime={milestone.dateTime}>
            {milestone.time}
          </TimelineTime>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export { Example }
```

Tab into the roadmap and press Right to reach Launch. Right again stays there.

## Status

Give each item a `status` of `"complete"`, `"current"` or `"upcoming"` for a process, like an order's progress. The current event gets `aria-current="step"`, and Tab lands on it first. Every part of an event shows its status with `data-complete`, `data-current` or `data-upcoming`.

Create a controller with `createTimelineController` and call its `focus()` with an item's `value` to move focus to it from anywhere.

```tsx title="status.tsx"
"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
  createTimelineController,
  type TimelineStatus,
} from "@ui-sdk/react/timeline"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const steps: {
  value: string
  title: string
  dateTime: string
  time: string
  description: string
  status: TimelineStatus
}[] = [
  {
    value: "placed",
    title: "Order placed",
    dateTime: "2026-11-01",
    time: "Nov 1",
    description: "We received your order.",
    status: "complete",
  },
  {
    value: "packed",
    title: "Packed",
    dateTime: "2026-11-02",
    time: "Nov 2",
    description: "Your items left the shelf.",
    status: "complete",
  },
  {
    value: "shipped",
    title: "Shipped",
    dateTime: "2026-11-03",
    time: "Nov 3",
    description: "On its way with the carrier.",
    status: "current",
  },
  {
    value: "delivered",
    title: "Delivered",
    dateTime: "2026-11-05",
    time: "Nov 5",
    description: "Expected by Thursday.",
    status: "upcoming",
  },
]

function Example() {
  const [controller] = React.useState(() => createTimelineController())
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button onClick={() => controller.focus("shipped")}>
          Go to Current Step
        </button>
      </div>
      <Timeline aria-label="Order status" controller={controller}>
        {steps.map((step) => (
          <TimelineItem key={step.value} value={step.value} status={step.status}>
            <TimelineMarker>
              {step.status === "complete" && <CheckIcon aria-hidden="true" />}
            </TimelineMarker>
            <TimelineConnector />
            <TimelineTitle>{step.title}</TimelineTitle>
            <TimelineTime dateTime={step.dateTime}>{step.time}</TimelineTime>
            <TimelineDescription>{step.description}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}

export { Example }
```

Tab into the order status. Focus starts on Shipped, the current step. Move away, then choose Go to Current Step.

A marker shows status only to sighted people. When the status matters, say it in the title or description too, like "Shipped, in progress".

## Details

Put a [Collapsible](./collapsible.md) inside an item for details that can open. Its trigger is a button inside the event, so Tab reaches it after the event, and arrow keys still move between events.

```tsx title="details.tsx"
"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const releases = [
  {
    title: "Version 2.4",
    dateTime: "2026-10-28",
    time: "October 28",
    description: "Faster search and resumable uploads.",
    changes: [
      "Search now matches file contents, not only names.",
      "Uploads resume after the connection drops.",
    ],
  },
  {
    title: "Version 2.3",
    dateTime: "2026-09-30",
    time: "September 30",
    description: "Shared links and a new sidebar.",
    changes: [
      "Shared links remember the folder they were opened from.",
      "The sidebar collapses to icons on narrow screens.",
    ],
  },
  {
    title: "Version 2.2",
    dateTime: "2026-08-26",
    time: "August 26",
    description: "Dark mode follows your system.",
    changes: ["Dark mode follows the system setting.", "Avatars are sharper."],
  },
]

function Example() {
  return (
    <Timeline aria-label="Changelog">
      {releases.map((release) => (
        <TimelineItem key={release.title}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{release.title}</TimelineTitle>
          <TimelineTime dateTime={release.dateTime}>
            {release.time}
          </TimelineTime>
          <TimelineDescription>{release.description}</TimelineDescription>
          <Collapsible>
            <CollapsibleTrigger>
              What Changed
              <ChevronDownIcon aria-hidden="true" />
            </CollapsibleTrigger>
            <CollapsiblePanel>
              <ul>
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </CollapsiblePanel>
          </Collapsible>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export { Example }
```

Tab to What Changed under Version 2.4 and press Enter. Shift+Tab back to the event, then press Down for Version 2.3.

## Feed

Set `feed` for a timeline that loads more as people scroll, like a social feed. It follows the [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): the root becomes a `feed` and each item an `article` with its position and the count, and Page Down and Page Up move between articles from anywhere inside one.

Set `busy` while you load or change articles. It sets `aria-busy`, so screen readers wait for the new articles before reading on.

```tsx title="feed.tsx"
"use client"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline"
import * as React from "react"
import { useLog } from "./log"

const updates = [
  {
    id: 1,
    author: "Ada",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Shipped the new onboarding flow.",
  },
  {
    id: 2,
    author: "Grace",
    date: "2026-11-10",
    time: "Nov 10",
    text: "Fixed the flaky upload test.",
  },
  {
    id: 3,
    author: "Linus",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Moved the docs to the new theme.",
  },
  {
    id: 4,
    author: "Margaret",
    date: "2026-11-09",
    time: "Nov 9",
    text: "Wrote the launch checklist.",
  },
  {
    id: 5,
    author: "Ada",
    date: "2026-11-08",
    time: "Nov 8",
    text: "Cut search latency in half.",
  },
  {
    id: 6,
    author: "Grace",
    date: "2026-11-07",
    time: "Nov 7",
    text: "Added keyboard shortcuts to the editor.",
  },
  {
    id: 7,
    author: "Linus",
    date: "2026-11-06",
    time: "Nov 6",
    text: "Cleaned up the old billing code.",
  },
  {
    id: 8,
    author: "Margaret",
    date: "2026-11-05",
    time: "Nov 5",
    text: "Ran the accessibility review.",
  },
  {
    id: 9,
    author: "Ada",
    date: "2026-11-04",
    time: "Nov 4",
    text: "Started the mobile layout.",
  },
]

const pageSize = 3

function Example() {
  const log = useLog()
  const [count, setCount] = React.useState(pageSize)
  const [busy, setBusy] = React.useState(false)

  function loadMore() {
    setBusy(true)
    setTimeout(() => {
      setCount((count) => count + pageSize)
      setBusy(false)
      log(`Loaded ${pageSize} more updates`)
    }, 600)
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button disabled={busy || count >= updates.length} onClick={loadMore}>
          {busy ? "Loading…" : "Load More"}
        </button>
      </div>
      <Timeline feed busy={busy} aria-label="Team updates">
        {updates.slice(0, count).map((update) => (
          <TimelineItem key={update.id}>
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle>{update.author}</TimelineTitle>
            <TimelineTime dateTime={update.date}>{update.time}</TimelineTime>
            <TimelineDescription>{update.text}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}

export { Example }
```

Tab into the updates and press Page Down. Choose Load More: the feed is busy until three more updates arrive. The console logs each load.

Use a list for most timelines. A feed is for long lists that grow, where a screen reader's reading mode should flow from one article to the next.

## Custom Rendering

Render any part as another element with `render`, like a title as a heading so people can move between events by heading:

```tsx
<TimelineTitle render={<h3 />}>Deployed to production</TimelineTitle>
```

[Parts and Composition](../parts-and-composition.md) explains the rendering contract.

## Styling

The parts have no styles. Lay an item out as a grid, with the marker in its own column and the connector positioned along it. `data-orientation` on every part says which way the events run.

Use `data-first` and `data-last` on items to hide the connector after the last event. They're written once the events are in the page; for markup rendered on the server, `:last-child` does the same before it hydrates.

Each part has a `data-slot`, such as `timeline-marker`, and its state attributes are listed under [Data Attributes](#data-attributes).

`Timeline` writes `--timeline-count`, how many events it holds, and each `TimelineItem` writes `--timeline-index`, its place from 0. Use them for a horizontal row's grid columns, or to stagger an animation.

### Timeline
- `--timeline-count`: How many events are in the page. Size a horizontal grid's columns with it.

### TimelineItem
- `--timeline-index`: The event's place among the events in the page, 0 for the first. It follows them as they move.

## Data Attributes

### Timeline
`[data-slot="timeline"]`

- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-busy`: Present while a feed is loading or changing events, with `busy`.

### TimelineItem
`[data-slot="timeline-item"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.
- `data-first`: Present on the first event. Written once it's in the page.
- `data-last`: Present on the last event. Written once it's in the page.

### TimelineMarker
`[data-slot="timeline-marker"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### TimelineConnector
`[data-slot="timeline-connector"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### TimelineTime
`[data-slot="timeline-time"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### TimelineTitle
`[data-slot="timeline-title"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

### TimelineDescription
`[data-slot="timeline-description"]`

- `data-complete`: Present when the event's status is `complete`.
- `data-orientation` (`horizontal`, `vertical`): Which way the events run.
- `data-current`: Present when the event's status is `current`.
- `data-upcoming`: Present when the event's status is `upcoming`.

## API Reference

### Timeline

- `orientation?` (`TimelineOrientation`): Which arrow keys move between events: up and down, or left and right.
- `loop?` (`boolean`): Whether arrow keys wrap from the last event to the first.
- `feed?` (`boolean`): Whether the events are a feed that loads more as people scroll, rather than a list. Each event becomes an article with its position, and Page Down and Page Up move between them from anywhere inside one.
- `busy?` (`boolean`): Whether a feed is loading or changing events, which sets `aria-busy` so screen readers wait until it's done. Only a feed reads it.
- `controller?` (`{ focus: (value?: string) => void; }`): Focuses an event from anywhere. Create one with `createTimelineController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### TimelineItem

- `value?` (`string`): Names the event for the controller's `focus()`. Generated when left out.
- `status?` (`TimelineStatus`): Where the event stands in a process. The `"current"` one sets `aria-current="step"` and takes the tab stop first.

`TimelineMarker`, `TimelineConnector`, `TimelineTime`, `TimelineTitle` and `TimelineDescription` take no props of their own.

### State

What render functions and state-based class names receive on `Timeline`:

- `orientation` (`TimelineOrientation`): Which way the events run.
- `feed` (`boolean`): Whether the events are a feed rather than a list.
- `busy` (`boolean`): Whether a feed is loading or changing events.

On `TimelineItem` and every part inside it:

- `status` (`TimelineStatus | undefined`): Where the event stands in a process, or `undefined` when it has no status.
- `orientation` (`TimelineOrientation`): Which way the events run.

### Controller

- `focus(value?)` (`(value?: string | undefined) => void`): Moves focus to an event by its `value`, or to the event that holds the tab stop.

## Accessibility

A timeline is a `list` of `listitem`s, named with `aria-label`. With `feed`, it follows the [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): a `feed` of `article`s, each with `aria-posinset` and `aria-setsize`, and `aria-busy` while it loads. Each event is named by its title through `aria-labelledby` and described by its time and description through `aria-describedby`. The current event has `aria-current="step"`.

### Keyboard

The events have one tab stop, a roving focus. Tab enters on the current event, else the first, then returns to the event focused last. Markup rendered on the server holds the stop on the first event until it hydrates.

| Key                        | Action                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `ArrowDown` / `ArrowUp`    | Move focus between events in a vertical timeline           |
| `ArrowRight` / `ArrowLeft` | Move focus between events in a horizontal timeline         |
| `Home` / `End`             | Focus the first or last event                              |
| `PageDown` / `PageUp`      | In a feed, focus the next or previous article, from inside |
| `Tab`                      | Move from an event to the links and buttons inside it      |

Arrow keys move only from an event itself, so controls inside keep them. In right-to-left text, Left and Right swap.

### Tested Behavior

Every line below is an automated test.

- A busy feed sets aria-busy.

**A list of events**

- The events are a named list of list items.
- Each event is named by its title and described by its time and description.
- Tab lands on the current event, then on the links inside it, then leaves.
- The current event says it's the current step.
- Each event and its parts show its status.
- ArrowDown and ArrowUp move between events.
- ArrowLeft and ArrowRight do nothing in a vertical list.
- Home and End move to the first and last events.
- Arrow keys wrap from the last event to the first.
- Arrow keys on a link inside an event leave focus on the link.
- Page Down does nothing in a list.
- Tab comes back to the event focused last.
- Only the event with the tab stop is in the tab order.
- The first and last events are marked.
- An event added at the top becomes the first.
- Events that change places move the first and last marks.
- Each event carries its place and the list how many there are.
- The tab stop follows the current step when it moves before focus enters.
- The controller moves focus to an event.
- Markers and connectors are hidden from assistive technology.

**A list that doesn't loop**

- Arrow keys stop at either end.

**A horizontal list**

- ArrowRight and ArrowLeft move between events.
- ArrowDown and ArrowUp do nothing.

**A feed**

- The events are a named feed of articles.
- Each article says where it sits and how many there are.
- An article added at the top moves every position.
- Articles moved inside a wrapper take their new places.
- Page Down and Page Up move between articles.
- Page Down from a link inside an article moves to the next article.
- Page Down on the last article stays there.
- The feed isn't busy until it's told.

Runs in React, Vue and web components.
