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

### React component (controlled)

`SpeechTypeText` is a controlled component — you manage a `SpeechSynthesisUtterance` yourself, track which word is active in state, and pass the index as a prop. This pattern gives you full control over voice, timing, and UI.

```tsx
"use client"
import { SpeechTypeText } from '@liiift-studio/speechtype'
import { useState, useCallback } from 'react'

const TEXT = 'The quick brown fox jumps over the lazy dog.'

export default function Demo() {
  const [activeWordIndex, setActiveWordIndex] = useState(-1)

  const handleSpeak = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(TEXT)
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const wordIndex = TEXT.slice(0, e.charIndex).trim().split(/\s+/).filter(Boolean).length
        setActiveWordIndex(wordIndex)
      }
    }
    utterance.onend = () => setActiveWordIndex(-1)
    speechSynthesis.speak(utterance)
  }, [])

  return (
    <>
      <SpeechTypeText activeWordIndex={activeWordIndex} activeWeight={700} inactiveOpacity={0.45}>
        {TEXT}
      </SpeechTypeText>
      <button onClick={handleSpeak}>Speak</button>
    </>
  )
}
```

### React — imperative (startSpeechType)

For a simpler setup, skip `SpeechTypeText` and let `startSpeechType` manage everything directly on a plain element ref:

```tsx
"use client"
import { useRef } from 'react'
import { startSpeechType, removeSpeechType } from '@liiift-studio/speechtype'

export default function Demo() {
  const ref = useRef<HTMLParagraphElement>(null)

  function handleSpeak() {
    if (!ref.current) return
    startSpeechType(ref.current, { activeWeight: 700, rate: 0.9 })
  }

  function handleStop() {
    if (ref.current) removeSpeechType(ref.current)
  }

  return (
    <>
      <p ref={ref}>The quick brown fox jumps over the lazy dog.</p>
      <button onClick={handleSpeak}>Speak</button>
      <button onClick={handleStop}>Stop</button>
    </>
  )
}
```

### React hook

`useSpeechType` is the low-level hook behind `SpeechTypeText`. Use it when you need the controlled pattern but want to render your own element:

```tsx
"use client"
import { useSpeechType } from '@liiift-studio/speechtype'
import { useRef, useState, useCallback } from 'react'

export default function Demo() {
  const ref = useRef<HTMLParagraphElement>(null)
  const [activeWordIndex, setActiveWordIndex] = useState(-1)

  useSpeechType(ref, activeWordIndex, { activeWeight: 700 })

  return <p ref={ref}>The quick brown fox jumps over the lazy dog.</p>
}

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
