// speechType/src/__tests__/adjust.test.ts — unit tests for the core speechType algorithm

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prepareSpeechType, applySpeechType, removeSpeechType, getCleanHTML } from '../core/adjust'
import { SPEECH_CLASSES } from '../core/types'

// ─── Setup ────────────────────────────────────────────────────────────────────

/** Create a fresh div with given innerHTML for each test */
function makeEl(html: string): HTMLElement {
	const el = document.createElement('div')
	el.innerHTML = html
	return el
}

// Mock SpeechSynthesis on window for tests that invoke startSpeechType
beforeEach(() => {
	const mockUtterance = {
		rate: 1,
		pitch: 1,
		volume: 1,
		onboundary: null as unknown,
		onend: null as unknown,
		onerror: null as unknown,
	}
	vi.stubGlobal('SpeechSynthesisUtterance', vi.fn(() => mockUtterance))
	vi.stubGlobal('speechSynthesis', {
		speak: vi.fn(),
		cancel: vi.fn(),
	})
})

// ─── prepareSpeechType ────────────────────────────────────────────────────────

describe('prepareSpeechType', () => {
	it('wraps each word in a span with the word class', () => {
		const el = makeEl('Hello world')
		prepareSpeechType(el)
		const spans = el.querySelectorAll(`.${SPEECH_CLASSES.word}`)
		expect(spans.length).toBe(2)
		expect(spans[0].textContent).toBe('Hello')
		expect(spans[1].textContent).toBe('world')
	})

	it('is idempotent — calling twice produces same number of spans', () => {
		const el = makeEl('One two three')
		prepareSpeechType(el)
		prepareSpeechType(el)
		const spans = el.querySelectorAll(`.${SPEECH_CLASSES.word}`)
		expect(spans.length).toBe(3)
	})

	it('returns the array of word span elements', () => {
		const el = makeEl('foo bar baz')
		const spans = prepareSpeechType(el)
		expect(spans.length).toBe(3)
		expect(spans[0].textContent).toBe('foo')
	})

	it('handles a single word without crashing', () => {
		const el = makeEl('Solo')
		const spans = prepareSpeechType(el)
		expect(spans.length).toBe(1)
		expect(spans[0].textContent).toBe('Solo')
	})

	it('handles empty string without crashing', () => {
		const el = makeEl('')
		const spans = prepareSpeechType(el)
		expect(spans.length).toBe(0)
		expect(el.innerHTML).toBe('')
	})

	it('applies transition styles to each word span', () => {
		const el = makeEl('Hello world')
		const spans = prepareSpeechType(el, { transitionMs: 120 })
		spans.forEach(span => {
			expect(span.style.transition).toContain('120ms')
		})
	})
})

// ─── applySpeechType ─────────────────────────────────────────────────────────

describe('applySpeechType', () => {
	it('sets active styles on the active word and dims others', () => {
		const el = makeEl('alpha beta gamma')
		prepareSpeechType(el, { activeTracking: 0.06, activeWeight: 700, inactiveOpacity: 0.45 })
		applySpeechType(el, 1, { activeTracking: 0.06, activeWeight: 700, inactiveOpacity: 0.45 })

		const spans = el.querySelectorAll<HTMLElement>(`.${SPEECH_CLASSES.word}`)
		// Inactive spans
		expect(spans[0].style.opacity).toBe('0.45')
		expect(spans[2].style.opacity).toBe('0.45')
		// Active span
		expect(spans[1].style.opacity).toBe('1')
		expect(spans[1].style.letterSpacing).toBe('0.06em')
		expect(spans[1].style.fontVariationSettings).toContain('700')
	})

	it('resets all words to full opacity when activeIndex is -1', () => {
		const el = makeEl('one two three')
		prepareSpeechType(el)
		applySpeechType(el, 0)
		applySpeechType(el, -1)

		const spans = el.querySelectorAll<HTMLElement>(`.${SPEECH_CLASSES.word}`)
		spans.forEach(span => {
			expect(span.style.opacity).toBe('1')
		})
	})

	it('uses default option values when none supplied', () => {
		const el = makeEl('hello world')
		prepareSpeechType(el)
		applySpeechType(el, 0)

		const spans = el.querySelectorAll<HTMLElement>(`.${SPEECH_CLASSES.word}`)
		expect(spans[0].style.letterSpacing).toBe('0.06em')
		expect(spans[0].style.fontVariationSettings).toContain('700')
	})

	it('is a no-op if prepareSpeechType was never called', () => {
		const el = makeEl('test')
		// Should not throw
		expect(() => applySpeechType(el, 0)).not.toThrow()
	})
})

// ─── removeSpeechType ────────────────────────────────────────────────────────

describe('removeSpeechType', () => {
	it('restores original innerHTML exactly', () => {
		const original = 'Hello <em>world</em>'
		const el = makeEl(original)
		prepareSpeechType(el)
		removeSpeechType(el)
		expect(el.innerHTML).toBe(original)
	})

	it('is a no-op if prepareSpeechType was never called', () => {
		const el = makeEl('text')
		expect(() => removeSpeechType(el)).not.toThrow()
	})
})

// ─── getCleanHTML ─────────────────────────────────────────────────────────────

describe('getCleanHTML', () => {
	it('returns HTML without word spans', () => {
		const el = makeEl('Hello world')
		prepareSpeechType(el)
		const clean = getCleanHTML(el)
		expect(clean).not.toContain(SPEECH_CLASSES.word)
		expect(clean).toContain('Hello')
		expect(clean).toContain('world')
	})

	it('does not modify the original element', () => {
		const el = makeEl('foo bar')
		prepareSpeechType(el)
		getCleanHTML(el)
		const spans = el.querySelectorAll(`.${SPEECH_CLASSES.word}`)
		expect(spans.length).toBe(2)
	})

	it('is idempotent when called on an unprepared element', () => {
		const el = makeEl('plain text')
		const clean = getCleanHTML(el)
		expect(clean).toBe('plain text')
	})
})

// ─── SSR safety ───────────────────────────────────────────────────────────────

describe('SSR safety', () => {
	it('prepareSpeechType returns [] when window is undefined', () => {
		const origWindow = globalThis.window
		// @ts-expect-error — simulate SSR
		delete globalThis.window
		const el = makeEl('test')
		const result = prepareSpeechType(el)
		expect(result).toEqual([])
		globalThis.window = origWindow
	})
})
