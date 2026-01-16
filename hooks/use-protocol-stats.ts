"use client"

import { useReadContract, useReadContracts } from "wagmi"
import { useMemo } from "react"
import { formatEther } from "viem"
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS } from "@/lib/contract-abi"

export interface ProtocolStats {
  totalVolume: string
  activeMarkets: number
  resolvedMarkets: number
  totalMarkets: number
  isLoading: boolean
}

export function useProtocolStats(): ProtocolStats {
  // Get market count
  const { data: marketCount, isLoading: isLoadingCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketCount",
  })

  // Prepare contracts to read all markets
  const marketIds = marketCount ? Array.from({ length: Number(marketCount) }, (_, i) => i + 1) : []

  // Read all markets data
  const { data: marketsData, isLoading: isLoadingMarkets } = useReadContracts({
    contracts: marketIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "markets",
      args: [BigInt(id)],
    })),
  })

  // Read escrow for each market
  const { data: escrowData, isLoading: isLoadingEscrow } = useReadContracts({
    contracts: marketIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "marketEscrow",
      args: [BigInt(id)],
    })),
  })

  const stats = useMemo(() => {
    if (!marketsData) {
      return {
        totalVolume: "0",
        activeMarkets: 0,
        resolvedMarkets: 0,
        totalMarkets: 0,
      }
    }

    let activeCount = 0
    let resolvedCount = 0
    let totalVolumeWei = BigInt(0)
    const now = Date.now() / 1000

    marketsData.forEach((result, index) => {
      if (result.status !== "success" || !result.result) return

      const [, , deadline, , resolved, , , , exists] = result.result as [
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

      if (!exists) return

      if (resolved) {
        resolvedCount++
      } else if (now < Number(deadline)) {
        activeCount++
      }

      // Add escrow to total volume
      if (escrowData && escrowData[index]?.status === "success" && escrowData[index]?.result) {
        totalVolumeWei += escrowData[index].result as bigint
      }
    })

    return {
      totalVolume: formatEther(totalVolumeWei),
      activeMarkets: activeCount,
      resolvedMarkets: resolvedCount,
      totalMarkets: marketIds.length,
    }
  }, [marketsData, escrowData, marketIds.length])

  return {
    ...stats,
    isLoading: isLoadingCount || isLoadingMarkets || isLoadingEscrow,
  }
}
