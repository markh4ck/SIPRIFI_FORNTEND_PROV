import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/components/providers/wagmi-provider"
import { Header } from "@/components/header"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Siprifi | Decentralized Credit Default Swaps",
  description:
    "Siprifi is a decentralized protocol for creating and trading tokenized Credit Default Swaps (CDS) on Ethereum. Buy YES tokens for credit event protection, sell NO tokens to earn premium. Trustless, transparent, and on-chain.",
  keywords: [
    "DeFi",
    "Credit Default Swaps",
    "CDS",
    "Ethereum",
    "Blockchain",
    "Prediction Market",
    "Siprifi",
    "Decentralized Finance",
    "Credit Protection",
    "Smart Contracts",
  ],
  authors: [{ name: "Siprifi Protocol" }],
  creator: "Siprifi",
  publisher: "Siprifi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.siprifi.com",
    title: "Siprifi | Decentralized Credit Default Swaps",
    description:
      "Create and trade tokenized credit protection on Ethereum. Trustless CDS protocol powered by prediction market mechanics.",
    siteName: "Siprifi",
    images: [
      {
        url: "/SiprifiLogoShort.png",
        width: 1200,
        height: 630,
        alt: "Siprifi - Decentralized Credit Default Swaps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siprifi | Decentralized Credit Default Swaps",
    description: "Create and trade tokenized credit protection on Ethereum. Trustless CDS protocol.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  generator: "",
  icons: {
    icon: [
      { url: "/SiprifiLogoShort.png", media: "(prefers-color-scheme: light)" },
      { url: "/SiprifiLogoShort.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1f3c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen">
        <Web3Provider>
          <Header />
          <main>{children}</main>
          <footer className="border-t border-border/50 py-6 mt-auto">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground text-center md:text-left">
                  2026 Siprifi Protocol. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/siprifi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://siprifi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
