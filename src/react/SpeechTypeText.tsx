// speechType/src/react/SpeechTypeText.tsx — React component wrapper for speechType
"use client"

import { useRef, forwardRef, type ElementType } from 'react'
import { useSpeechType } from './useSpeechType'
import type { SpeechTypeOptions } from '../core/types'

/** Props accepted by SpeechTypeText */
interface SpeechTypeTextProps extends SpeechTypeOptions {
	/** Index of the word currently being spoken (-1 = no active word). Default: -1 */
	activeWordIndex: number
	/** HTML element tag to render. Default: 'p' */
	as?: ElementType
	/** React children (text content to highlight) */
	children: React.ReactNode
	/** Inline styles forwarded to the rendered element */
	style?: React.CSSProperties
	/** Class name forwarded to the rendered element */
	className?: string
}

/**
 * Renders children inside the given tag, wraps words in spans, and emphasises
 * the word at activeWordIndex with wider tracking, heavier weight, and larger opsz.
 * Forwards a ref to the underlying DOM element for imperative startSpeechType access.
 */
export const SpeechTypeText = forwardRef<HTMLElement, SpeechTypeTextProps>(
	function SpeechTypeText(
		{ activeWordIndex, as: Tag = 'p', children, style, className, ...options },
		forwardedRef,
	) {
		const innerRef = useRef<HTMLElement>(null)
		// Use the forwarded ref if provided, otherwise fall back to the inner ref
		const resolvedRef = (forwardedRef ?? innerRef) as React.RefObject<HTMLElement | null>
		useSpeechType(resolvedRef, activeWordIndex, options)
		return (
			<Tag ref={resolvedRef} style={style} className={className}>
				{children}
			</Tag>
		)
	},
)
