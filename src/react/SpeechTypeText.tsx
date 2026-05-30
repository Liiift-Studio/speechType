// speechType/src/react/SpeechTypeText.tsx — React component wrapper for speechType
"use client"

import { useRef, forwardRef, useImperativeHandle, type ElementType } from 'react'
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
	/** Called when speech synthesis is unavailable in this browser */
	onUnsupported?: () => void
	/** Called when a real speech error occurs (excludes normal 'interrupted' cancellations) */
	onError?: (event: SpeechSynthesisErrorEvent) => void
	/** Any additional HTML attributes (aria-*, data-*, role, lang, etc.) are forwarded to the DOM element */
	[key: string]: unknown
}

/**
 * Renders children inside the given tag, wraps words in spans, and emphasises
 * the word at activeWordIndex with wider tracking, heavier weight, and larger opsz.
 * Forwards a ref to the underlying DOM element for imperative startSpeechType access.
 * All aria-*, data-*, role, lang, and other HTML attributes are forwarded to the DOM element.
 */
export const SpeechTypeText = forwardRef<HTMLElement, SpeechTypeTextProps>(
	function SpeechTypeText(
		{
			activeWordIndex,
			as: Tag = 'p',
			children,
			style,
			className,
			// Extract SpeechTypeOptions fields explicitly so they are NOT forwarded to the DOM
			activeTracking,
			activeWeight,
			activeOpsz,
			inactiveOpacity,
			transitionMs,
			rate,
			pitch,
			volume,
			onUnsupported,
			onError,
			// Remaining props (aria-*, data-*, role, lang, etc.) are forwarded to the DOM element
			...htmlProps
		},
		forwardedRef,
	) {
		const innerRef = useRef<HTMLElement>(null)

		// Support both object refs and callback refs from the consumer
		useImperativeHandle(forwardedRef, () => innerRef.current as HTMLElement)

		const options: SpeechTypeOptions = {
			activeTracking,
			activeWeight,
			activeOpsz,
			inactiveOpacity,
			transitionMs,
			rate,
			pitch,
			volume,
			onUnsupported,
			onError,
		}

		useSpeechType(innerRef, activeWordIndex, options)

		return (
			<Tag ref={innerRef} style={style} className={className} {...htmlProps}>
				{children}
			</Tag>
		)
	},
)
