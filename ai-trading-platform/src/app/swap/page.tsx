'use client'
import { useState } from 'react'
import { useTradingStore } from '@/lib/store'
import { Header } from '@/components/dashboard/Header'
import { ArrowUpDown, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import type { Trade } from '@/types'
import Link from 'next/link'

const ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, assetClass: 'stock' as const },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, assetClass: 'stock' as const },
  { symbol: 'BTC', name: 'Bitcoin', price: 67842.50, assetClass: 'crypto' as const },
  { symbol: 'ETH', name: 'Ethereum', price: 3524.80, assetClass: 'crypto' as const },
  { symbol: 'SOL', name: 'Solana', price: 162.40, assetClass: 'crypto' as const },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 524.80, assetClass: 'etf' as const },
  { symbol: 'USD', name: 'US Dollar', price: 1, assetClass: 'forex' as const },
]

export default function SwapPage() {
  const { wallet, quotes, addTrade } = useTradingStore()
  const [fromAsset, setFromAsset] = useState(ASSETS[0])
  const [toAsset, setToAsset] = useState(ASSETS[2])
  const [fromAmount, setFromAmount] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const fromPrice = quotes[fromAsset.symbol]?.price || fromAsset.price
  const toPrice = quotes[toAsset.symbol]?.price || toAsset.price

  const toAmount = fromAmount ? (parseFloat(fromAmount) * fromPrice / toPrice) : 0
  const exchangeRate = fromPrice / toPrice
  const priceImpact = parseFloat(fromAmount || '0') > 1000 ? 0.08 : 0.02
  const platformFee = parseFloat(fromAmount || '0') * fromPrice * 0.001
  const networkFee = fromAsset.assetClass === 'crypto' || toAsset.assetClass === 'crypto' ? 2.5 : 0
  const totalCost = platformFee + networkFee
  const slippage = 0.05

  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Enter an amount')
      return
    }
    if (parseFloat(fromAmount) * fromPrice > wallet.currentBalance) {
      toast.error('Insufficient balance')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmSwap = async () => {
    setIsExecuting(true)
    try {
      await new Promise(r => setTimeout(r, 1500)) // Simulate execution

      const trade: Trade = {
        id: uuidv4(),
        symbol: `${fromAsset.symbol}→${toAsset.symbol}`,
        name: `Swap ${fromAsset.symbol} to ${toAsset.symbol}`,
        assetClass: fromAsset.assetClass,
        side: 'sell',
        orderType: 'market',
        quantity: parseFloat(fromAmount),
        entryPrice: fromPrice,
        fees: totalCost,
        spread: priceImpact * fromPrice * parseFloat(fromAmount),
        slippage: slippage * fromPrice * parseFloat(fromAmount) / 100,
        status: 'filled',
        agentId: 'manual',
        reasoning: `Swap ${fromAmount} ${fromAsset.symbol} → ${toAmount.toFixed(6)} ${toAsset.symbol}`,
        dataSources: ['Swap Router', 'Best Route Finder'],
        confidence: 100,
        openedAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
      }

      addTrade(trade)
      toast.success(`Swapped ${fromAmount} ${fromAsset.symbol} → ${toAmount.toFixed(6)} ${toAsset.symbol}`)
      setShowConfirm(false)
      setFromAmount('')
    } catch (e: any) {
      toast.error('Swap failed: ' + e.message)
    } finally {
      setIsExecuting(false)
    }
  }

  const swapAssets = () => {
    const temp = fromAsset
    setFromAsset(toAsset)
    setToAsset(temp)
    setFromAmount('')
  }

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard" className="text-xs font-mono text-terminal-dim hover:text-terminal-accent">← Dashboard</Link>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Asset Swap</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-terminal-accent" />
                <span className="text-xs font-mono text-terminal-accent">Best Route</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* From */}
              <div className="bg-terminal-bg rounded-lg p-3">
                <div className="flex justify-between text-xs font-mono text-terminal-dim mb-2">
                  <span>From</span>
                  <span>Balance: ${wallet.currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={fromAsset.symbol}
                    onChange={e => {
                      const a = ASSETS.find(a => a.symbol === e.target.value)!
                      setFromAsset(a)
                      setFromAmount('')
                    }}
                    className="input-terminal text-sm font-bold flex-shrink-0"
                  >
                    {ASSETS.filter(a => a.symbol !== toAsset.symbol).map(a => (
                      <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-right text-xl font-mono font-bold text-terminal-text focus:outline-none"
                  />
                </div>
                <div className="text-xs text-terminal-dim font-mono mt-1 text-right">
                  ≈ ${(parseFloat(fromAmount || '0') * fromPrice).toFixed(2)} USD
                </div>
              </div>

              {/* Swap button */}
              <div className="flex justify-center">
                <button
                  onClick={swapAssets}
                  className="p-2 rounded-full border border-terminal-border hover:border-terminal-accent text-terminal-dim hover:text-terminal-accent transition-all"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* To */}
              <div className="bg-terminal-bg rounded-lg p-3">
                <div className="flex justify-between text-xs font-mono text-terminal-dim mb-2">
                  <span>To (estimated)</span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={toAsset.symbol}
                    onChange={e => {
                      const a = ASSETS.find(a => a.symbol === e.target.value)!
                      setToAsset(a)
                    }}
                    className="input-terminal text-sm font-bold flex-shrink-0"
                  >
                    {ASSETS.filter(a => a.symbol !== fromAsset.symbol).map(a => (
                      <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                    ))}
                  </select>
                  <div className="flex-1 text-right text-xl font-mono font-bold text-terminal-text">
                    {fromAmount ? toAmount.toFixed(6) : '0.00'}
                  </div>
                </div>
                <div className="text-xs text-terminal-dim font-mono mt-1 text-right">
                  ≈ ${(toAmount * toPrice).toFixed(2)} USD
                </div>
              </div>

              {/* Route info */}
              {fromAmount && parseFloat(fromAmount) > 0 && (
                <div className="bg-terminal-muted rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-terminal-dim">Exchange Rate</span>
                    <span className="text-terminal-text">1 {fromAsset.symbol} = {exchangeRate.toFixed(6)} {toAsset.symbol}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-terminal-dim">Price Impact</span>
                    <span className={priceImpact > 0.05 ? 'text-terminal-red' : 'text-terminal-green'}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-terminal-dim">Slippage</span>
                    <span className="text-terminal-text">{slippage}%</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-terminal-dim">Platform Fee (0.1%)</span>
                    <span className="text-terminal-red">${platformFee.toFixed(4)}</span>
                  </div>
                  {networkFee > 0 && (
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-terminal-dim">Network Fee</span>
                      <span className="text-terminal-red">${networkFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-terminal-border pt-2 flex justify-between text-xs font-mono font-bold">
                    <span className="text-terminal-dim">Total Cost</span>
                    <span className="text-terminal-red">${totalCost.toFixed(4)}</span>
                  </div>
                  {/* Best route */}
                  <div className="flex items-center gap-1 pt-1">
                    <CheckCircle className="w-3 h-3 text-terminal-green" />
                    <span className="text-xs font-mono text-terminal-green">
                      Best route: {fromAsset.symbol} → {toAsset.assetClass === 'crypto' ? 'USDT → ' : ''}{toAsset.symbol} via NexusSwap
                    </span>
                  </div>
                </div>
              )}

              {/* Warning */}
              {priceImpact > 0.05 && fromAmount && (
                <div className="flex items-start gap-2 bg-yellow-400 bg-opacity-10 border border-yellow-400 border-opacity-30 rounded p-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-mono text-yellow-400">High price impact ({priceImpact.toFixed(2)}%). Consider splitting into smaller orders.</span>
                </div>
              )}

              <button
                onClick={handleSwap}
                disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                className="w-full btn-primary py-3 text-sm disabled:opacity-50"
              >
                Review Swap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="panel w-full max-w-sm">
            <div className="panel-header">
              <span className="panel-title">Confirm Swap</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-terminal-bg rounded-lg p-3 text-center">
                <div className="text-2xl font-mono font-bold text-terminal-text">{fromAmount} {fromAsset.symbol}</div>
                <ArrowUpDown className="w-4 h-4 text-terminal-dim mx-auto my-2" />
                <div className="text-2xl font-mono font-bold text-terminal-accent">{toAmount.toFixed(6)} {toAsset.symbol}</div>
              </div>
              {[
                { label: 'Platform Fee', value: `$${platformFee.toFixed(4)}` },
                { label: 'Network Fee', value: networkFee > 0 ? `$${networkFee.toFixed(2)}` : 'None' },
                { label: 'Price Impact', value: `${priceImpact.toFixed(2)}%` },
                { label: 'Net Received', value: `${toAmount.toFixed(6)} ${toAsset.symbol}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-xs font-mono">
                  <span className="text-terminal-dim">{row.label}</span>
                  <span className="text-terminal-text">{row.value}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 btn-ghost">Cancel</button>
                <button onClick={handleConfirmSwap} disabled={isExecuting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {isExecuting ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : null}
                  {isExecuting ? 'Swapping...' : 'Confirm Swap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
