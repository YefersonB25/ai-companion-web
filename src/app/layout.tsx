import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AriaCoreProvider } from '@/components/AriaCoreProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'AI Companion',
  description: 'Tu asistente personal de inteligencia artificial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AriaCoreProvider>
            {children}
          </AriaCoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
