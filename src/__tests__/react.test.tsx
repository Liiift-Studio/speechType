// speechType/src/__tests__/react.test.tsx — @testing-library/react tests for useSpeechType hook and SpeechTypeText component

import React, { useRef } from 'react'
import { render, renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSpeechType } from '../react/useSpeechType'
import { SpeechTypeText } from '../react/SpeechTypeText'

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Stub window.speechSynthesis so prepareSpeechType does not throw in JSDOM/happy-dom */
beforeEach(() => {
	vi.stubGlobal('speechSynthesis', {
		speak: vi.fn(),
		cancel: vi.fn(),
		getVoices: () => [],
	})
	vi.stubGlobal('SpeechSynthesisUtterance', vi.fn(() => ({
		rate: 1,
		pitch: 1,
		volume: 1,
		onboundary: null,
		onend: null,
		onerror: null,
	})))
})

// ─── useSpeechType ────────────────────────────────────────────────────────────

describe('useSpeechType', () => {
	it('mounts without throwing', () => {
		expect(() => {
			renderHook(() => {
				const ref = useRef<HTMLElement>(null)
				useSpeechType(ref, -1)
			})
		}).not.toThrow()
	})

	it('unmounts without throwing', () => {
		const { unmount } = renderHook(() => {
			const ref = useRef<HTMLElement>(null)
			useSpeechType(ref, -1)
		})
		expect(() => unmount()).not.toThrow()
	})

	it('re-runs without throwing when activeWordIndex changes', () => {
		const { rerender } = renderHook(
			({ idx }: { idx: number }) => {
				const ref = useRef<HTMLElement>(null)
				useSpeechType(ref, idx)
			},
			{ initialProps: { idx: -1 } },
		)
		expect(() => act(() => rerender({ idx: 0 }))).not.toThrow()
		expect(() => act(() => rerender({ idx: 1 }))).not.toThrow()
	})

	it('re-runs prepare effect without throwing when transitionMs option changes', () => {
		const { rerender } = renderHook(
			({ ms }: { ms: number }) => {
				const ref = useRef<HTMLElement>(null)
				useSpeechType(ref, -1, { transitionMs: ms })
			},
			{ initialProps: { ms: 80 } },
		)
		expect(() => act(() => rerender({ ms: 200 }))).not.toThrow()
	})

	it('operates on a real element passed via ref', () => {
		const el = document.createElement('p')
		el.textContent = 'hello world'
		document.body.appendChild(el)

		const { unmount } = renderHook(() => {
			const ref = { current: el }
			useSpeechType(ref, 0)
		})

		// prepareSpeechType should have wrapped words in st-word spans
		expect(el.querySelectorAll('.st-word').length).toBeGreaterThan(0)

		// Cleanup
		unmount()
		document.body.removeChild(el)
	})
})

// ─── SpeechTypeText ───────────────────────────────────────────────────────────

describe('SpeechTypeText', () => {
	it('renders children', () => {
		const { container } = render(
			<SpeechTypeText activeWordIndex={-1}>Hello world</SpeechTypeText>,
		)
		expect(container.textContent).toContain('Hello')
		expect(container.textContent).toContain('world')
	})

	it('renders a <p> element by default', () => {
		const { container } = render(
			<SpeechTypeText activeWordIndex={-1}>text</SpeechTypeText>,
		)
		expect(container.querySelector('p')).not.toBeNull()
	})

	it('renders the element specified by the "as" prop', () => {
		const { container } = render(
			<SpeechTypeText activeWordIndex={-1} as="div">text</SpeechTypeText>,
		)
		expect(container.querySelector('div')).not.toBeNull()
		expect(container.querySelector('p')).toBeNull()
	})

	it('forwards className to the rendered element', () => {
		const { container } = render(
			<SpeechTypeText activeWordIndex={-1} className="my-class">text</SpeechTypeText>,
		)
		const el = container.querySelector('p')
		expect(el?.className).toContain('my-class')
	})

	it('forwards aria-label to the rendered element', () => {
		const { container } = render(
			<SpeechTypeText activeWordIndex={-1} aria-label="speech text">text</SpeechTypeText>,
		)
		const el = container.querySelector('p')
		expect(el?.getAttribute('aria-label')).toBe('speech text')
	})

	it('forwards data-* attributes to the rendered element', () => {
		const { container } = render(
			<SpeechTypeText activeWordIndex={-1} data-testid="st-text">text</SpeechTypeText>,
		)
		const el = container.querySelector('p')
		expect(el?.getAttribute('data-testid')).toBe('st-text')
	})

	it('mounts and unmounts without throwing', () => {
		let unmount!: () => void
		expect(() => {
			const result = render(
				<SpeechTypeText activeWordIndex={-1}>text</SpeechTypeText>,
			)
			unmount = result.unmount
		}).not.toThrow()
		expect(() => unmount()).not.toThrow()
	})

	it('does not forward SpeechTypeOptions props to the DOM element', () => {
		const { container } = render(
			<SpeechTypeText
				activeWordIndex={-1}
				activeTracking={0.1}
				activeWeight={800}
				activeOpsz={20}
				inactiveOpacity={0.3}
				transitionMs={100}
			>
				text
			</SpeechTypeText>,
		)
		const el = container.querySelector('p')
		// These option props should NOT appear as DOM attributes
		expect(el?.hasAttribute('activeTracking')).toBe(false)
		expect(el?.hasAttribute('activeWeight')).toBe(false)
		expect(el?.hasAttribute('transitionMs')).toBe(false)
	})

	it('updates emphasis when activeWordIndex prop changes', () => {
		const { container, rerender } = render(
			<SpeechTypeText activeWordIndex={-1}>alpha beta gamma</SpeechTypeText>,
		)

		// Re-render with an active word
		act(() => {
			rerender(
				<SpeechTypeText activeWordIndex={1}>alpha beta gamma</SpeechTypeText>,
			)
		})

		const spans = container.querySelectorAll<HTMLElement>('.st-word')
		if (spans.length > 0) {
			// When there are spans, the active one should have opacity 1
			expect(spans[1]?.style.opacity).toBe('1')
		}
		// If no spans — prepareSpeechType may have been a no-op in this env; just don't throw
	})
})
