import type { Metadata } from "next"
import "./globals.css"
import { Merriweather } from "next/font/google"

const merriweather = Merriweather({
	weight: ['300', '700'],
	style: ['normal', 'italic'],
	subsets: ["latin"],
	variable: "--font-merriweather",
})

export const metadata: Metadata = {
	title: "speechType — Typography that follows your voice",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "speechType highlights each spoken word with typographic emphasis as it is spoken — wider tracking, heavier weight — synced to Web Speech API boundary events.",
	keywords: ["typography", "speech synthesis", "web speech api", "karaoke", "accessibility", "a11y", "language learning", "variable font", "wght", "opsz", "letter-spacing", "teleprompter", "TypeScript", "npm", "react"],
	openGraph: {
		title: "speechType — Typography that follows your voice",
		description: "Per-word typographic emphasis synced to Web Speech API boundary events. Each spoken word receives wider tracking and heavier weight.",
		url: "https://speechtype.com",
		siteName: "speechType",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "speechType — Typography that follows your voice",
		description: "Per-word typographic emphasis synced to Web Speech API boundary events.",
	},
	metadataBase: new URL("https://speechtype.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${merriweather.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
