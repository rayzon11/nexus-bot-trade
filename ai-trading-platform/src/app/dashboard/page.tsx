'use client'
import { useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { LeftPanel } from '@/components/dashboard/LeftPanel'
import { CenterPanel } from '@/components/dashboard/CenterPanel'
import { RightPanel } from '@/components/dashboard/RightPanel'
import { BottomBar } from '@/components/dashboard/BottomBar'
import { AgentPanel } from '@/components/agents/AgentPanel'
import { useTradingStore } from '@/lib/store'
import { MOCK_QUOTES, simulateQuoteUpdate } from '@/lib/api/market'
import { fetchFearGreedIndex } from '@/lib/api/market'

export default function DashboardPage() {
  const { updateQuote, setSentiment, quotes, killSwitch } = useTradingStore()

  // Initialize quotes
  useEffect(() => {
    MOCK_QUOTES.forEach(q => updateQuote(q))
  }, [])

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (killSwitch) return
      Object.values(quotes).forEach(quote => {
        updateQuote(simulateQuoteUpdate(quote))
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [quotes, killSwitch])

  // Fetch sentiment
  useEffect(() => {
    fetchFearGreedIndex().then(setSentiment)
    const interval = setInterval(() => {
      fetchFearGreedIndex().then(setSentiment)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-terminal-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 flex-shrink-0 border-r border-terminal-border overflow-y-auto">
          <LeftPanel />
        </div>

        {/* Center + Right */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <CenterPanel />
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-72 flex-shrink-0 border-l border-terminal-border overflow-y-auto">
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-terminal-border flex-shrink-0">
        <BottomBar />
      </div>
    </div>
  )
}
