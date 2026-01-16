"use client"

import { useProtocolStats } from "@/hooks/use-protocol-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Activity, CheckCircle, BarChart3 } from "lucide-react"

export function ProtocolStats() {
  const { totalVolume, activeMarkets, resolvedMarkets, totalMarkets, isLoading } = useProtocolStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: "Total Volume Locked",
      value: `${Number(totalVolume).toFixed(4)} ETH`,
      icon: TrendingUp,
    },
    {
      label: "Active Markets",
      value: activeMarkets.toString(),
      icon: Activity,
    },
    {
      label: "Resolved",
      value: resolvedMarkets.toString(),
      icon: CheckCircle,
    },
    {
      label: "Total Markets",
      value: totalMarkets.toString(),
      icon: BarChart3,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
      {stats.map((stat) => (
        <div key={stat.label} className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <stat.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
