import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'xZro | Verifier-first strategy intelligence',
    template: '%s | xZro',
  },
  description:
    'xZro evaluates market data, strategy candidates, and risk criteria to deliver concise market decisions.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050507',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
