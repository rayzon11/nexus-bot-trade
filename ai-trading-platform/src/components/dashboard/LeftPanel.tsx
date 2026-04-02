'use client'
import { useState } from 'react'
import { useTradingStore } from '@/lib/store'
import { Search, Plus, X, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import clsx from 'clsx'
import { MOCK_QUOTES } from '@/lib/api/market'

export function LeftPanel() {
  const { watchlist, quotes, addToWatchlist, removeFromWatchlist, setSelectedSymbol, selectedSymbol, agents, wallet } = useTradingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio' | 'agents'>('watchlist')

  const searchResults = searchQuery.length > 0
    ? MOCK_QUOTES.filter(q =>
        q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-terminal-border">
        {(['watchlist', 'portfolio', 'agents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
              activeTab === tab
                ? 'text-terminal-accent border-b border-terminal-accent -mb-px'
                : 'text-terminal-dim hover:text-terminal-text'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'watchlist' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-terminal-border relative">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-dim" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search symbol..."
                className="w-full input-terminal pl-6 text-xs"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute left-2 right-2 top-full mt-1 bg-terminal-surface border border-terminal-border rounded shadow-xl z-10">
                {searchResults.map(q => (
                  <button
                    key={q.symbol}
                    onClick={() => {
                      addToWatchlist(q.symbol)
                      setSearchQuery('')
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-terminal-muted transition-colors"
                  >
                    <div>
                      <div className="text-xs font-mono font-semibold text-terminal-text">{q.symbol}</div>
                      <div className="text-xs text-terminal-dim">{q.name}</div>
                    </div>
                    <Plus className="w-3 h-3 text-terminal-accent" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Watchlist items */}
          <div className="flex-1 overflow-y-auto">
            {watchlist.map(symbol => {
              const quote = quotes[symbol]
              if (!quote) return null
              const isPositive = quote.changePercent >= 0
              return (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 border-b border-terminal-border hover:bg-terminal-muted transition-colors text-left group',
                    selectedSymbol === symbol && 'bg-terminal-muted border-l-2 border-l-terminal-accent'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-terminal-text">{symbol}</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeFromWatchlist(symbol) }}
                        className="opacity-0 group-hover:opacity-100 text-terminal-dim hover:text-terminal-red transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-mono font-bold text-terminal-text">
                        ${quote.price < 10 ? quote.price.toFixed(4) : quote.price.toFixed(2)}
                      </span>
                      <span className={clsx('text-xs font-mono font-semibold flex items-center gap-0.5',
                        isPositive ? 'text-terminal-green' : 'text-terminal-red'
                      )}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="flex-1 overflow-y-auto">
          {/* Summary */}
          <div className="p-3 border-b border-terminal-border space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-mono text-terminal-dim">Balance</span>
              <span className="text-xs font-mono font-bold text-terminal-text">
                ${wallet.currentBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-mono text-terminal-dim">Unrealized P&L</span>
              <span className={clsx('text-xs font-mono font-bold', wallet.unrealizedPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                {wallet.unrealizedPnL >= 0 ? '+' : ''}${wallet.unrealizedPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-mono text-terminal-dim">Realized P&L</span>
              <span className={clsx('text-xs font-mono font-bold', wallet.realizedPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                {wallet.realizedPnL >= 0 ? '+' : ''}${wallet.realizedPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-mono text-terminal-dim">Open Positions</span>
              <span className="text-xs font-mono font-bold text-terminal-accent">{wallet.positions.length}</span>
            </div>
          </div>

          {wallet.positions.length === 0 ? (
            <div className="p-4 text-center text-terminal-dim font-mono text-xs">
              No open positions
            </div>
          ) : (
            wallet.positions.map(pos => {
              const isPositive = pos.unrealizedPnL >= 0
              return (
                <div key={pos.id} className="px-3 py-2 border-b border-terminal-border hover:bg-terminal-muted transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-semibold text-terminal-text">{pos.symbol}</div>
                      <div className="text-xs text-terminal-dim">{pos.side.toUpperCase()} · {pos.quantity} shares</div>
                    </div>
                    <div className="text-right">
                      <div className={clsx('text-xs font-mono font-bold', isPositive ? 'text-terminal-green' : 'text-terminal-red')}>
                        {isPositive ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                      </div>
                      <div className={clsx('text-xs font-mono', isPositive ? 'text-terminal-green' : 'text-terminal-red')}>
                        {isPositive ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-terminal-dim">Entry: ${pos.entryPrice.toFixed(2)}</span>
                    <span className="text-xs text-terminal-dim">Now: ${pos.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 border-b border-terminal-border">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-terminal-accent" />
              <span className="text-xs font-mono text-terminal-dim uppercase tracking-wider">Agent Feed</span>
            </div>
          </div>
          {agents.map(agent => (
            <div key={agent.id} className="px-3 py-2.5 border-b border-terminal-border hover:bg-terminal-muted transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0',
                  agent.status === 'active' ? 'bg-terminal-green live-indicator' :
                  agent.status === 'analyzing' ? 'bg-terminal-accent live-indicator' :
                  agent.status === 'waiting' ? 'bg-yellow-400' :
                  'bg-terminal-dim'
                )} />
                <span className="text-xs font-mono font-bold text-terminal-text">{agent.name}</span>
                <span className={clsx('ml-auto text-xs font-mono font-bold',
                  agent.todayPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red'
                )}>
                  {agent.todayPnL >= 0 ? '+' : ''}${agent.todayPnL.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-terminal-dim leading-relaxed pl-3">{agent.lastAction}</div>
              <div className="text-xs text-terminal-dim pl-3 mt-0.5 font-mono">
                {new Date(agent.lastActionTime).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
