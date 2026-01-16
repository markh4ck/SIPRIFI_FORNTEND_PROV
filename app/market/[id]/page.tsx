"use client"
import { useReadContract } from "wagmi"
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS } from "@/lib/contract-abi"
import { MarketDetail } from "@/components/market-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Market } from "@/components/market-card"
import { useParams } from "next/navigation"

export default function MarketPage() {
  const params = useParams()
  const id = params.id as string
  const marketId = Number.parseInt(id)

  const { data, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "markets",
    args: [BigInt(marketId)],
  })

  const market: Market | null = data
    ? {
        id: marketId,
        owner: (data as any)[0],
        question: (data as any)[1],
        deadline: Number((data as any)[2]),
        status: (data as any)[3],
        resolved: (data as any)[4],
        outcome: (data as any)[5],
        yesToken: (data as any)[6],
        noToken: (data as any)[7],
      }
    : null

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        ) : isError || !market ? (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Market not found or failed to load. Please check the market ID and try again.
            </AlertDescription>
          </Alert>
        ) : (
          <MarketDetail market={market} />
        )}
      </div>
    </div>
  )
}
