"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Info } from "lucide-react"

interface YesTokenChartProps {
  marketId: number
  yesSupply: string
  noSupply: string
  escrow: string
  deadline: number
  createdAt?: number
}

function calculateYesPrice(yesSupply: number, noSupply: number): number {
  const totalSupply = yesSupply + noSupply
  if (totalSupply === 0) return 0.5 // Initial price at 50%
  return yesSupply / totalSupply
}

function generatePriceHistory(
  currentYesSupply: number,
  currentNoSupply: number,
  escrow: number,
  deadline: number,
  createdAt: number,
) {
  const now = Date.now() / 1000
  const duration = Math.max(deadline - createdAt, 86400)
  const elapsed = Math.max(now - createdAt, 3600)
  const dataPoints = Math.min(20, Math.max(5, Math.floor(elapsed / (duration / 20))))

  const data = []

  for (let i = 0; i <= dataPoints; i++) {
    const progress = i / dataPoints

    // Simulate supply growth - starts at 0 and grows to current supply
    const yesAtTime = currentYesSupply * progress
    const noAtTime = currentNoSupply * progress

    // Calculate price at this supply level
    const price = calculateYesPrice(yesAtTime, noAtTime)

    const timestamp = createdAt + duration * progress
    const date = new Date(timestamp * 1000)

    // Generate OHLC-like data
    const open = i === 0 ? 0.5 : data[i - 1]?.close || 0.5
    const close = price
    const spread = 0.015
    const high = Math.min(0.99, Math.max(open, close) + Math.random() * spread)
    const low = Math.max(0.01, Math.min(open, close) - Math.random() * spread)

    data.push({
      date: i === dataPoints ? "Now" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestamp,
      open,
      high,
      low,
      close,
      price,
      yesSupply: yesAtTime,
      noSupply: noAtTime,
      volume: (escrow / Math.max(dataPoints, 1)) * (0.5 + Math.random()),
    })
  }

  return data
}

export function YesTokenChart({ marketId, yesSupply, noSupply, escrow, deadline, createdAt }: YesTokenChartProps) {
  const [timeframe, setTimeframe] = useState<"1H" | "1D" | "1W" | "1M" | "ALL">("ALL")

  const yesNum = Number(yesSupply)
  const noNum = Number(noSupply)
  const escrowNum = Number(escrow)
  const created = createdAt || deadline - 30 * 24 * 60 * 60

  const currentPrice = calculateYesPrice(yesNum, noNum)
  const impliedProbability = (currentPrice * 100).toFixed(1)

  const priceData = useMemo(
    () => generatePriceHistory(yesNum, noNum, escrowNum, deadline, created),
    [yesNum, noNum, escrowNum, deadline, created],
  )

  const filteredData = useMemo(() => {
    const now = Date.now() / 1000
    const cutoffs: Record<string, number> = {
      "1H": now - 3600,
      "1D": now - 86400,
      "1W": now - 604800,
      "1M": now - 2592000,
      ALL: 0,
    }
    const cutoff = cutoffs[timeframe]
    return priceData.filter((d) => d.timestamp >= cutoff)
  }, [priceData, timeframe])

  const firstPrice = filteredData[0]?.close || 0.5
  const priceChange = currentPrice - firstPrice
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : "0.00"
  const isPositive = priceChange >= 0

  // Price impact calculation for next 0.1 ETH purchase
  const nextBuyAmount = 0.1
  const newYesSupply = yesNum + nextBuyAmount
  const newNoSupply = noNum + nextBuyAmount
  const nextPrice = calculateYesPrice(newYesSupply, newNoSupply)
  const priceImpact = currentPrice > 0 ? (((nextPrice - currentPrice) / currentPrice) * 100).toFixed(2) : "0.00"

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              YES Token Price
              <Badge variant="outline" className="text-xs font-normal">
                CDS #{marketId}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Implied credit event probability</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${currentPrice.toFixed(4)}</div>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? "+" : ""}
              {priceChangePercent}%
            </div>
          </div>
        </div>
        <div className="flex gap-1 mt-3">
          {(["1H", "1D", "1W", "1M", "ALL"] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              className={`h-7 px-3 text-xs ${
                timeframe === tf ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 rounded-lg bg-secondary/30">
          <div>
            <div className="text-xs text-muted-foreground">Event Probability</div>
            <div className="text-lg font-semibold text-primary">{impliedProbability}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Period High</div>
            <div className="text-lg font-semibold text-success">
              ${Math.max(...filteredData.map((d) => d.high)).toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Period Low</div>
            <div className="text-lg font-semibold text-destructive">
              ${Math.min(...filteredData.map((d) => d.low)).toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              Price Impact
              <Info className="w-3 h-3" />
            </div>
            <div className="text-lg font-semibold">+{priceImpact}%</div>
            <div className="text-[10px] text-muted-foreground">per 0.1 SEP</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`gradient-${marketId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[
                  (dataMin: number) => Math.max(0, Math.floor((dataMin - 0.1) * 10) / 10),
                  (dataMax: number) => Math.min(1, Math.ceil((dataMax + 0.1) * 10) / 10),
                ]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickFormatter={(v) => `$${v.toFixed(2)}`}
                width={45}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                      <div className="text-xs text-muted-foreground mb-2">{data.date}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-mono font-semibold">${data.close.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">YES Supply</span>
                          <span className="font-mono text-success">{data.yesSupply.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">NO Supply</span>
                          <span className="font-mono text-destructive">{data.noSupply.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <ReferenceLine y={0.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.3} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                fill={`url(#gradient-${marketId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Pricing Model:</span> YES token price = YES / (YES + NO).
                Higher demand for protection increases the price, reflecting higher perceived credit risk.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="text-xs text-muted-foreground">Total Volume</div>
              <div className="font-semibold">{escrowNum.toFixed(4)} SEP</div>
            </div>
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="text-xs text-muted-foreground">YES Supply</div>
              <div className="font-semibold text-success">{yesNum.toFixed(4)}</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-xs text-muted-foreground">NO Supply</div>
              <div className="font-semibold text-destructive">{noNum.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
