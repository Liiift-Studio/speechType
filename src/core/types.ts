// speechType/src/core/types.ts — options interface for the speechType tool

/** CSS class names used by speechType */
export const SPEECH_CLASSES = {
	word: 'st-word',
	active: 'st-active',
	inactive: 'st-inactive',
} as const

/** Options controlling how speechType emphasises spoken words */
export interface SpeechTypeOptions {
	/** Letter-spacing on the active (currently spoken) word in em. Default: 0.06 */
	activeTracking?: number
	/** wght axis value on the active word. Default: 700 */
	activeWeight?: number
	/** opsz axis value on the active word. Default: 24 */
	activeOpsz?: number
	/** Opacity of inactive (not currently spoken) words. Default: 0.45 */
	inactiveOpacity?: number
	/** CSS transition duration in ms for style changes. Default: 80 */
	transitionMs?: number
	/** Speech rate (0.1–10). Default: 0.9 */
	rate?: number
	/** Speech pitch (0–2). Default: 1 */
	pitch?: number
	/** Speech volume (0–1). Default: 1 */
	volume?: number
}
