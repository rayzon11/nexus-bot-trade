'use client'
import { useState } from 'react'
import { useTradingStore } from '@/lib/store'
import { AgentPanel } from '@/components/agents/AgentPanel'
import { Header } from '@/components/dashboard/Header'
import {
  Settings, BarChart2, MessageSquare, FileText, RefreshCw,
  TrendingUp, Activity, Shield, Sliders, Download, Users
} from 'lucide-react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { generateDailyReport } from '@/lib/agents/engine'
import toast from 'react-hot-toast'
import type { Agent } from '@/types'

type AdminTab = 'agents' | 'chat' | 'controls' | 'reports' | 'demo'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('agents')
  const { agents, updateAgent, wallet, resetDemo, trades, dailyReports, addReport, mode } = useTradingStore()
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  const tabs = [
    { key: 'agents', icon: Activity, label: 'Agent Dashboard' },
    { key: 'chat', icon: MessageSquare, label: 'Agent Chat' },
    { key: 'controls', icon: Sliders, label: 'Controls' },
    { key: 'reports', icon: FileText, label: 'Reports' },
    { key: 'demo', icon: BarChart2, label: 'Demo Stats' },
  ]

  const handleGenerateReport = async (agent: Agent) => {
    setGeneratingReport(agent.id)
    try {
      const agentTrades = trades.filter(t => t.agentId === agent.id)
      const report = await generateDailyReport(agent, agentTrades, mode)
      addReport(report)
      toast.success(`${agent.name} report generated`)
    } catch (e: any) {
      toast.error(`Report generation failed: ${e.message}`)
    } finally {
      setGeneratingReport(null)
    }
  }

  const totalPnL = agents.reduce((sum, a) => sum + a.todayPnL, 0)
  const totalTrades = agents.reduce((sum, a) => sum + a.todayTrades, 0)
  const avgWinRate = agents.reduce((sum, a) => sum + a.allTimeWinRate, 0) / agents.length

  return (
    <div className="flex flex-col h-screen bg-terminal-bg">
      <Header />

      {/* Tabs */}
      <div className="flex items-center border-b border-terminal-border bg-terminal-surface px-4 gap-1">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as AdminTab)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b -mb-px',
              activeTab === key
                ? 'text-terminal-accent border-terminal-accent'
                : 'text-terminal-dim border-transparent hover:text-terminal-text'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'agents' && (
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Platform P&L Today', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red' },
                { label: 'Total Trades Today', value: totalTrades.toString(), color: 'text-terminal-accent' },
                { label: 'Avg Win Rate', value: `${avgWinRate.toFixed(1)}%`, color: avgWinRate >= 55 ? 'text-terminal-green' : 'text-yellow-400' },
                { label: 'Active Agents', value: `${agents.filter(a => a.status === 'active' || a.status === 'analyzing').length}/${agents.length}`, color: 'text-terminal-text' },
              ].map(card => (
                <div key={card.label} className="metric-card">
                  <div className="metric-label mb-1">{card.label}</div>
                  <div className={clsx('metric-value text-2xl', card.color)}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Agent cards */}
            <div className="grid grid-cols-2 gap-4">
              {agents.map(agent => (
                <motion.div
                  key={agent.id}
                  layout
                  className="panel"
                >
                  {/* Agent header */}
                  <div className="flex items-start gap-3 p-4 border-b border-terminal-border">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-terminal-muted flex items-center justify-center text-terminal-accent font-mono font-bold text-lg">
                        {agent.name[0]}
                      </div>
                      <div className={clsx('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-terminal-surface',
                        agent.status === 'active' ? 'bg-terminal-green' :
                        agent.status === 'analyzing' ? 'bg-terminal-accent' :
                        agent.status === 'waiting' ? 'bg-yellow-400' :
                        agent.status === 'paused' ? 'bg-terminal-dim' : 'bg-terminal-red'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-display font-bold text-terminal-text text-lg">{agent.name}</div>
                          <div className="text-xs text-terminal-dim">{agent.specialty}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xl text-terminal-accent">{agent.skillLevel}<span className="text-terminal-dim text-sm">/10</span></div>
                          <div className="text-xs text-terminal-dim font-mono uppercase">{agent.status}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 divide-x divide-terminal-border border-b border-terminal-border">
                    {[
                      { label: "Today P&L", value: `${agent.todayPnL >= 0 ? '+' : ''}$${agent.todayPnL.toFixed(2)}`, color: agent.todayPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red' },
                      { label: "Win Rate", value: `${agent.allTimeWinRate.toFixed(1)}%`, color: agent.allTimeWinRate >= 65 ? 'text-terminal-gold' : agent.allTimeWinRate >= 55 ? 'text-terminal-green' : 'text-terminal-red' },
                      { label: "Confidence", value: `${agent.confidence}%`, color: 'text-terminal-accent' },
                    ].map(stat => (
                      <div key={stat.label} className="p-3 text-center">
                        <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider">{stat.label}</div>
                        <div className={clsx('font-mono font-bold text-base mt-0.5', stat.color)}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Budget bar */}
                  <div className="px-4 py-3 border-b border-terminal-border">
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-terminal-dim">Daily Budget</span>
                      <span className="text-terminal-text">${agent.dailyBudgetUsed.toFixed(0)} / ${agent.dailyBudget}</span>
                    </div>
                    <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all',
                          (agent.dailyBudgetUsed / agent.dailyBudget) > 0.8 ? 'bg-terminal-red' :
                          (agent.dailyBudgetUsed / agent.dailyBudget) > 0.5 ? 'bg-yellow-400' : 'bg-terminal-green'
                        )}
                        style={{ width: `${Math.min(100, (agent.dailyBudgetUsed / agent.dailyBudget) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Last action */}
                  <div className="px-4 py-2 border-b border-terminal-border">
                    <div className="text-xs text-terminal-dim font-mono">{agent.lastAction}</div>
                    <div className="text-xs text-terminal-dim font-mono mt-0.5">
                      {new Date(agent.lastActionTime).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleGenerateReport(agent)}
                      disabled={generatingReport === agent.id}
                      className="btn-ghost flex items-center gap-1.5 text-xs"
                    >
                      {generatingReport === agent.id
                        ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : <FileText className="w-3 h-3" />}
                      Report
                    </button>

                    {/* Skill level adjuster */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateAgent(agent.id, { skillLevel: Math.max(1, agent.skillLevel - 1) })}
                        className="w-6 h-6 flex items-center justify-center text-terminal-dim hover:text-terminal-text border border-terminal-border rounded text-xs"
                      >-</button>
                      <span className="text-xs font-mono text-terminal-text w-8 text-center">Lv{agent.skillLevel}</span>
                      <button
                        onClick={() => updateAgent(agent.id, { skillLevel: Math.min(10, agent.skillLevel + 1) })}
                        className="w-6 h-6 flex items-center justify-center text-terminal-dim hover:text-terminal-text border border-terminal-border rounded text-xs"
                      >+</button>
                    </div>

                    {/* Risk tolerance */}
                    <select
                      value={agent.riskTolerance}
                      onChange={e => updateAgent(agent.id, { riskTolerance: e.target.value as any })}
                      className="input-terminal text-xs py-1"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full">
            <AgentPanel />
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <h2 className="font-display font-bold text-xl text-terminal-text">Platform Controls</h2>

            {agents.map(agent => (
              <div key={agent.id} className="panel">
                <div className="panel-header">
                  <span className="panel-title">{agent.name} — {agent.specialty}</span>
                  <span className={clsx('badge capitalize',
                    agent.status === 'active' ? 'badge-bullish' :
                    agent.status === 'paused' ? 'badge-bearish' : 'badge-neutral'
                  )}>{agent.status}</span>
                </div>

                <div className="p-4 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-terminal-dim mb-1">Daily Budget ($)</label>
                    <input
                      type="number"
                      value={agent.dailyBudget}
                      onChange={e => updateAgent(agent.id, { dailyBudget: parseFloat(e.target.value) })}
                      className="input-terminal w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-terminal-dim mb-1">Max Position Size ($)</label>
                    <input
                      type="number"
                      value={agent.maxPositionSize}
                      onChange={e => updateAgent(agent.id, { maxPositionSize: parseFloat(e.target.value) })}
                      className="input-terminal w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-terminal-dim mb-1">Max Trades/Day</label>
                    <input
                      type="number"
                      value={agent.maxTradesPerDay}
                      onChange={e => updateAgent(agent.id, { maxTradesPerDay: parseInt(e.target.value) })}
                      className="input-terminal w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-terminal-dim mb-1">Stop Loss (%)</label>
                    <input
                      type="number"
                      value={agent.stopLossThreshold}
                      onChange={e => updateAgent(agent.id, { stopLossThreshold: parseFloat(e.target.value) })}
                      className="input-terminal w-full"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-terminal-dim mb-1">Take Profit (%)</label>
                    <input
                      type="number"
                      value={agent.takeProfitTarget}
                      onChange={e => updateAgent(agent.id, { takeProfitTarget: parseFloat(e.target.value) })}
                      className="input-terminal w-full"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-terminal-dim mb-1">Risk Tolerance</label>
                    <select
                      value={agent.riskTolerance}
                      onChange={e => updateAgent(agent.id, { riskTolerance: e.target.value as any })}
                      className="input-terminal w-full"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-terminal-text">Daily Reports</h2>
              <button
                onClick={() => agents.forEach(a => handleGenerateReport(a))}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generate All Reports
              </button>
            </div>

            {dailyReports.length === 0 ? (
              <div className="panel p-8 text-center">
                <FileText className="w-12 h-12 text-terminal-dim mx-auto mb-3" />
                <div className="font-mono text-terminal-dim">No reports generated yet</div>
                <div className="text-xs text-terminal-dim mt-1">Click "Generate All Reports" or generate individual agent reports from the Agent Dashboard</div>
              </div>
            ) : (
              dailyReports.slice().reverse().map(report => (
                <div key={report.id} className="panel">
                  <div className="panel-header">
                    <div>
                      <span className="panel-title">{report.agentName} Daily Report</span>
                      <span className="text-xs font-mono text-terminal-dim ml-3">{report.date}</span>
                    </div>
                    <div className={clsx('font-mono font-bold text-sm', report.netPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                      {report.netPnL >= 0 ? '+' : ''}${report.netPnL.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {[
                        { label: 'Trades', value: report.totalTrades },
                        { label: 'Wins', value: report.wins, color: 'text-terminal-green' },
                        { label: 'Losses', value: report.losses, color: 'text-terminal-red' },
                        { label: 'Win Rate', value: `${report.totalTrades > 0 ? ((report.wins / report.totalTrades) * 100).toFixed(0) : 0}%` },
                      ].map(s => (
                        <div key={s.label} className="bg-terminal-bg rounded p-2 text-center">
                          <div className="text-xs font-mono text-terminal-dim">{s.label}</div>
                          <div className={clsx('font-mono font-bold text-lg', s.color || 'text-terminal-text')}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {report.learnings.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider mb-2">Key Learnings</div>
                        {report.learnings.map((l, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-terminal-text mb-1">
                            <span className="text-terminal-accent">{i + 1}.</span>
                            {l}
                          </div>
                        ))}
                      </div>
                    )}

                    {report.strategyAdjustments && (
                      <div className="bg-terminal-bg rounded p-3">
                        <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider mb-1">Strategy & Outlook</div>
                        <div className="text-xs text-terminal-text leading-relaxed whitespace-pre-wrap">{report.strategyAdjustments}</div>
                      </div>
                    )}

                    {report.adminRecommendation && (
                      <div className="mt-3 bg-terminal-accent bg-opacity-10 border border-terminal-accent border-opacity-30 rounded p-3">
                        <div className="text-xs font-mono text-terminal-accent uppercase tracking-wider mb-1">Recommendation to Admin</div>
                        <div className="text-xs text-terminal-text">{report.adminRecommendation}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <h2 className="font-display font-bold text-xl text-terminal-text">Demo Mode Stats</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="panel p-5">
                <div className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-4">Demo Wallet</div>
                {[
                  { label: 'Starting Balance', value: `$${wallet.startingBalance.toFixed(2)}`, color: 'text-terminal-text' },
                  { label: 'Current Balance', value: `$${wallet.currentBalance.toFixed(2)}`, color: 'text-terminal-text' },
                  { label: 'Unrealized P&L', value: `${wallet.unrealizedPnL >= 0 ? '+' : ''}$${wallet.unrealizedPnL.toFixed(2)}`, color: wallet.unrealizedPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red' },
                  { label: 'Realized P&L', value: `${wallet.realizedPnL >= 0 ? '+' : ''}$${wallet.realizedPnL.toFixed(2)}`, color: wallet.realizedPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red' },
                  { label: 'Win Rate', value: `${wallet.winRate.toFixed(1)}%`, color: wallet.winRate >= 65 ? 'text-terminal-gold' : wallet.winRate >= 55 ? 'text-terminal-green' : wallet.winRate >= 40 ? 'text-yellow-400' : 'text-terminal-red' },
                  { label: 'Total Trades', value: wallet.totalTrades.toString(), color: 'text-terminal-accent' },
                  { label: 'Wins / Losses', value: `${wallet.winningTrades} / ${wallet.losingTrades}`, color: 'text-terminal-text' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b border-terminal-border border-opacity-50">
                    <span className="text-xs font-mono text-terminal-dim">{row.label}</span>
                    <span className={clsx('text-xs font-mono font-bold', row.color)}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="panel p-5">
                <div className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-4">Projection Calculator</div>
                {wallet.totalTrades > 0 && (() => {
                  const dailyReturn = wallet.realizedPnL
                  const dailyPercent = (dailyReturn / wallet.startingBalance) * 100
                  const weeklyReturn = dailyReturn * 5
                  const monthlyReturn = dailyReturn * 22
                  return (
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-terminal-dim mb-3">
                        "If this were real money" projection based on today's performance:
                      </div>
                      {[
                        { period: 'Daily', value: dailyReturn, percent: dailyPercent },
                        { period: 'Weekly (5 days)', value: weeklyReturn, percent: dailyPercent * 5 },
                        { period: 'Monthly (22 days)', value: monthlyReturn, percent: dailyPercent * 22 },
                        { period: 'Annual', value: dailyReturn * 252, percent: dailyPercent * 252 },
                      ].map(p => (
                        <div key={p.period} className="bg-terminal-bg rounded p-3">
                          <div className="text-xs font-mono text-terminal-dim">{p.period}</div>
                          <div className={clsx('font-mono font-bold text-lg', p.value >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                            {p.value >= 0 ? '+' : ''}${p.value.toFixed(2)}
                          </div>
                          <div className={clsx('text-xs font-mono', p.percent >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                            {p.percent >= 0 ? '+' : ''}{p.percent.toFixed(2)}% return
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
                {wallet.totalTrades === 0 && (
                  <div className="text-xs text-terminal-dim text-center py-8">Make some trades to see projections</div>
                )}
              </div>
            </div>

            {/* Agent leaderboard by Sharpe ratio */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Agent Leaderboard — Sharpe Ratio</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-terminal-border">
                    {['Rank', 'Agent', 'Specialty', 'Sharpe Ratio', 'Win Rate', 'Today P&L', 'Skill Level'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-mono text-terminal-dim uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...agents].sort((a, b) => b.sharpeRatio - a.sharpeRatio).map((agent, i) => (
                    <tr key={agent.id} className="border-b border-terminal-border border-opacity-30 hover:bg-terminal-muted">
                      <td className="px-4 py-3 text-xs font-mono font-bold text-terminal-gold">#{i + 1}</td>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-terminal-text">{agent.name}</td>
                      <td className="px-4 py-3 text-xs text-terminal-dim">{agent.specialty}</td>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-terminal-accent">{agent.sharpeRatio.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge',
                          agent.allTimeWinRate >= 65 ? 'winrate-elite' :
                          agent.allTimeWinRate >= 55 ? 'winrate-good' :
                          agent.allTimeWinRate >= 40 ? 'winrate-acceptable' : 'winrate-poor'
                        )}>
                          {agent.allTimeWinRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className={clsx('px-4 py-3 text-xs font-mono font-bold', agent.todayPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                        {agent.todayPnL >= 0 ? '+' : ''}${agent.todayPnL.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-terminal-border rounded-full overflow-hidden">
                            <div className="h-full bg-terminal-accent rounded-full" style={{ width: `${agent.skillLevel * 10}%` }} />
                          </div>
                          <span className="text-xs font-mono text-terminal-text">{agent.skillLevel}/10</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reset */}
            <div className="panel p-4 border-terminal-red">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-terminal-text mb-1">Reset Demo</div>
                  <div className="text-xs text-terminal-dim">Resets demo balance to $1,000 and clears all trade history. This cannot be undone.</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Reset demo? This will clear all trades and reset balance to $1,000.')) {
                      resetDemo()
                      toast.success('Demo reset — Starting with $1,000')
                    }
                  }}
                  className="btn-danger flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Demo
                </button>
              </div>
              {wallet.lastReset && (
                <div className="text-xs font-mono text-terminal-dim mt-2">
                  Last reset: {new Date(wallet.lastReset).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
