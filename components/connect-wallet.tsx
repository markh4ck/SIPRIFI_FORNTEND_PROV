"use client"

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { SUPPORTED_CHAIN_ID } from "@/lib/wagmi-config"

export function ConnectWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useBalance({ address, chainId: SUPPORTED_CHAIN_ID })
  const [copied, setCopied] = useState(false)

  const isWrongNetwork = isConnected && chainId !== SUPPORTED_CHAIN_ID

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleSwitchNetwork = () => {
    switchChain({ chainId: SUPPORTED_CHAIN_ID })
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {isWrongNetwork && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchNetwork}
            className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 bg-transparent"
          >
            <AlertTriangle className="w-4 h-4" />
            Switch to Sepolia
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-card border-border hover:bg-secondary">
              <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? "bg-amber-500" : "bg-success"}`} />
              <span className="font-mono text-sm">{formatAddress(address)}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-card border-border">
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Connected</span>
                <span className={`text-xs ${isWrongNetwork ? "text-amber-400" : "text-primary"}`}>
                  {isWrongNetwork ? "Wrong Network" : "Sepolia"}
                </span>
              </div>
              <div className="font-mono text-xs break-all text-muted-foreground">{address}</div>
              {balance && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Sepolia Balance: </span>
                  <span className="font-semibold">
                    {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                  </span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator className="bg-border" />
            {isWrongNetwork && (
              <>
                <DropdownMenuItem onClick={handleSwitchNetwork} className="cursor-pointer text-amber-400">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Switch to Sepolia
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
              </>
            )}
            <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy Address"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Sepolia Explorer
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => disconnect()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Wallet className="w-4 h-4" />
          Connect
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="p-2 text-xs text-muted-foreground border-b border-border mb-1">Connect to Sepolia Testnet</div>
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="cursor-pointer"
          >
            {connector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
