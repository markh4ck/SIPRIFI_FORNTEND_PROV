"use client"

import { useState, useEffect } from "react"
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBalance,
  useSwitchChain,
} from "wagmi"
import { parseEther, formatEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PREDICTION_MARKET_ABI, ERC20_ABI, CONTRACT_ADDRESS } from "@/lib/contract-abi"
import { SUPPORTED_CHAIN_ID } from "@/lib/wagmi-config"
import { YesTokenChart } from "./yes-token-chart"
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wallet,
  User,
  Coins,
  AlertTriangle,
  Activity,
  Gavel,
  Shield,
  ShieldOff,
  ExternalLink,
  Copy,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Market } from "./market-card"

interface MarketDetailProps {
  market: Market
}

export function MarketDetail({ market }: MarketDetailProps) {
  const { isConnected, address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { data: ethBalance } = useBalance({ address, chainId: SUPPORTED_CHAIN_ID })
  const [buyAmount, setBuyAmount] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const isWrongNetwork = chainId !== SUPPORTED_CHAIN_ID

  const buyAmountInWei = buyAmount ? parseEther(buyAmount) : BigInt(0)
  const hasSufficientFunds = ethBalance ? ethBalance.value >= buyAmountInWei : false

  const { data: yesBalance, refetch: refetchYesBalance } = useReadContract({
    address: market.yesToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: noBalance, refetch: refetchNoBalance } = useReadContract({
    address: market.noToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: yesTotalSupply, refetch: refetchYesSupply } = useReadContract({
    address: market.yesToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "totalSupply",
  })

  const { data: noTotalSupply, refetch: refetchNoSupply } = useReadContract({
    address: market.noToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "totalSupply",
  })

  const { data: marketEscrow, refetch: refetchEscrow } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketEscrow",
    args: [BigInt(market.id)],
  })

  const { data: buyHash, writeContract: writeBuy, isPending: isBuying, error: buyError } = useWriteContract()
  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyHash })

  const {
    data: resolveHash,
    writeContract: writeResolve,
    isPending: isResolving,
    error: resolveError,
  } = useWriteContract()
  const { isLoading: isResolveConfirming, isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({
    hash: resolveHash,
  })

  const { data: claimHash, writeContract: writeClaim, isPending: isClaiming, error: claimError } = useWriteContract()
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash })

  useEffect(() => {
    if (isBuySuccess) {
      const timer = setTimeout(() => {
        refetchYesBalance()
        refetchNoBalance()
        refetchYesSupply()
        refetchNoSupply()
        refetchEscrow()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isBuySuccess, refetchYesBalance, refetchNoBalance, refetchYesSupply, refetchNoSupply, refetchEscrow])

  const isActive = !market.resolved && Date.now() / 1000 < market.deadline
  const isExpired = Date.now() / 1000 >= market.deadline
  const isOwner = address?.toLowerCase() === market.owner.toLowerCase()

  const handleBuyYes = () => {
    if (!buyAmount || Number.parseFloat(buyAmount) <= 0 || !hasSufficientFunds) return

    writeBuy({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "buyYesShares",
      args: [BigInt(market.id)],
      value: parseEther(buyAmount),
    })
  }

  const handleResolve = (outcome: 0 | 1) => {
    writeResolve({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "resolveMarket",
      args: [BigInt(market.id), outcome],
    })
  }

  const handleClaim = () => {
    writeClaim({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "claimReward",
      args: [BigInt(market.id)],
    })
  }

  const handleSwitchNetwork = () => {
    switchChain({ chainId: SUPPORTED_CHAIN_ID })
  }

  const formatTimeLeft = () => {
    const timeLeft = market.deadline - Date.now() / 1000
    if (timeLeft <= 0) return "Expired"
    const days = Math.floor(timeLeft / 86400)
    const hours = Math.floor((timeLeft % 86400) / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    return `${hours}h ${minutes}m`
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalEscrow = marketEscrow ? formatEther(marketEscrow) : yesTotalSupply ? formatEther(yesTotalSupply) : "0"
  const yesSupply = yesTotalSupply ? formatEther(yesTotalSupply) : "0"
  const noSupply = noTotalSupply ? formatEther(noTotalSupply) : "0"

  const yesNum = Number(yesSupply)
  const noNum = Number(noSupply)
  const totalSupply = yesNum + noNum
  const currentYesPrice = totalSupply > 0 ? yesNum / totalSupply : 0.5
  const impliedProbability = (currentYesPrice * 100).toFixed(1)

  const buyAmountNum = buyAmount ? Number(buyAmount) : 0
  const newYesSupply = yesNum + buyAmountNum
  const newNoSupply = noNum + buyAmountNum
  const newPrice = newYesSupply + newNoSupply > 0 ? newYesSupply / (newYesSupply + newNoSupply) : 0.5
  const priceImpact = currentYesPrice > 0 ? (((newPrice - currentYesPrice) / currentYesPrice) * 100).toFixed(2) : "0.00"

  return (
    <div className="space-y-6">
      {isConnected && isWrongNetwork && (
        <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Please switch to Sepolia testnet to interact with this market</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchNetwork}
              className="ml-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 bg-transparent"
            >
              Switch to Sepolia
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              CDS #{market.id}
            </Badge>
            {isOwner && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                <User className="w-3 h-3 mr-1" />
                Owner
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-balance">{market.question}</h1>
        </div>
        {market.resolved ? (
          <Badge
            className={`text-sm px-4 py-2 ${
              market.outcome === 1
                ? "bg-success/10 text-success border-success/30"
                : "bg-destructive/10 text-destructive border-destructive/30"
            }`}
            variant="outline"
          >
            {market.outcome === 1 ? "Credit Event" : "No Event"}
          </Badge>
        ) : isExpired ? (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-sm px-4 py-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Pending Resolution
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-sm px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            Time Left
          </div>
          <div className="font-semibold text-lg">{formatTimeLeft()}</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Coins className="w-3 h-3" />
            Escrow
          </div>
          <div className="font-semibold text-lg">{Number(totalEscrow).toFixed(4)} SEP</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3 h-3 text-success" />
            YES Supply
          </div>
          <div className="font-semibold text-lg">{Number(yesSupply).toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingDown className="w-3 h-3 text-destructive" />
            NO Supply
          </div>
          <div className="font-semibold text-lg">{Number(noSupply).toFixed(2)}</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current YES Token Price</div>
            <div className="text-3xl font-bold text-primary">${currentYesPrice.toFixed(4)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Implied Credit Event</div>
            <div className="text-3xl font-bold">{impliedProbability}%</div>
          </div>
          <div className="w-full md:w-auto">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                style={{ width: `${impliedProbability}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Safe</span>
              <span>High Risk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <YesTokenChart
          key={`${yesSupply}-${noSupply}-${totalEscrow}`}
          marketId={market.id}
          yesSupply={yesSupply}
          noSupply={noSupply}
          escrow={totalEscrow}
          deadline={market.deadline}
        />

        <div className="space-y-6">
          {isConnected && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="text-xs text-muted-foreground mb-1">YES Tokens</div>
                    <div className="text-xl font-bold text-success">
                      {yesBalance ? Number(formatEther(yesBalance)).toFixed(4) : "0"}
                    </div>
                    {yesBalance && Number(formatEther(yesBalance)) > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ≈ {(Number(formatEther(yesBalance)) * currentYesPrice).toFixed(4)} SEP
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div className="text-xs text-muted-foreground mb-1">NO Tokens</div>
                    <div className="text-xl font-bold text-destructive">
                      {noBalance ? Number(formatEther(noBalance)).toFixed(4) : "0"}
                    </div>
                    {noBalance && Number(formatEther(noBalance)) > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ≈ {(Number(formatEther(noBalance)) * (1 - currentYesPrice)).toFixed(4)} SEP
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isActive && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  Buy Protection
                </CardTitle>
                <CardDescription className="text-xs">Buy YES tokens to hedge against credit events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="buyAmount" className="text-sm">
                      Amount (Sepolia ETH)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Balance: {ethBalance ? Number.parseFloat(ethBalance.formatted).toFixed(4) : "0"} SEP
                    </span>
                  </div>
                  <Input
                    id="buyAmount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.00"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className={`bg-input border-border ${buyAmount && !hasSufficientFunds ? "border-destructive" : ""}`}
                    disabled={!isActive || isWrongNetwork}
                  />
                  {buyAmount && !hasSufficientFunds && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Insufficient funds. You need {buyAmount} SEP
                    </p>
                  )}
                </div>

                {ethBalance && ethBalance.value === BigInt(0) && (
                  <Alert className="bg-secondary/50 border-border py-2">
                    <Wallet className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      Need testnet ETH? Get some from{" "}
                      <a
                        href="https://sepoliafaucet.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Sepolia Faucet
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="p-3 rounded-lg bg-secondary/30 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You pay</span>
                    <span>{buyAmount || "0"} SEP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You receive</span>
                    <span className="text-success font-medium">{buyAmount || "0"} YES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current price</span>
                    <span>${currentYesPrice.toFixed(4)}</span>
                  </div>
                  {buyAmountNum > 0 && (
                    <>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New price after purchase</span>
                          <span className="text-primary">${newPrice.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price impact</span>
                          <span className={Number(priceImpact) > 5 ? "text-warning" : "text-muted-foreground"}>
                            +{priceImpact}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-xs border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">NO tokens minted to owner</span>
                    <span className="font-mono text-muted-foreground">
                      {market.owner.slice(0, 6)}...{market.owner.slice(-4)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleBuyYes}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={
                    !isActive || isBuying || isBuyConfirming || !buyAmount || !hasSufficientFunds || isWrongNetwork
                  }
                >
                  {isBuying || isBuyConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isBuying ? "Confirm in Wallet" : "Processing"}
                    </>
                  ) : isWrongNetwork ? (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Switch to Sepolia
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Buy YES Protection
                    </>
                  )}
                </Button>

                {buyError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      {buyError.message.includes("insufficient")
                        ? "Insufficient funds for this transaction"
                        : "Transaction failed"}
                    </AlertDescription>
                  </Alert>
                )}

                {isBuySuccess && (
                  <Alert className="bg-success/10 border-success/30 text-success py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      Purchase successful! Data will refresh shortly.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isOwner && isExpired && !market.resolved && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              Resolve Contract
            </CardTitle>
            <CardDescription>
              As the contract owner, you must determine if a credit event has occurred for the reference entity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/30 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference Entity</span>
                <span className="font-medium">{market.question}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Escrow</span>
                <span className="font-medium">{totalEscrow} SEP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">YES Holders Payout</span>
                <span className="font-medium text-success">{yesSupply} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NO Holders Payout</span>
                <span className="font-medium text-destructive">{noSupply} tokens</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-20 bg-success hover:bg-success/90 text-success-foreground flex-col"
                onClick={() => handleResolve(1)}
                disabled={isResolving || isResolveConfirming || isWrongNetwork}
              >
                {isResolving || isResolveConfirming ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-6 h-6 mb-1" />
                    <div className="font-semibold">Credit Event</div>
                    <div className="text-xs opacity-80">YES holders win</div>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-20 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent flex-col"
                onClick={() => handleResolve(0)}
                disabled={isResolving || isResolveConfirming || isWrongNetwork}
              >
                {isResolving || isResolveConfirming ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ShieldOff className="w-6 h-6 mb-1" />
                    <div className="font-semibold">No Event</div>
                    <div className="text-xs opacity-80">NO holders win</div>
                  </>
                )}
              </Button>
            </div>

            {resolveError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>Resolution failed. Make sure you are the contract owner.</AlertDescription>
              </Alert>
            )}
            {isResolveSuccess && (
              <Alert className="mt-4 bg-success/10 border-success/30 text-success">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>Market resolved successfully! Winners can now claim their rewards.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {!isOwner && isExpired && !market.resolved && (
        <Card className="border border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-400">Awaiting Resolution</h3>
                <p className="text-sm text-muted-foreground">
                  This contract has expired and is pending resolution by the owner.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {market.resolved && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Claim Reward
            </CardTitle>
            <CardDescription>
              Market resolved as <strong>{market.outcome === 1 ? "Credit Event" : "No Event"}</strong>.{" "}
              {market.outcome === 1 ? "YES" : "NO"} token holders can claim their rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/30 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your {market.outcome === 1 ? "YES" : "NO"} tokens</span>
                <span className="font-medium">
                  {market.outcome === 1
                    ? yesBalance
                      ? Number(formatEther(yesBalance)).toFixed(4)
                      : "0"
                    : noBalance
                      ? Number(formatEther(noBalance)).toFixed(4)
                      : "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total escrow</span>
                <span className="font-medium">{totalEscrow} SEP</span>
              </div>
            </div>

            <Button
              onClick={handleClaim}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isClaiming || isClaimConfirming || isWrongNetwork}
            >
              {isClaiming || isClaimConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isClaiming ? "Confirm in Wallet" : "Processing"}
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Claim Reward
                </>
              )}
            </Button>

            {claimError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Claim failed. You may have already claimed or have no winning tokens.
                </AlertDescription>
              </Alert>
            )}
            {isClaimSuccess && (
              <Alert className="bg-success/10 border-success/30 text-success py-2">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription className="text-xs">Reward claimed successfully!</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Contract Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Owner</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {market.owner.slice(0, 6)}...{market.owner.slice(-4)}
              </span>
              <button onClick={() => copyToClipboard(market.owner, "owner")} className="p-1 hover:bg-secondary rounded">
                {copied === "owner" ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${market.owner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-secondary rounded"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">YES Token</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {market.yesToken.slice(0, 6)}...{market.yesToken.slice(-4)}
              </span>
              <button
                onClick={() => copyToClipboard(market.yesToken, "yes")}
                className="p-1 hover:bg-secondary rounded"
              >
                {copied === "yes" ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <a
                href={`https://sepolia.etherscan.io/token/${market.yesToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-secondary rounded"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">NO Token</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {market.noToken.slice(0, 6)}...{market.noToken.slice(-4)}
              </span>
              <button onClick={() => copyToClipboard(market.noToken, "no")} className="p-1 hover:bg-secondary rounded">
                {copied === "no" ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <a
                href={`https://sepolia.etherscan.io/token/${market.noToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-secondary rounded"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deadline</span>
            <span>{new Date(market.deadline * 1000).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
