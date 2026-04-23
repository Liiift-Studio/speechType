# speechType

[![npm](https://img.shields.io/npm/v/%40liiift-studio%2Fspeechtype.svg)](https://www.npmjs.com/package/@liiift-studio/speechtype) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

Typography that follows your voice — per-word typographic emphasis synced to Web Speech API boundary events. Each spoken word gets wider tracking, heavier weight, and larger optical size; the rest of the text recedes. A read-along effect grounded in typographic logic, not arbitrary highlight colours.

**[speechtype.com](https://speechtype.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/speechtype) · [GitHub](https://github.com/Liiift-Studio/SpeechType)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install @liiift-studio/speechtype
```

---

## Usage

> **Next.js App Router:** this library uses browser APIs. Add `"use client"` to any component file that imports from it.

### React component

`SpeechTypeText` is a controlled component — you manage the active word index and pass it as a prop. This lets you drive it from any speech source (Web Speech API, a timer, a remote event, or a custom synthesis engine).

```tsx
import { SpeechTypeText, startSpeechType } from '@liiift-studio/speechtype'
import { useRef, useState } from 'react'

export default function Demo() {
  const [activeWordIndex, setActiveWordIndex] = useState(-1)
  const ref = useRef<HTMLElement>(null)

  function handleSpeak() {
    if (!ref.current) return
    const stop = startSpeechType(ref.current, {
      activeWeight: 700,
      activeTracking: 0.06,
    })
    // store stop() to call when done
  }

  return (
    <>
      <SpeechTypeText
        ref={ref}
        activeWordIndex={activeWordIndex}
        activeWeight={700}
        activeTracking={0.06}
        inactiveOpacity={0.45}
      >
        The quick brown fox jumps over the lazy dog.
      </SpeechTypeText>
      <button onClick={handleSpeak}>Speak</button>
    </>
  )
}
```

For a self-contained demo, use `startSpeechType` directly on the element after preparing it with `SpeechTypeText` (which wraps words in spans on mount).

### React hook

`useSpeechType` takes a ref, an active word index, and options. Your component controls the index — for example, by calling `startSpeechType` and tracking which word is current.

```tsx
import { useSpeechType } from '@liiift-studio/speechtype'
import { useRef, useState } from 'react'

const ref = useRef<HTMLElement>(null)
const [activeWordIndex, setActiveWordIndex] = useState(-1)

useSpeechType(ref, activeWordIndex, { activeWeight: 700 })

return <p ref={ref}>The quick brown fox jumps over the lazy dog.</p>
```

### Vanilla JS

`startSpeechType` is the all-in-one entry point for vanilla use. It wraps the words in spans, starts the Web Speech API, updates the emphasis on each boundary event, and returns a `stop` function.

```ts
import { startSpeechType, removeSpeechType } from '@liiift-studio/speechtype'

const el = document.querySelector('p')
const stop = startSpeechType(el, {
  activeWeight: 700,
  activeTracking: 0.06,
  rate: 0.9,
})

// Later — stop speech and restore original HTML:
stop()
removeSpeechType(el)
```

For more control, use the lower-level functions:

```ts
import { prepareSpeechType, applySpeechType, removeSpeechType } from '@liiift-studio/speechtype'

const el = document.querySelector('p')
prepareSpeechType(el)               // wraps each word in a span

applySpeechType(el, 3)              // emphasise word at index 3
applySpeechType(el, -1)             // clear emphasis

removeSpeechType(el)                // restore original HTML
```

### TypeScript

```ts
import type { SpeechTypeOptions } from '@liiift-studio/speechtype'

const opts: SpeechTypeOptions = {
  activeTracking: 0.08,
  activeWeight: 800,
  inactiveOpacity: 0.3,
  rate: 0.85,
}
```

---

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `activeTracking` | `number` | `0.06` | Letter-spacing on the active (currently spoken) word, in em |
| `activeWeight` | `number` | `700` | `wght` axis value on the active word |
| `activeOpsz` | `number` | `24` | `opsz` axis value on the active word |
| `inactiveOpacity` | `number` | `0.45` | Opacity of inactive (not currently spoken) words |
| `transitionMs` | `number` | `80` | CSS transition duration in ms for style changes |
| `rate` | `number` | `0.9` | Speech rate (0.1–10). Passed to `SpeechSynthesisUtterance` |
| `pitch` | `number` | `1` | Speech pitch (0–2). Passed to `SpeechSynthesisUtterance` |
| `volume` | `number` | `1` | Speech volume (0–1). Passed to `SpeechSynthesisUtterance` |

---

## How it works

`prepareSpeechType` walks the element's child nodes and wraps each word in a `<span class="st-word">` — without changing visual layout. `applySpeechType` then uses `activeWordIndex` to toggle `st-active` / `st-inactive` classes on each span. The active span receives `letter-spacing`, `font-variation-settings`, and CSS transitions via the class; the inactive spans get reduced opacity. All style changes are CSS class toggles — no inline style thrashing.

`startSpeechType` wires a `SpeechSynthesisUtterance` to the browser's Web Speech API, listens for `boundary` events, maps the character offset to a word index, and calls `applySpeechType` on each event. It returns a `stop` function that cancels synthesis and removes all emphasis.

**Browser support:** Web Speech API is supported in Chrome, Edge, and Safari. Firefox requires a flag. `startSpeechType` falls back silently in environments without `speechSynthesis`.

---

## API reference

| Export | Description |
|--------|-------------|
| `prepareSpeechType(el, options?)` | Wraps each word in a span. Call once before `applySpeechType`. |
| `applySpeechType(el, activeIndex, options?)` | Emphasises word at `activeIndex`. Pass `-1` to clear. |
| `startSpeechType(el, options?)` | All-in-one: prepares spans, starts Web Speech API, returns `stop()`. |
| `removeSpeechType(el)` | Cancels synthesis and restores original HTML. |
| `getCleanHTML(el)` | Returns element HTML with all injected spans removed. |
| `useSpeechType` | React hook: `(ref, activeWordIndex, options?)` |
| `SpeechTypeText` | React component. Controlled via `activeWordIndex` prop. Forwards ref. |
| `SpeechTypeOptions` | TypeScript interface for all options. |
| `SPEECH_CLASSES` | CSS class names injected by the algorithm (`st-word`, `st-active`, `st-inactive`). |

---

## Next.js

`SpeechTypeText`, `useSpeechType`, and `startSpeechType` all require a browser environment. Add `"use client"` to any component that imports them:

```tsx
"use client"
import { SpeechTypeText } from '@liiift-studio/speechtype'
```

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.
