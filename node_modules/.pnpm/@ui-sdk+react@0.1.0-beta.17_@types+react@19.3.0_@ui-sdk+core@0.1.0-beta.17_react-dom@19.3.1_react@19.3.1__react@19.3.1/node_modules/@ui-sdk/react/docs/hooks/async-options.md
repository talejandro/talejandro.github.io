# Async Options

Load search results, cancel stale requests, and fetch the next page.

`useAsyncOptions` loads items as someone types. It waits for typing to pause, cancels requests that are replaced, and keeps the previous results visible while loading.

```tsx title="async.tsx"
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMovies(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        movieTitles
          .filter((title) => title.toLowerCase().includes(needle))
          .map((title) => ({
            value: title.toLowerCase().replace(/\W+/g, "-"),
            label: title,
          }))
      )
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  const movies = useAsyncOptions(searchMovies, {
    debounce: 300,
    query: "the",
    immediate: true,
  })

  return (
    <Combobox
      items={movies.items}
      defaultQuery="the"
      filter={false}
      status={movies.status}
      onQueryChange={(query) => movies.setQuery(query)}
    >
      <div data-slot="stack">
        <ComboboxLabel>Movie</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search movies…" />
          <ComboboxTrigger aria-label="Show movies">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxStatus>
          {(state) =>
            state.status === "error"
              ? "Couldn't load movies."
              : state.loading
                ? "Searching…"
                : `${state.count} ${state.count === 1 ? "movie" : "movies"}`
          }
        </ComboboxStatus>
        <ComboboxEmpty>
          {(state) =>
            state.empty && !state.loading
              ? `No movies match “${state.query}”.`
              : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as {
                value: string
                label: string
                disabled?: boolean
              }[]
            ).map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                label={item.label}
                disabled={item.disabled}
              >
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Change the movie search and wait for the results. Use the arrow keys to choose a movie, then press Enter.

## Load Results

Pass a loader to the hook. This example expects `/api/movies` to return an array of movie titles:

```tsx
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
} from "@ui-sdk/react/combobox"

function MovieSearch() {
  const movies = useAsyncOptions<string>(async (query, { signal }) => {
    const response = await fetch(`/api/movies?q=${encodeURIComponent(query)}`, {
      signal,
    })
    if (!response.ok) throw new Error("Couldn't load movies")
    return response.json()
  })

  return (
    <Combobox
      items={movies.items}
      filter={false}
      status={movies.status}
      onQueryChange={movies.setQuery}
    >
      <ComboboxInput aria-label="Movie" placeholder="Search movies…" />
      <ComboboxContent />
    </Combobox>
  )
}

export { MovieSearch }
```

Pass `signal` to `fetch` so a newer search can cancel the request. The hook also cancels on unmount.

`filter={false}` leaves matching and result order to the server. `status` tells the component when it's busy. Use `ComboboxStatus` and `ComboboxEmpty` to show loading, error, and empty messages, as in the demo.

The same pattern works with [Select](../components/select.md#async-search), [Autocomplete](../components/autocomplete.md#async-suggestions), and [Command](../components/command.md#async-results).

## Choose When to Load

The hook's second argument sets its starting behavior:

| Option      | What It Does                                                                    | Default |
| ----------- | ------------------------------------------------------------------------------- | ------- |
| `debounce`  | How long typing must pause, in milliseconds.                                    | `200`   |
| `query`     | The starting search text.                                                       | `""`    |
| `immediate` | Loads that text as soon as the component mounts.                                | `false` |
| `minLength` | Characters the text needs before anything loads. Shorter text clears the items. | `0`     |

For example, add `{ immediate: true, debounce: 300 }` after the loader to fetch initial choices and wait a little longer between searches. Until that first load starts, `status` is already `"loading"`, so the list never flashes an empty state. If you set `query`, use the same starting text for the component's `defaultQuery`.

## Load More

For paged results, the loader also receives `page`, starting at `0`. Return `{ items, hasMore }`:

```tsx
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"

function useMoviePages() {
  return useAsyncOptions<string>(async (query, { signal, page }) => {
    const response = await fetch(
      `/api/movies?q=${encodeURIComponent(query)}&page=${page}`,
      { signal }
    )
    if (!response.ok) throw new Error("Couldn't load movies")
    const data: { titles: string[]; next: number | null } =
      await response.json()
    return { items: data.titles, hasMore: data.next !== null }
  })
}

export { useMoviePages }
```

Call `useMoviePages()` inside your component, then pass `onLoadMore={movies.loadMore}` to Combobox alongside the props above. It asks for another page when scrolling or keyboard navigation reaches the last item. The hook appends the new items.

```tsx title="infinite.tsx"
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMoviePages(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{
    items: { value: string; label: string }[]
    hasMore: boolean
  }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      const found = movieTitles
        .filter((title) => title.toLowerCase().includes(needle))
        .map((title) => ({
          value: title.toLowerCase().replace(/\W+/g, "-"),
          label: title,
        }))
      resolve({
        items: found.slice(page * 5, page * 5 + 5),
        hasMore: found.length > page * 5 + 5,
      })
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  const movies = useAsyncOptions(searchMoviePages, { immediate: true })

  return (
    <Combobox
      items={movies.items}
      filter={false}
      status={movies.status}
      onQueryChange={(query) => movies.setQuery(query)}
      onLoadMore={movies.loadMore}
    >
      <div data-slot="stack">
        <ComboboxLabel>Movie</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search movies…" />
          <ComboboxTrigger aria-label="Show movies">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          {(state) =>
            state.empty && !state.loading ? "No movies found." : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as {
                value: string
                label: string
                disabled?: boolean
              }[]
            ).map((item) => (
              <ComboboxItem key={item.value} value={item.value} label={item.label} disabled={item.disabled}>
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
        <ComboboxStatus>
          {(state) =>
            state.loading
              ? "Loading more…"
              : movies.hasMore
                ? `${state.count} loaded`
                : `All ${state.count}`
          }
        </ComboboxStatus>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open the movie list and scroll down, or use Arrow Down to reach the last result. The next page is added to the list.

## Retry a Search

`status` is `"loading"` while a request is pending, `"error"` after a failure, and `"idle"` otherwise. `error` holds the failure, and the previous items stay available.

Call `movies.reload()` from a retry button to load the current query again, starting at page `0`. `movies.hasMore` tells you whether another page is available.
