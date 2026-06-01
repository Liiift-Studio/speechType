// speechType/src/react/SpeechTypeText.tsx — React component wrapper for speechType
"use client"

import { useRef, forwardRef, useImperativeHandle, type ElementType } from 'react'
import { useSpeechType } from './useSpeechType'
import type { SpeechTypeOptions } from '../core/types'

// HTML attributes forwarded to the DOM element, minus any that SpeechTypeOptions already owns
// (prevents type conflicts on shared names like onError) and minus the props we declare explicitly.
type HTMLForwardProps = Omit<
	React.HTMLAttributes<HTMLElement>,
	keyof SpeechTypeOptions | 'children' | 'style' | 'className'
>

/** Props accepted by SpeechTypeText */
interface SpeechTypeTextProps extends SpeechTypeOptions, HTMLForwardProps {
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

		// Tag is always an intrinsic element in practice (default 'p').
		// Casting avoids the polymorphic-component type complexity for ref + htmlProps.
		const El = Tag as React.ComponentType<
			React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
		>

		return (
			<El ref={innerRef} style={style} className={className} {...htmlProps}>
				{children}
			</El>
		)
	},
)
