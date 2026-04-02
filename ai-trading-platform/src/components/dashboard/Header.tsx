'use client'
import { useState } from 'react'
import { useTradingStore } from '@/lib/store'
import {
  Zap, AlertTriangle, Bell, Moon, Sun, Activity,
  Shield, ChevronDown, RefreshCw, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import Link from 'next/link'

export function Header() {
  const {
    mode, setMode, killSwitch, activateKillSwitch, deactivateKillSwitch,
    wallet, alerts, darkMode, toggleDarkMode, agents, sentiment
  } = useTradingStore()

  const [showAlerts, setShowAlerts] = useState(false)
  const unreadAlerts = alerts.filter(a => !a.read).length
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'analyzing').length

  const handleKillSwitch = () => {
    if (killSwitch) {
      deactivateKillSwitch()
      toast.success('Trading resumed — all agents active')
    } else {
      activateKillSwitch()
      toast.error('⚡ KILL SWITCH ACTIVATED — All trading halted')
    }
  }

  const pnl = wallet.totalPnL
  const pnlPercent = wallet.startingBalance > 0
    ? ((pnl / wallet.startingBalance) * 100).toFixed(2)
    : '0.00'

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-surface flex-shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="w-5 h-5 text-terminal-accent" />
            <div className="absolute inset-0 w-5 h-5 text-terminal-accent opacity-50 blur-sm">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-wider group-hover:text-terminal-accent transition-colors">
            NEXUS<span className="text-terminal-accent">TRADER</span>
          </span>
        </Link>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 ml-4 bg-terminal-bg rounded-full p-0.5 border border-terminal-border">
          <button
            onClick={() => setMode('demo')}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all',
              mode === 'demo'
                ? 'bg-terminal-accent text-terminal-bg'
                : 'text-terminal-dim hover:text-terminal-text'
            )}
          >
            DEMO
          </button>
          <button
            onClick={() => {
              setMode('live')
              toast('⚠️ Switched to LIVE mode — Real money at risk', { icon: '⚠️' })
            }}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all',
              mode === 'live'
                ? 'bg-terminal-red text-white'
                : 'text-terminal-dim hover:text-terminal-text'
            )}
          >
            LIVE
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-terminal-green live-indicator" />
          <span className="text-xs font-mono text-terminal-dim">LIVE DATA</span>
        </div>
      </div>

      {/* Center — P&L summary */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider">Balance</div>
          <div className="font-mono font-bold text-terminal-text">
            ${wallet.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider">Total P&L</div>
          <div className={clsx('font-mono font-bold', pnl >= 0 ? 'text-terminal-green glow-green' : 'text-terminal-red glow-red')}>
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider">Win Rate</div>
          <div className={clsx('font-mono font-bold', wallet.winRate >= 65 ? 'text-terminal-gold' : wallet.winRate >= 55 ? 'text-terminal-green' : wallet.winRate >= 40 ? 'text-yellow-400' : 'text-terminal-red')}>
            {wallet.winRate.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider">Agents</div>
          <div className="font-mono font-bold text-terminal-accent">
            {activeAgents}/{agents.length}
          </div>
        </div>
        {sentiment && (
          <div className="text-center">
            <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider">Fear/Greed</div>
            <div className={clsx('font-mono font-bold', sentiment.fearGreedIndex > 60 ? 'text-terminal-red' : sentiment.fearGreedIndex < 40 ? 'text-terminal-green' : 'text-yellow-400')}>
              {sentiment.fearGreedIndex} · {sentiment.fearGreedLabel}
            </div>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Kill Switch */}
        <button
          onClick={handleKillSwitch}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all border',
            killSwitch
              ? 'bg-terminal-red bg-opacity-20 border-terminal-red text-terminal-red kill-switch-active animate-pulse'
              : 'border-terminal-border text-terminal-dim hover:border-terminal-red hover:text-terminal-red'
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          {killSwitch ? 'RESUME' : 'KILL'}
        </button>

        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-1.5 rounded border border-terminal-border text-terminal-dim hover:text-terminal-accent hover:border-terminal-accent transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-terminal-red rounded-full text-white text-xs flex items-center justify-center font-mono">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-8 w-80 panel z-50 max-h-96 overflow-y-auto shadow-2xl"
              >
                <div className="panel-header">
                  <span className="panel-title">Alerts</span>
                  <button className="text-xs text-terminal-dim hover:text-terminal-accent font-mono" onClick={() => setShowAlerts(false)}>Close</button>
                </div>
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-terminal-dim font-mono text-xs">No alerts</div>
                ) : (
                  alerts.slice(0, 20).map(alert => (
                    <div key={alert.id} className={clsx(
                      'px-3 py-2 border-b border-terminal-border hover:bg-terminal-muted transition-colors',
                      !alert.read && 'bg-terminal-muted bg-opacity-50'
                    )}>
                      <div className="flex items-start gap-2">
                        <div className={clsx('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0',
                          alert.severity === 'critical' ? 'bg-terminal-red' :
                          alert.severity === 'warning' ? 'bg-yellow-400' : 'bg-terminal-accent'
                        )} />
                        <div>
                          <div className="text-xs font-mono text-terminal-text">{alert.title}</div>
                          <div className="text-xs text-terminal-dim">{alert.message}</div>
                          <div className="text-xs text-terminal-dim font-mono mt-0.5">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-terminal-border text-terminal-dim hover:border-terminal-accent hover:text-terminal-accent transition-all font-mono text-xs"
        >
          <Settings className="w-3.5 h-3.5" />
          ADMIN
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded border border-terminal-border text-terminal-dim hover:text-terminal-accent hover:border-terminal-accent transition-all"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
