// speechType/src/react/useSpeechType.ts — React hook for per-word speech emphasis

import { useEffect, type RefObject } from 'react'
import { prepareSpeechType, applySpeechType, removeSpeechType } from '../core/adjust'
import type { SpeechTypeOptions } from '../core/types'

/**
 * Prepare word spans on mount and apply emphasis when activeWordIndex changes.
 * Cleans up by restoring original innerHTML on unmount.
 *
 * @param ref             - Ref to the element containing text to highlight
 * @param activeWordIndex - Index of the currently active word (-1 = none)
 * @param options         - SpeechTypeOptions (merged with defaults)
 */
export function useSpeechType(
	ref: RefObject<HTMLElement | null>,
	activeWordIndex: number,
	options?: SpeechTypeOptions,
): void {
	// Prepare word spans on mount; clean up on unmount
	useEffect(() => {
		const el = ref.current
		if (!el) return
		prepareSpeechType(el, options)
		return () => removeSpeechType(el)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Apply emphasis whenever activeWordIndex changes
	useEffect(() => {
		const el = ref.current
		if (!el) return
		applySpeechType(el, activeWordIndex, options)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeWordIndex])
}
