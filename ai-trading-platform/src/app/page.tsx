'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Shield, BarChart2, Activity, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-terminal-bg grid-bg flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terminal-accent opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-terminal-purple opacity-5 rounded-full blur-3xl pointer-events-none" />

      {/* Ticker tape */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-terminal-surface border-b border-terminal-border overflow-hidden flex items-center">
        <div className="ticker-scroll flex items-center gap-8 text-xs font-mono">
          {[
            { sym: 'AAPL', price: '189.25', change: '+1.25%', color: 'text-terminal-green' },
            { sym: 'NVDA', price: '875.40', change: '-1.42%', color: 'text-terminal-red' },
            { sym: 'BTC', price: '67,842', change: '+1.87%', color: 'text-terminal-green' },
            { sym: 'ETH', price: '3,524', change: '-1.19%', color: 'text-terminal-red' },
            { sym: 'SPY', price: '524.80', change: '+0.81%', color: 'text-terminal-green' },
            { sym: 'TSLA', price: '248.50', change: '-3.23%', color: 'text-terminal-red' },
            { sym: 'MSFT', price: '415.80', change: '+1.27%', color: 'text-terminal-green' },
            { sym: 'META', price: '512.60', change: '+1.77%', color: 'text-terminal-green' },
            { sym: 'EUR/USD', price: '1.0842', change: '+0.11%', color: 'text-terminal-green' },
            { sym: 'GOLD', price: '2,328', change: '+0.4%', color: 'text-terminal-gold' },
          ].map(item => (
            <span key={item.sym} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-terminal-dim">{item.sym}</span>
              <span className="text-terminal-text">{item.price}</span>
              <span className={item.color}>{item.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <Zap className="w-10 h-10 text-terminal-accent" />
            <div className="absolute inset-0 text-terminal-accent opacity-50 blur-md">
              <Zap className="w-10 h-10" />
            </div>
          </div>
          <span className="font-display font-bold text-5xl text-white tracking-wider">
            NEXUS<span className="text-terminal-accent">TRADER</span>
          </span>
        </div>

        <div className="text-terminal-dim font-mono text-sm uppercase tracking-widest mb-4">
          Multi-Agent AI Trading Platform
        </div>

        <p className="text-terminal-text text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
          Four elite AI agents — JPMorgan-caliber analysts, BlackRock portfolio managers, 
          Renaissance quants, Goldman Sachs FX traders — working 24/7 on your capital.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: BarChart2, title: 'Pro Terminal', desc: 'TradingView charts, live order book, real-time P&L' },
            { icon: Activity, title: 'AI Agents', desc: '4 specialist agents with dedicated system prompts' },
            { icon: Shield, title: 'Risk Management', desc: 'Kill switch, stop-loss, position limits, daily caps' },
            { icon: TrendingUp, title: 'Demo Mode', desc: '$1,000 virtual capital with real market prices' },
            { icon: Users, title: 'Trading Floor', desc: 'Agent-to-agent collaboration and cross-asset signals' },
            { icon: Zap, title: 'Daily Reports', desc: 'End-of-day performance analysis and learning logs' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="panel p-4 text-left hover:border-terminal-accent transition-colors">
              <Icon className="w-5 h-5 text-terminal-accent mb-2" />
              <div className="font-mono font-bold text-terminal-text text-sm mb-1">{title}</div>
              <div className="text-xs text-terminal-dim">{desc}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-3 bg-terminal-accent text-terminal-bg font-display font-bold text-lg rounded hover:bg-opacity-90 transition-all uppercase tracking-wider"
          >
            <BarChart2 className="w-5 h-5" />
            Open Dashboard
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-8 py-3 border border-terminal-border text-terminal-text font-display font-bold text-lg rounded hover:border-terminal-accent hover:text-terminal-accent transition-all uppercase tracking-wider"
          >
            <Shield className="w-5 h-5" />
            Admin Panel
          </Link>
        </div>

        {/* Agents preview */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {[
            { name: 'APEX', specialty: 'Tech Equities', skill: 8, color: 'text-terminal-accent' },
            { name: 'NEXUS', specialty: 'Crypto', skill: 9, color: 'text-terminal-green' },
            { name: 'SIGMA', specialty: 'FX Macro', skill: 7, color: 'text-terminal-purple' },
            { name: 'QUANT', specialty: 'Stat Arb', skill: 10, color: 'text-terminal-gold' },
          ].map(agent => (
            <div key={agent.name} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-terminal-surface border border-terminal-border flex items-center justify-center font-display font-bold text-terminal-text text-sm">
                {agent.name[0]}
              </div>
              <span className={`text-xs font-mono font-bold ${agent.color}`}>{agent.name}</span>
              <span className="text-xs text-terminal-dim">{agent.specialty}</span>
              <div className="flex">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < agent.skill ? agent.color.replace('text-', 'bg-') : 'bg-terminal-border'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 text-xs font-mono text-terminal-dim"
      >
        Add your ANTHROPIC_API_KEY to .env.local to enable AI agent intelligence
      </motion.div>
    </div>
  )
}
