'use client'
import { useState, useEffect } from 'react'
import { useTradingStore } from '@/lib/store'
import { fetchNews } from '@/lib/api/market'
import type { NewsItem } from '@/types'
import clsx from 'clsx'
import { ExternalLink, BarChart2, Newspaper, Activity } from 'lucide-react'

function generateOrderBook(price: number) {
  const bids: [number, number][] = []
  const asks: [number, number][] = []
  for (let i = 0; i < 12; i++) {
    const bidPrice = price * (1 - (i + 1) * 0.0003)
    const askPrice = price * (1 + (i + 1) * 0.0003)
    const bidSize = Math.random() * 500 + 50
    const askSize = Math.random() * 500 + 50
    bids.push([parseFloat(bidPrice.toFixed(2)), parseFloat(bidSize.toFixed(0))])
    asks.push([parseFloat(askPrice.toFixed(2)), parseFloat(askSize.toFixed(0))])
  }
  return { bids, asks }
}

export function RightPanel() {
  const { selectedSymbol, quotes, sentiment } = useTradingStore()
  const [activeTab, setActiveTab] = useState<'orderbook' | 'news' | 'macro'>('orderbook')
  const [news, setNews] = useState<NewsItem[]>([])
  const quote = quotes[selectedSymbol]
  const { bids, asks } = quote ? generateOrderBook(quote.price) : { bids: [], asks: [] }

  useEffect(() => {
    fetchNews().then(setNews)
  }, [])

  const maxSize = Math.max(...bids.map(b => b[1]), ...asks.map(a => a[1]))

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-terminal-border flex-shrink-0">
        {[
          { key: 'orderbook', icon: BarChart2, label: 'Book' },
          { key: 'news', icon: Newspaper, label: 'News' },
          { key: 'macro', icon: Activity, label: 'Macro' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
              activeTab === key
                ? 'text-terminal-accent border-b border-terminal-accent -mb-px'
                : 'text-terminal-dim hover:text-terminal-text'
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'orderbook' && (
          <div>
            {/* Spread indicator */}
            {quote && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-terminal-muted border-b border-terminal-border">
                <span className="text-xs font-mono text-terminal-dim">Spread</span>
                <span className="text-xs font-mono text-terminal-accent">
                  ${(quote.price * 0.0006).toFixed(4)}
                </span>
                <span className="text-xs font-mono text-terminal-text font-bold">${quote.price.toFixed(2)}</span>
              </div>
            )}

            {/* Header */}
            <div className="grid grid-cols-3 px-3 py-1 border-b border-terminal-border">
              <span className="text-xs font-mono text-terminal-dim">Size</span>
              <span className="text-xs font-mono text-terminal-dim text-center">Price</span>
              <span className="text-xs font-mono text-terminal-dim text-right">Total</span>
            </div>

            {/* Asks (sells) — reversed so closest to spread is at bottom */}
            {asks.slice(0, 10).reverse().map(([price, size], i) => (
              <div key={i} className="relative grid grid-cols-3 px-3 py-0.5 hover:bg-terminal-muted transition-colors">
                <div
                  className="absolute right-0 top-0 h-full bg-terminal-red opacity-10"
                  style={{ width: `${(size / maxSize) * 100}%` }}
                />
                <span className="text-xs font-mono text-terminal-red relative z-10">{size.toFixed(0)}</span>
                <span className="text-xs font-mono text-terminal-red text-center relative z-10">{price.toFixed(2)}</span>
                <span className="text-xs font-mono text-terminal-dim text-right relative z-10">${(price * size).toFixed(0)}</span>
              </div>
            ))}

            {/* Bids (buys) */}
            {bids.slice(0, 10).map(([price, size], i) => (
              <div key={i} className="relative grid grid-cols-3 px-3 py-0.5 hover:bg-terminal-muted transition-colors">
                <div
                  className="absolute right-0 top-0 h-full bg-terminal-green opacity-10"
                  style={{ width: `${(size / maxSize) * 100}%` }}
                />
                <span className="text-xs font-mono text-terminal-green relative z-10">{size.toFixed(0)}</span>
                <span className="text-xs font-mono text-terminal-green text-center relative z-10">{price.toFixed(2)}</span>
                <span className="text-xs font-mono text-terminal-dim text-right relative z-10">${(price * size).toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'news' && (
          <div>
            {news.map(item => (
              <div key={item.id} className="px-3 py-2.5 border-b border-terminal-border hover:bg-terminal-muted transition-colors">
                <div className="flex items-start gap-2">
                  <span className={clsx(
                    'badge flex-shrink-0 mt-0.5',
                    item.sentiment === 'bullish' ? 'badge-bullish' :
                    item.sentiment === 'bearish' ? 'badge-bearish' : 'badge-neutral'
                  )}>
                    {item.sentiment === 'bullish' ? '▲' : item.sentiment === 'bearish' ? '▼' : '●'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-terminal-text leading-tight line-clamp-2">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-terminal-dim font-mono">{item.source}</span>
                      <span className="text-xs text-terminal-dim font-mono">
                        {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.url !== '#' && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-terminal-accent hover:text-terminal-text transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    {item.relatedSymbols.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.relatedSymbols.map(s => (
                          <span key={s} className="text-xs font-mono text-terminal-accent bg-terminal-accent bg-opacity-10 px-1 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'macro' && (
          <div className="p-3 space-y-3">
            {/* Fear & Greed */}
            {sentiment && (
              <div className="metric-card">
                <div className="metric-label mb-2">CNN Fear & Greed Index</div>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2540" strokeWidth="12" />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={sentiment.fearGreedIndex > 60 ? '#ff3d6b' : sentiment.fearGreedIndex < 40 ? '#00ff9f' : '#ffd700'}
                        strokeWidth="12"
                        strokeDasharray={`${sentiment.fearGreedIndex * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono font-bold text-sm text-terminal-text">{sentiment.fearGreedIndex}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-terminal-text">{sentiment.fearGreedLabel}</div>
                    <div className={clsx('text-xs font-mono font-semibold',
                      sentiment.marketTrend === 'bullish' ? 'text-terminal-green' :
                      sentiment.marketTrend === 'bearish' ? 'text-terminal-red' : 'text-yellow-400'
                    )}>
                      Market: {sentiment.marketTrend.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Macro indicators */}
            {[
              { label: 'Fed Funds Rate', value: '5.25%', change: 'Hold', color: 'text-yellow-400' },
              { label: 'US CPI (YoY)', value: '3.2%', change: '↓ from 3.4%', color: 'text-terminal-green' },
              { label: 'GDP Growth', value: '2.8%', change: '↓ from 3.4%', color: 'text-yellow-400' },
              { label: 'Unemployment', value: '3.9%', change: '↑ from 3.7%', color: 'text-terminal-red' },
              { label: '10Y Treasury', value: '4.42%', change: '↑ from 4.31%', color: 'text-terminal-red' },
              { label: 'VIX', value: '14.8', change: '↓ from 16.2', color: 'text-terminal-green' },
              { label: 'DXY (USD Index)', value: '104.3', change: '↑ 0.2%', color: 'text-terminal-red' },
              { label: 'Gold', value: '$2,328', change: '↑ 0.4%', color: 'text-terminal-gold' },
            ].map(ind => (
              <div key={ind.label} className="flex items-center justify-between py-1.5 border-b border-terminal-border border-opacity-50">
                <span className="text-xs font-mono text-terminal-dim">{ind.label}</span>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-terminal-text">{ind.value}</div>
                  <div className={clsx('text-xs font-mono', ind.color)}>{ind.change}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
