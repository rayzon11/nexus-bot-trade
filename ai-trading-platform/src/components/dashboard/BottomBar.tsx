'use client'
import { useState } from 'react'
import { useTradingStore } from '@/lib/store'
import clsx from 'clsx'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export function BottomBar() {
  const { wallet, trades, alerts, closePosition } = useTradingStore()
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'alerts'>('positions')

  const recentTrades = trades.slice(0, 50)
  const unreadAlerts = alerts.filter(a => !a.read && a.severity !== 'info')

  return (
    <div className="bg-terminal-surface" style={{ height: '180px' }}>
      {/* Tabs */}
      <div className="flex items-center border-b border-terminal-border px-2">
        {[
          { key: 'positions', label: `Positions (${wallet.positions.length})` },
          { key: 'orders', label: `Order History (${recentTrades.length})` },
          { key: 'alerts', label: `Alerts ${unreadAlerts.length > 0 ? `(${unreadAlerts.length})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={clsx(
              'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors border-b -mb-px',
              activeTab === key
                ? 'text-terminal-accent border-terminal-accent'
                : 'text-terminal-dim border-transparent hover:text-terminal-text'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-full pb-8">
        {activeTab === 'positions' && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-terminal-border">
                {['Symbol', 'Side', 'Qty', 'Entry', 'Current', 'P&L', 'P&L%', 'Agent', 'Opened', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 py-1 text-xs font-mono text-terminal-dim uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wallet.positions.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-4 text-xs font-mono text-terminal-dim text-center">No open positions</td></tr>
              ) : (
                wallet.positions.map(pos => (
                  <tr key={pos.id} className="border-b border-terminal-border border-opacity-30 hover:bg-terminal-muted transition-colors">
                    <td className="px-3 py-1.5 text-xs font-mono font-bold text-terminal-text">{pos.symbol}</td>
                    <td className={clsx('px-3 py-1.5 text-xs font-mono font-bold', pos.side === 'long' ? 'text-terminal-green' : 'text-terminal-red')}>
                      {pos.side.toUpperCase()}
                    </td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-text">{pos.quantity}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-text">${pos.entryPrice.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-text">${pos.currentPrice.toFixed(2)}</td>
                    <td className={clsx('px-3 py-1.5 text-xs font-mono font-bold', pos.unrealizedPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                      {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                    </td>
                    <td className={clsx('px-3 py-1.5 text-xs font-mono', pos.unrealizedPnLPercent >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                      {pos.unrealizedPnLPercent >= 0 ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                    </td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-accent uppercase">{pos.agentId}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-dim">
                      {new Date(pos.openedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-1.5">
                      <button
                        onClick={() => {
                          closePosition(pos.id, pos.currentPrice)
                          toast.success(`Closed ${pos.symbol} position`)
                        }}
                        className="flex items-center gap-1 text-xs font-mono text-terminal-red hover:text-white border border-terminal-red hover:bg-terminal-red px-1.5 py-0.5 rounded transition-all"
                      >
                        <X className="w-3 h-3" /> Close
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-terminal-border">
                {['Time', 'Symbol', 'Side', 'Type', 'Qty', 'Price', 'P&L', 'Fees', 'Agent', 'Status', 'Confidence'].map(h => (
                  <th key={h} className="text-left px-3 py-1 text-xs font-mono text-terminal-dim uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrades.length === 0 ? (
                <tr><td colSpan={11} className="px-3 py-4 text-xs font-mono text-terminal-dim text-center">No trades yet</td></tr>
              ) : (
                recentTrades.map(trade => (
                  <tr key={trade.id} className="border-b border-terminal-border border-opacity-30 hover:bg-terminal-muted transition-colors">
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-dim">
                      {new Date(trade.openedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-1.5 text-xs font-mono font-bold text-terminal-text">{trade.symbol}</td>
                    <td className={clsx('px-3 py-1.5 text-xs font-mono font-bold', trade.side === 'buy' ? 'text-terminal-green' : 'text-terminal-red')}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-dim uppercase">{trade.orderType}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-text">{trade.quantity}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-text">${trade.entryPrice.toFixed(2)}</td>
                    <td className={clsx('px-3 py-1.5 text-xs font-mono font-bold',
                      trade.pnl === undefined ? 'text-terminal-dim' :
                      trade.pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                    )}>
                      {trade.pnl !== undefined ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-red">${trade.fees.toFixed(4)}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-accent uppercase">{trade.agentId}</td>
                    <td className="px-3 py-1.5">
                      <span className={clsx('badge',
                        trade.status === 'filled' ? 'badge-bullish' :
                        trade.status === 'cancelled' ? 'badge-bearish' : 'badge-neutral'
                      )}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-xs font-mono text-terminal-dim">{trade.confidence}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'alerts' && (
          <div>
            {alerts.length === 0 ? (
              <div className="px-3 py-4 text-xs font-mono text-terminal-dim text-center">No alerts</div>
            ) : (
              alerts.slice(0, 30).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 px-3 py-2 border-b border-terminal-border border-opacity-30 hover:bg-terminal-muted transition-colors">
                  <div className={clsx('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0',
                    alert.severity === 'critical' ? 'bg-terminal-red' :
                    alert.severity === 'warning' ? 'bg-yellow-400' : 'bg-terminal-accent'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-terminal-text">{alert.title}</span>
                      <span className={clsx('badge text-xs',
                        alert.type === 'agent' ? 'badge-bullish' :
                        alert.type === 'risk' ? 'badge-bearish' : 'badge-neutral'
                      )}>{alert.type}</span>
                    </div>
                    <div className="text-xs text-terminal-dim">{alert.message}</div>
                  </div>
                  <span className="text-xs font-mono text-terminal-dim flex-shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
