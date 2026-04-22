# speechType

[![npm](https://img.shields.io/npm/v/%40liiift-studio%2Fspeechtype.svg)](https://www.npmjs.com/package/@liiift-studio/speechtype) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

Typography that follows your voice — per-word typographic emphasis synced to Web Speech API boundary events.

**[speechtype.com](https://speechtype.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/speechtype) · [GitHub](https://github.com/Liiift-Studio/SpeechType)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install @liiift-studio/speechtype
```

## React

### Component

```tsx
import { SpeechTypeText } from '@liiift-studio/speechtype'

<SpeechTypeText axis="wght" min={300} max={700} autoPlay>
  The quick brown fox jumps over the lazy dog.
</SpeechTypeText>
```

### Hook

```tsx
import { useSpeechType } from '@liiift-studio/speechtype'

const { ref, speak, stop } = useSpeechType({ axis: 'wght', min: 300, max: 700 })

<p ref={ref}>The quick brown fox jumps over the lazy dog.</p>
```

## Vanilla JS

```ts
import { prepareSpeechType, applySpeechType, startSpeechType, removeSpeechType } from '@liiift-studio/speechtype'

const el = document.querySelector('p')
const originalHTML = el.innerHTML
prepareSpeechType(el, originalHTML)
const stop = startSpeechType(el, { axis: 'wght', min: 300, max: 700 })

// Later:
stop()
removeSpeechType(el, originalHTML)
```
