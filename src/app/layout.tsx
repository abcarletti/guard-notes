import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/providers/theme-provider'
import QueryProvider from '../providers/tanstack-query'
import './globals.css'

const ibm = IBM_Plex_Mono({
	weight: ['400', '500', '700'],
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Guard notes',
	description: 'Generated by create next app',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="es">
			<body className={ibm.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>{children}</QueryProvider>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
