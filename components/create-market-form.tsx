"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useSwitchChain } from "wagmi"
import { parseEther, formatEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS } from "@/lib/contract-abi"
import { SUPPORTED_CHAIN_ID } from "@/lib/wagmi-config"
import { Loader2, Shield, AlertCircle, CheckCircle2, Info, Wallet, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateMarketForm() {
  const { isConnected, address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: SUPPORTED_CHAIN_ID,
  })

  const [formData, setFormData] = useState({
    referenceEntity: "",
    notionalAmount: "",
    maturityDate: "",
    spreadBps: "",
    description: "",
  })

  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const notionalInWei = formData.notionalAmount ? parseEther(formData.notionalAmount) : BigInt(0)
  const hasSufficientFunds = balance ? balance.value >= notionalInWei : false
  const isWrongNetwork = chainId !== SUPPORTED_CHAIN_ID

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setFormData({
        referenceEntity: "",
        notionalAmount: "",
        maturityDate: "",
        spreadBps: "",
        description: "",
      })
    }
  }, [isSuccess])

  const generateQuestion = () => {
    const { referenceEntity, notionalAmount, maturityDate, spreadBps } = formData
    if (!referenceEntity || !notionalAmount || !maturityDate) return ""

    return `Will ${referenceEntity} experience a credit event before ${new Date(maturityDate).toLocaleDateString()}? Notional: ${notionalAmount} ETH | Spread: ${spreadBps || "0"} bps`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !hasSufficientFunds) return

    const question = generateQuestion()
    const deadline = Math.floor(new Date(formData.maturityDate).getTime() / 1000)

    // The notional amount will be used when buying YES shares
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createMarket",
      args: [question, BigInt(deadline)],
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSwitchNetwork = () => {
    switchChain({ chainId: SUPPORTED_CHAIN_ID })
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
          <p className="text-muted-foreground text-center">
            Connect your wallet to create a new Credit Default Swap contract
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Create Credit Default Swap
        </CardTitle>
        <CardDescription>
          Define the parameters for your CDS protection contract. As the creator, you will receive NO tokens when buyers
          purchase YES tokens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isWrongNetwork && (
          <Alert className="mb-6 bg-amber-500/10 border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please switch to Sepolia testnet to create markets</span>
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

        <div className="mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Your Sepolia Balance</span>
            </div>
            <div className="text-right">
              {isBalanceLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="font-mono text-lg">
                  {balance ? Number.parseFloat(formatEther(balance.value)).toFixed(4) : "0.0000"} ETH
                </span>
              )}
            </div>
          </div>
          {balance && balance.value === BigInt(0) && (
            <p className="text-xs text-muted-foreground mt-2">
              Need testnet ETH? Get some from{" "}
              <a
                href="https://sepoliafaucet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sepolia Faucet
              </a>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="referenceEntity">Reference Entity</Label>
              <Input
                id="referenceEntity"
                placeholder="e.g., Company ABC, Protocol XYZ"
                value={formData.referenceEntity}
                onChange={(e) => handleChange("referenceEntity", e.target.value)}
                className="bg-input border-border"
                required
              />
              <p className="text-xs text-muted-foreground">The entity whose credit risk is being transferred</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notionalAmount">Notional Amount (ETH)</Label>
              <Input
                id="notionalAmount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.1"
                value={formData.notionalAmount}
                onChange={(e) => handleChange("notionalAmount", e.target.value)}
                className={`bg-input border-border ${
                  formData.notionalAmount && !hasSufficientFunds ? "border-destructive" : ""
                }`}
                required
              />
              {formData.notionalAmount && !hasSufficientFunds ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Insufficient funds. You need {formData.notionalAmount} ETH
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">The face value of the protection being offered</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maturityDate">Maturity Date (Time to Die)</Label>
              <Input
                id="maturityDate"
                type="datetime-local"
                value={formData.maturityDate}
                onChange={(e) => handleChange("maturityDate", e.target.value)}
                className="bg-input border-border"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <p className="text-xs text-muted-foreground">Contract expires and resolves after this date</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spreadBps">Spread (basis points)</Label>
              <Input
                id="spreadBps"
                type="number"
                min="0"
                max="10000"
                placeholder="100"
                value={formData.spreadBps}
                onChange={(e) => handleChange("spreadBps", e.target.value)}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">Reference spread for pricing (1bp = 0.01%)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Description</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about the credit event criteria..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="bg-input border-border min-h-[100px]"
            />
          </div>

          {/* Preview */}
          {generateQuestion() && (
            <Alert className="bg-secondary/50 border-border">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <span className="font-medium">Contract Question Preview:</span>
                <br />
                <span className="text-sm text-muted-foreground">{generateQuestion()}</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2">
            <h4 className="font-medium text-sm">Token Economics</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • <span className="text-primary">YES tokens</span> → Protection buyers (pay premium, receive payout if
                credit event)
              </li>
              <li>
                • <span className="text-[#3b82f6]">NO tokens</span> → You receive these when buyers purchase YES tokens
              </li>
              <li>• Premium is implied in the YES token market price</li>
              <li>• When someone buys YES shares with ETH, you automatically receive equivalent NO tokens</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {error.message.includes("User rejected")
                  ? "Transaction was rejected"
                  : error.message.includes("insufficient")
                    ? "Insufficient funds for this transaction"
                    : "Failed to create market. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="bg-primary/10 border-primary/30 text-primary">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                CDS contract created successfully! Transaction: {hash?.slice(0, 10)}...
                <br />
                <span className="text-xs text-muted-foreground">
                  You will receive NO tokens when buyers purchase YES shares.
                </span>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={
              isPending ||
              isConfirming ||
              isWrongNetwork ||
              !formData.referenceEntity ||
              !formData.notionalAmount ||
              !formData.maturityDate ||
              !hasSufficientFunds
            }
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isPending ? "Confirm in Wallet..." : "Creating Contract..."}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Create CDS Contract
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
