import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <main className="container mx-auto max-w-4xl p-6">{children}</main>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
