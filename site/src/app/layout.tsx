import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "speechType — Per-word typographic emphasis synced to speech | Type Tools",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "speechType highlights each spoken word with typographic emphasis as it is spoken — wider tracking, heavier weight, larger optical size — synced to Web Speech API boundary events. Zero dependencies.",
	keywords: ["typography", "speech synthesis", "web speech api", "text to speech", "tts", "karaoke", "accessibility", "a11y", "language learning", "teleprompter", "variable font", "wght", "opsz", "letter-spacing", "TypeScript", "npm", "react"],
	openGraph: {
		title: "speechType — Per-word typographic emphasis synced to speech",
		description: "Per-word typographic emphasis synced to Web Speech API boundary events. Each spoken word receives wider tracking, heavier weight, and larger optical size.",
		url: "https://speechtype.com",
		siteName: "speechType",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "speechType — Per-word typographic emphasis synced to speech",
		description: "Per-word typographic emphasis synced to Web Speech API boundary events. Each spoken word receives wider tracking, heavier weight, and larger optical size.",
	},
	metadataBase: new URL("https://speechtype.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
