"use client"

import { useReadContract, useReadContracts } from "wagmi"
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS } from "@/lib/contract-abi"
import { MarketCard, type Market } from "./market-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MarketsList() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all")

  // Get market count
  const { data: marketCount, isLoading: isLoadingCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketCount",
  })

  // Prepare contracts to read all markets
  const marketIds = marketCount ? Array.from({ length: Number(marketCount) }, (_, i) => i + 1) : []

  const { data: marketsData, isLoading: isLoadingMarkets } = useReadContracts({
    contracts: marketIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "markets",
      args: [BigInt(id)],
    })),
  })

  const markets: Market[] = useMemo(() => {
    if (!marketsData) return []

    return marketsData
      .map((result, index) => {
        if (result.status !== "success" || !result.result) return null
        const [owner, question, deadline, status, resolved, outcome, yesToken, noToken, exists] = result.result as [
          string,
          string,
          bigint,
          number,
          boolean,
          number,
          string,
          string,
          boolean,
        ]

        if (!exists) return null

        return {
          id: index + 1,
          owner,
          question,
          deadline: Number(deadline),
          status,
          resolved,
          outcome,
          yesToken,
          noToken,
        }
      })
      .filter((m): m is Market => m !== null)
      .reverse() // Show newest first
  }, [marketsData])

  const filteredMarkets = useMemo(() => {
    let filtered = markets

    // Apply status filter
    if (filter === "active") {
      filtered = filtered.filter((m) => !m.resolved && Date.now() / 1000 < m.deadline)
    } else if (filter === "resolved") {
      filtered = filtered.filter((m) => m.resolved)
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter((m) => m.question.toLowerCase().includes(search.toLowerCase()))
    }

    return filtered
  }, [markets, filter, search])

  const isLoading = isLoadingCount || isLoadingMarkets

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Skeleton className="h-10 w-full md:w-80" />
          <Skeleton className="h-10 w-full md:w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No CDS Contracts Yet</h3>
          <p className="text-muted-foreground max-w-md">
            Be the first to create a Credit Default Swap contract. Click "Create CDS" to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
