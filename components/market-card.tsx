"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, ArrowRight, Coins } from "lucide-react"
import Link from "next/link"
import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS, ERC20_ABI } from "@/lib/contract-abi"

export interface Market {
  id: number
  question: string
  deadline: number
  status: number
  resolved: boolean
  outcome: number
  yesToken: string
  noToken: string
  owner: string
  totalVolume?: string
  yesPrice?: number
  noPrice?: number
}

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const { data: marketEscrow } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketEscrow",
    args: [BigInt(market.id)],
  })

  const { data: yesTotalSupply } = useReadContract({
    address: market.yesToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "totalSupply",
  })

  const { data: noTotalSupply } = useReadContract({
    address: market.noToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "totalSupply",
  })

  const isActive = !market.resolved && Date.now() / 1000 < market.deadline
  const isExpired = Date.now() / 1000 >= market.deadline && !market.resolved
  const timeLeft = market.deadline - Date.now() / 1000

  // Calculate implied probability from token supply
  const yesSupply = yesTotalSupply ? Number(formatEther(yesTotalSupply)) : 0
  const noSupply = noTotalSupply ? Number(formatEther(noTotalSupply)) : 0
  const totalSupply = yesSupply + noSupply
  const impliedProbability = totalSupply > 0 ? ((noSupply / totalSupply) * 100).toFixed(0) : "50"

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Expired"
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    if (days > 0) return `${days}d ${hours}h`
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getStatusBadge = () => {
    if (market.resolved) {
      return (
        <Badge
          variant="outline"
          className={
            market.outcome === 1
              ? "bg-success/10 text-success border-success/30"
              : "bg-destructive/10 text-destructive border-destructive/30"
          }
        >
          {market.outcome === 1 ? "Credit Event" : "No Event"}
        </Badge>
      )
    }
    if (isExpired) {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
          Pending
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
        Active
      </Badge>
    )
  }

  const escrowValue = marketEscrow ? Number(formatEther(marketEscrow)).toFixed(4) : "0.00"

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs text-muted-foreground">CDS #{market.id}</span>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {market.question}
        </h3>

        {/* Probability indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Event Probability</span>
            <span className="font-semibold text-primary">{impliedProbability}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${impliedProbability}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              Escrow
            </div>
            <div className="font-semibold">{escrowValue} ETH</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time
            </div>
            <div className="font-semibold">{formatTimeLeft(timeLeft)}</div>
          </div>
        </div>

        {market.resolved && (
          <div
            className={`p-3 rounded-lg ${market.outcome === 1 ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                className={`w-4 h-4 ${market.outcome === 1 ? "text-success" : "text-destructive rotate-180"}`}
              />
              <span className={`text-sm font-medium ${market.outcome === 1 ? "text-success" : "text-destructive"}`}>
                {market.outcome === 1 ? "YES won" : "NO won"}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/market/${market.id}`} className="w-full">
          <Button
            variant="secondary"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            {market.resolved ? "View" : "Trade"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
