"use client"

import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ConnectWallet } from "@/components/connect-wallet"
import { Shield, TrendingUp, Clock, Github, ExternalLink } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard")
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4a90c2] via-[#2a5a8c] to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image src="/images/siprifi-logo.png" alt="Siprifi" width={200} height={60} className="h-14 w-auto" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              MVP 1 - Sepolia Testnet
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight text-balance text-white">
              Decentralized Credit{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                Default Swaps
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
              Create and trade tokenized credit protection on Ethereum. Buy YES tokens for hedging against credit
              events. Trustless, transparent, and fully on-chain.
            </p>

            {/* Connect Wallet CTA */}
            <div className="flex flex-col items-center gap-4">
              <ConnectWallet />
              <p className="text-sm text-blue-100/60">Connect your wallet to access the platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Credit Protection",
                description:
                  "Buy YES tokens to hedge against credit events. Premium is built into the token price based on market demand.",
              },
              {
                icon: TrendingUp,
                title: "Price Discovery",
                description:
                  "Token prices reflect implied default probability. More demand for protection increases the YES token price.",
              },
              {
                icon: Clock,
                title: "Time Decay",
                description:
                  "Protection premium decays as expiry approaches. Pricing engine accounts for time value automatically.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Contract",
                description: "Define reference entity, notional amount, and maturity date.",
              },
              {
                step: "02",
                title: "Mint Tokens",
                description: "Protocol mints YES (protection) and NO (premium) tokens.",
              },
              {
                step: "03",
                title: "Trade YES",
                description: "Buyers pay to acquire YES tokens. Price reflects credit risk.",
              },
              {
                step: "04",
                title: "Settlement",
                description: "At expiry, winning token holders claim the escrow.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-amber-400 font-semibold mb-3">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is MVP 1 running on Sepolia testnet. This is an experimental prototype for demonstration purposes
              only. Smart contracts have not been audited. Do not use real funds. All transactions are on testnet with
              no real value. Use at your own risk.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/siprifi-logo.png"
                alt="Siprifi"
                width={100}
                height={30}
                className="h-6 w-auto opacity-60"
              />
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/siprifi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://siprifi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Website
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
