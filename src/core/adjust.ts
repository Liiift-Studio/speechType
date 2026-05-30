// speechType/src/core/adjust.ts — word-wrapping and speech-sync algorithm

import { SPEECH_CLASSES } from './types'
import type { SpeechTypeOptions } from './types'

// ─── Internal state ───────────────────────────────────────────────────────────

/** Per-element state saved by prepareSpeechType */
interface SpeechState {
	/** Original innerHTML captured before wrapping */
	originalHTML: string
	/** Array of per-word span elements */
	wordSpans: HTMLElement[]
	/** Active SpeechSynthesisUtterance, if speaking */
	utterance: SpeechSynthesisUtterance | null
	/** Index of the currently emphasised word, -1 if none */
	activeIndex: number
}

/** Registry of per-element state, keyed by element reference */
const states = new WeakMap<HTMLElement, SpeechState>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively collect all text nodes inside a node, preserving inline elements.
 * Uses childNodes traversal rather than TreeWalker — TreeWalker(SHOW_TEXT) skips
 * <em>/<strong> in happy-dom 12.
 *
 * @param node   - Root node to traverse
 * @param result - Accumulator array
 */
function collectTextNodes(node: Node, result: Text[] = []): Text[] {
	if (node.nodeType === Node.TEXT_NODE) {
		result.push(node as Text)
	} else {
		node.childNodes.forEach(child => collectTextNodes(child, result))
	}
	return result
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Wrap the text content of el in per-word <span> elements with the SPEECH_CLASSES.word
 * class. Saves the original innerHTML for cleanup. Idempotent — calling again re-wraps
 * from the saved original. Returns the array of word span elements.
 *
 * @param el      - Element whose text will be wrapped
 * @param options - SpeechTypeOptions (merged with defaults)
 */
export function prepareSpeechType(el: HTMLElement, options: SpeechTypeOptions = {}): HTMLElement[] {
	if (typeof window === 'undefined') return []

	// Save scroll position — iOS Safari does not support overflow-anchor: none, so innerHTML
	// mutations can jump the page. Restore after mutations via requestAnimationFrame.
	const scrollY = window.scrollY

	// Save original HTML if not already saved, then restore it before re-wrapping
	const existing = states.get(el)
	const originalHTML = existing?.originalHTML ?? el.innerHTML
	el.innerHTML = originalHTML

	// Split the full text into word tokens and whitespace tokens.
	// Note: inline child elements (<em>, <strong>, etc.) are intentionally flattened here —
	// prepareSpeechType reads textContent to build a flat word map for speech-boundary alignment.
	const text = el.textContent ?? ''
	const tokens = text.split(/(\s+)/)
	el.innerHTML = tokens.map(token => {
		if (!token || /^\s+$/.test(token)) return token
		return `<span class="${SPEECH_CLASSES.word}" aria-hidden="true">${token}</span>`
	}).join('')

	// Collect live span references after innerHTML assignment
	const liveSpans = Array.from(el.querySelectorAll<HTMLElement>(`.${SPEECH_CLASSES.word}`))

	// Apply base transition to all word spans
	const transitionMs = options.transitionMs ?? 80
	liveSpans.forEach(span => {
		span.style.display = 'inline'
		span.style.transition = [
			`font-variation-settings ${transitionMs}ms ease`,
			`letter-spacing ${transitionMs}ms ease`,
			`opacity ${transitionMs}ms ease`,
		].join(', ')
	})

	// Inject an off-screen aria-live region so screen readers are notified of the active word.
	// Re-use an existing one if prepareSpeechType is called again on the same element.
	let liveRegion = el.querySelector<HTMLElement>('[data-st-live]')
	if (!liveRegion) {
		liveRegion = document.createElement('span')
		liveRegion.setAttribute('data-st-live', '')
		liveRegion.setAttribute('aria-live', 'polite')
		liveRegion.setAttribute('aria-atomic', 'true')
		liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
		el.appendChild(liveRegion)
	}

	states.set(el, { originalHTML, wordSpans: liveSpans, utterance: null, activeIndex: -1 })

	// Restore scroll position after innerHTML mutations (iOS Safari guard)
	requestAnimationFrame(() => {
		if (Math.abs(window.scrollY - scrollY) > 2) {
			window.scrollTo({ top: scrollY, behavior: 'instant' })
		}
	})

	return liveSpans
}

/**
 * Apply typographic emphasis to the word at activeIndex.
 * All other words receive the inactive style. Pass -1 to reset all words to neutral.
 *
 * @param el          - Element previously prepared by prepareSpeechType
 * @param activeIndex - Index of the word to emphasise, -1 for none
 * @param options     - SpeechTypeOptions (merged with defaults)
 */
export function applySpeechType(el: HTMLElement, activeIndex: number, options: SpeechTypeOptions = {}): void {
	if (typeof window === 'undefined') return
	const state = states.get(el)
	if (!state) return

	const activeTracking = options.activeTracking ?? 0.06
	const activeWeight = options.activeWeight ?? 700
	const activeOpsz = options.activeOpsz ?? 24
	const inactiveOpacity = options.inactiveOpacity ?? 0.45

	state.activeIndex = activeIndex

	// Update aria-live region so screen readers are notified of the active word
	const liveRegion = el.querySelector<HTMLElement>('[data-st-live]')
	if (liveRegion) {
		liveRegion.textContent = activeIndex >= 0 ? (state.wordSpans[activeIndex]?.textContent ?? '') : ''
	}

	state.wordSpans.forEach((span, i) => {
		if (i === activeIndex) {
			span.setAttribute('aria-current', 'true')
			span.style.fontVariationSettings = `"wght" ${activeWeight}, "opsz" ${activeOpsz}`
			span.style.letterSpacing = `${activeTracking}em`
			span.style.opacity = '1'
		} else {
			span.removeAttribute('aria-current')
			span.style.fontVariationSettings = ''
			span.style.letterSpacing = ''
			span.style.opacity = activeIndex === -1 ? '1' : String(inactiveOpacity)
		}
	})
}

/**
 * Start speech synthesis on el's text content, syncing word emphasis to Web Speech API
 * boundary events. Calls prepareSpeechType first. Cancels any existing speech.
 * Returns a stop() function that cancels speech and resets all styles.
 *
 * @param el      - Element to speak and highlight
 * @param options - SpeechTypeOptions (merged with defaults)
 */
export function startSpeechType(el: HTMLElement, options: SpeechTypeOptions = {}): () => void {
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
		options.onUnsupported?.()
		return () => {}
	}

	const wordSpans = prepareSpeechType(el, options)
	const state = states.get(el)
	// prepareSpeechType always sets state when window is defined (SSR guard already passed above)
	if (!state) return () => {}

	// Cancel any existing speech before starting a new utterance.
	// This will fire onerror("interrupted") on the previous utterance, which is handled below.
	window.speechSynthesis.cancel()

	// Build the utterance text from word spans (joined with spaces)
	const text = wordSpans.map(s => s.textContent ?? '').join(' ')
	const utterance = new SpeechSynthesisUtterance(text)
	utterance.rate = options.rate ?? 0.9
	utterance.pitch = options.pitch ?? 1
	utterance.volume = options.volume ?? 1

	// Resolve visual option values once — they are constant for the lifetime of this utterance
	const activeTracking = options.activeTracking ?? 0.06
	const activeWeight = options.activeWeight ?? 700
	const activeOpsz = options.activeOpsz ?? 24
	const resolvedOptions: SpeechTypeOptions = { ...options, activeTracking, activeWeight, activeOpsz }

	// Build a map from character position to word index for boundary matching.
	// Each word occupies charPos … charPos + wordLength, then +1 for the joined space.
	let charPos = 0
	const wordCharPositions: number[] = wordSpans.map(span => {
		const pos = charPos
		charPos += (span.textContent?.length ?? 0) + 1
		return pos
	})

	// Cancellation token: set to true when this utterance is superseded so stale boundary
	// events from the old utterance cannot corrupt emphasis on the new content.
	let cancelled = false

	utterance.onboundary = (e: SpeechSynthesisEvent) => {
		if (cancelled || e.name !== 'word') return
		const idx = wordCharPositions.findIndex((pos, i) => {
			const nextPos = wordCharPositions[i + 1] ?? Infinity
			return e.charIndex >= pos && e.charIndex < nextPos
		})
		if (idx !== -1) applySpeechType(el, idx, resolvedOptions)
	}

	utterance.onend = () => {
		if (cancelled) return
		applySpeechType(el, -1, resolvedOptions)
		state.utterance = null
	}

	utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
		// "interrupted" is a normal cancellation (e.g. a second startSpeechType call) — not an error.
		// All other error codes indicate a real problem; surface them via onError if provided.
		if (e.error !== 'interrupted') {
			options.onError?.(e)
		}
		if (!cancelled) {
			applySpeechType(el, -1, resolvedOptions)
			state.utterance = null
		}
	}

	state.utterance = utterance
	window.speechSynthesis.speak(utterance)

	return () => {
		if (cancelled) return
		cancelled = true
		window.speechSynthesis.cancel()
		applySpeechType(el, -1, resolvedOptions)
		state.utterance = null
	}
}

/**
 * Remove speechType from el — cancel any active speech, restore original innerHTML,
 * and delete all saved state. No-op if prepareSpeechType was never called.
 *
 * @param el - The element previously prepared by prepareSpeechType
 */
export function removeSpeechType(el: HTMLElement): void {
	const state = states.get(el)
	if (!state) return
	if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
		window.speechSynthesis.cancel()
	}
	el.innerHTML = state.originalHTML
	states.delete(el)
}

/**
 * Return a clean copy of el's innerHTML with all speechType spans unwrapped.
 * Does not modify el itself.
 *
 * @param el - Element to read clean HTML from
 */
export function getCleanHTML(el: HTMLElement): string {
	const clone = el.cloneNode(true) as HTMLElement
	clone.querySelectorAll(`.${SPEECH_CLASSES.word}`).forEach(node => {
		const parent = node.parentNode
		if (!parent) return
		while (node.firstChild) parent.insertBefore(node.firstChild, node)
		parent.removeChild(node)
	})
	return clone.innerHTML
}
