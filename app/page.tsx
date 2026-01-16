import { MarketsList } from "@/components/markets-list"
import { ProtocolStats } from "@/components/protocol-stats"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>
              <strong>MVP 1 - Testnet Only:</strong> This is an experimental prototype running on Sepolia. Do not use
              real funds. Smart contracts are unaudited.
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-border/50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                MVP 1 - Sepolia Testnet
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Decentralized Credit
              <span className="text-primary"> Default Swaps</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Create and trade tokenized credit protection. Buy YES tokens for hedging, sell NO tokens to earn premium.
              Trustless and on-chain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/create">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6">
                  <Plus className="w-5 h-5 mr-2" />
                  Create CDS
                </Button>
              </Link>
              <a href="https://github.com/siprifi" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-secondary bg-transparent h-12 px-6"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>

          <ProtocolStats />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Create CDS",
                description:
                  "Define reference entity, notional amount, and maturity. The protocol mints YES and NO tokens.",
              },
              {
                step: "02",
                title: "Trade Tokens",
                description:
                  "Buyers purchase YES tokens (protection). Price reflects implied credit event probability.",
              },
              {
                step: "03",
                title: "Settle & Claim",
                description: "After maturity, owner resolves the event. Winning token holders claim the escrow.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-xl bg-card border border-border group hover:border-primary/30 transition-colors"
              >
                <div className="text-4xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold">CDS Markets</h2>
            <Link href="/create">
              <Button variant="outline" size="sm" className="border-border hover:bg-secondary bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </Link>
          </div>
          <MarketsList />
        </div>
      </section>
    </div>
  )
}
