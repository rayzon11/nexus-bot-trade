'use client'
import { useState } from 'react'
import { TradingChart } from '@/components/charts/TradingChart'
import { useTradingStore } from '@/lib/store'
import { ShoppingCart, TrendingDown, Sliders } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import type { Trade, OrderType } from '@/types'

export function CenterPanel() {
  const { selectedSymbol, quotes, wallet, addTrade, addPosition, updateAgent, agents, mode } = useTradingStore()
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [quantity, setQuantity] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const quote = quotes[selectedSymbol]
  const price = quote?.price || 0
  const totalCost = price * parseFloat(quantity || '0')
  const fees = totalCost * 0.001
  const slippage = totalCost * 0.0003

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Enter a valid quantity')
      return
    }
    if (totalCost > wallet.currentBalance) {
      toast.error('Insufficient balance')
      return
    }

    setIsSubmitting(true)
    try {
      const executionPrice = price * (orderSide === 'buy' ? 1.0003 : 0.9997)

      const trade: Trade = {
        id: uuidv4(),
        symbol: selectedSymbol,
        name: selectedSymbol,
        assetClass: quote?.assetClass || 'stock',
        side: orderSide,
        orderType,
        quantity: parseFloat(quantity),
        entryPrice: executionPrice,
        fees,
        spread: price * 0.0002 * parseFloat(quantity),
        slippage,
        status: 'filled',
        agentId: 'manual',
        reasoning: 'Manual trade by admin',
        dataSources: ['Live Market Data'],
        confidence: 100,
        openedAt: new Date().toISOString(),
      }

      addTrade(trade)

      if (orderSide === 'buy') {
        addPosition({
          id: uuidv4(),
          symbol: selectedSymbol,
          name: selectedSymbol,
          assetClass: quote?.assetClass || 'stock',
          side: 'long',
          quantity: parseFloat(quantity),
          entryPrice: executionPrice,
          currentPrice: price,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          openedAt: new Date().toISOString(),
          agentId: 'manual',
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        })
      }

      toast.success(`${orderSide.toUpperCase()} ${quantity} ${selectedSymbol} @ $${executionPrice.toFixed(2)}`)
      setQuantity('')
      setStopLoss('')
      setTakeProfit('')
    } catch (e: any) {
      toast.error(e.message || 'Order failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chart — takes most space */}
      <div className="flex-1 min-h-0 panel rounded-none border-0 border-b border-terminal-border">
        <TradingChart />
      </div>

      {/* Order Entry Panel */}
      <div className="flex-shrink-0 border-t border-terminal-border bg-terminal-surface">
        <div className="flex items-stretch">
          {/* Buy/Sell toggle */}
          <div className="flex flex-col w-16 flex-shrink-0 border-r border-terminal-border">
            <button
              onClick={() => setOrderSide('buy')}
              className={clsx(
                'flex-1 flex items-center justify-center font-mono font-bold text-xs transition-all',
                orderSide === 'buy'
                  ? 'bg-terminal-green bg-opacity-20 text-terminal-green border-l-2 border-terminal-green'
                  : 'text-terminal-dim hover:text-terminal-green'
              )}
            >
              BUY
            </button>
            <div className="h-px bg-terminal-border" />
            <button
              onClick={() => setOrderSide('sell')}
              className={clsx(
                'flex-1 flex items-center justify-center font-mono font-bold text-xs transition-all',
                orderSide === 'sell'
                  ? 'bg-terminal-red bg-opacity-20 text-terminal-red border-l-2 border-terminal-red'
                  : 'text-terminal-dim hover:text-terminal-red'
              )}
            >
              SELL
            </button>
          </div>

          {/* Order form */}
          <div className="flex-1 p-2 flex items-center gap-3 flex-wrap">
            {/* Order type */}
            <div>
              <div className="text-xs text-terminal-dim font-mono mb-1">Order Type</div>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as OrderType)}
                className="input-terminal text-xs"
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop-loss">Stop Loss</option>
                <option value="take-profit">Take Profit</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <div className="text-xs text-terminal-dim font-mono mb-1">Quantity</div>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0.00"
                className="input-terminal text-xs w-24"
                min="0"
                step="0.01"
              />
            </div>

            {/* Limit price (if limit order) */}
            {orderType === 'limit' && (
              <div>
                <div className="text-xs text-terminal-dim font-mono mb-1">Limit Price</div>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={e => setLimitPrice(e.target.value)}
                  placeholder={price.toFixed(2)}
                  className="input-terminal text-xs w-24"
                />
              </div>
            )}

            {/* Stop Loss */}
            <div>
              <div className="text-xs text-terminal-dim font-mono mb-1">Stop Loss</div>
              <input
                type="number"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="input-terminal text-xs w-24"
              />
            </div>

            {/* Take Profit */}
            <div>
              <div className="text-xs text-terminal-dim font-mono mb-1">Take Profit</div>
              <input
                type="number"
                value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="input-terminal text-xs w-24"
              />
            </div>

            {/* Cost summary */}
            <div className="flex-1">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-terminal-dim">Price: </span>
                  <span className="text-terminal-text">${price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-terminal-dim">Total: </span>
                  <span className="text-terminal-text">${totalCost.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-terminal-dim">Fees: </span>
                  <span className="text-terminal-red">${fees.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-terminal-dim">Balance: </span>
                  <span className={clsx(totalCost > wallet.currentBalance ? 'text-terminal-red' : 'text-terminal-green')}>
                    ${wallet.currentBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !quantity}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50',
                orderSide === 'buy'
                  ? 'bg-terminal-green text-terminal-bg hover:bg-opacity-90'
                  : 'bg-terminal-red text-white hover:bg-opacity-90'
              )}
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : orderSide === 'buy' ? (
                <ShoppingCart className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isSubmitting ? 'Executing...' : `Place ${orderSide.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
