'use client'
import { useState, useRef, useEffect } from 'react'
import { useTradingStore } from '@/lib/store'
import { generateAgentAnalysis } from '@/lib/agents/engine'
import type { Agent, AgentMessage } from '@/types'
import clsx from 'clsx'
import { Send, Play, Pause, Zap, TrendingUp, BarChart2, Pin, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import Image from 'next/image'

export function AgentPanel() {
  const {
    agents, messages, addMessage, pinMessage, tradingFloorMessages, addTradingFloorMessage,
    pauseAgent, resumeAgent, adminJoinChat, adminLeaveChat, quotes, mode,
    killSwitch, updateAgent
  } = useTradingStore()

  const [selectedAgent, setSelectedAgent] = useState<string | null>(agents[0]?.id || null)
  const [showTradingFloor, setShowTradingFloor] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedAgent])

  const agent = agents.find(a => a.id === selectedAgent)
  const agentMessages = selectedAgent ? (messages[selectedAgent] || []) : []

  const handleSendMessage = async () => {
    if (!agent || !inputValue.trim() || isLoading) return

    const userMsg: AgentMessage = {
      id: uuidv4(),
      agentId: agent.id,
      role: 'admin',
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    addMessage(agent.id, userMsg)
    setInputValue('')
    setIsLoading(true)

    try {
      const symbol = Object.keys(quotes)[0] || 'AAPL'
      const quote = quotes[symbol]
      if (!quote) throw new Error('No market data')

      const response = await generateAgentAnalysis(
        agent,
        symbol,
        quote,
        [],
        mode,
        agentMessages
      )

      addMessage(agent.id, response)

      // Update agent last action
      updateAgent(agent.id, {
        lastAction: response.content.slice(0, 80) + '...',
        lastActionTime: new Date().toISOString(),
      })
    } catch (error: any) {
      toast.error(`Agent ${agent.name} error: ${error.message}`)
      addMessage(agent.id, {
        id: uuidv4(),
        agentId: agent.id,
        role: 'system',
        content: 'Analysis temporarily unavailable. Check API key configuration.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async (agentId: string) => {
    if (killSwitch) {
      toast.error('Kill switch active — resume trading first')
      return
    }
    const targetAgent = agents.find(a => a.id === agentId)
    if (!targetAgent || targetAgent.status === 'paused') return

    setSelectedAgent(agentId)
    setIsLoading(true)

    const symbol = Object.keys(quotes)[0] || 'AAPL'
    const quote = quotes[symbol]
    if (!quote) { setIsLoading(false); return }

    updateAgent(agentId, { status: 'analyzing', lastAction: `Analyzing ${symbol}...`, lastActionTime: new Date().toISOString() })

    try {
      const response = await generateAgentAnalysis(
        targetAgent, symbol, quote, [], mode, messages[agentId] || []
      )
      addMessage(agentId, response)
      updateAgent(agentId, {
        status: 'active',
        lastAction: `Analyzed ${symbol}`,
        lastActionTime: new Date().toISOString(),
        todayTrades: targetAgent.todayTrades + 1,
      })
    } catch {
      updateAgent(agentId, { status: 'active' })
    } finally {
      setIsLoading(false)
    }
  }

  function getWinRateClass(rate: number) {
    if (rate >= 65) return 'winrate-elite'
    if (rate >= 55) return 'winrate-good'
    if (rate >= 40) return 'winrate-acceptable'
    return 'winrate-poor'
  }

  function getWinRateLabel(rate: number) {
    if (rate >= 65) return '★ ELITE'
    if (rate >= 55) return '✓ GOOD'
    if (rate >= 40) return '⚠ WATCH'
    return '✗ RECAL.'
  }

  function parseAgentContent(content: string) {
    try {
      const json = JSON.parse(content)
      return { isJson: true, data: json }
    } catch {
      return { isJson: false, data: null }
    }
  }

  return (
    <div className="flex h-full">
      {/* Agent list sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-terminal-border flex flex-col overflow-y-auto">
        <div className="panel-header sticky top-0 bg-terminal-surface z-10">
          <span className="panel-title">AI Agents</span>
          <button
            onClick={() => setShowTradingFloor(!showTradingFloor)}
            className="flex items-center gap-1 text-xs font-mono text-terminal-dim hover:text-terminal-accent transition-colors"
          >
            <Users className="w-3 h-3" />
            Floor
          </button>
        </div>

        {agents.map(a => (
          <div key={a.id} className="border-b border-terminal-border">
            <button
              onClick={() => { setSelectedAgent(a.id); setShowTradingFloor(false) }}
              className={clsx(
                'w-full flex items-start gap-2 p-2.5 text-left hover:bg-terminal-muted transition-colors',
                selectedAgent === a.id && !showTradingFloor && 'bg-terminal-muted border-l-2 border-terminal-accent'
              )}
            >
              {/* Status dot */}
              <div className={clsx(
                'w-2 h-2 rounded-full flex-shrink-0 mt-0.5',
                a.status === 'active' ? 'bg-terminal-green live-indicator' :
                a.status === 'analyzing' ? 'bg-terminal-accent live-indicator' :
                a.status === 'waiting' ? 'bg-yellow-400' :
                a.status === 'paused' ? 'bg-terminal-dim' : 'bg-terminal-red'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-terminal-text">{a.name}</span>
                  <span className={clsx('badge text-xs', getWinRateClass(a.allTimeWinRate))}>
                    {a.allTimeWinRate.toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-terminal-dim truncate">{a.specialty}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono text-terminal-dim">Lvl {a.skillLevel}/10</span>
                  <span className={clsx('text-xs font-mono font-bold', a.todayPnL >= 0 ? 'text-terminal-green' : 'text-terminal-red')}>
                    {a.todayPnL >= 0 ? '+' : ''}${a.todayPnL.toFixed(2)}
                  </span>
                </div>
                {/* Skill bar */}
                <div className="mt-1 h-0.5 bg-terminal-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terminal-accent rounded-full transition-all"
                    style={{ width: `${a.skillLevel * 10}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Agent quick actions */}
            <div className="flex items-center gap-1 px-2 pb-2">
              <button
                onClick={() => handleAnalyze(a.id)}
                disabled={a.status === 'paused' || killSwitch}
                className="flex items-center gap-0.5 text-xs font-mono text-terminal-accent hover:text-white border border-terminal-accent hover:bg-terminal-accent px-1.5 py-0.5 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-2.5 h-2.5" />
                Analyze
              </button>
              <button
                onClick={() => a.status === 'paused' ? resumeAgent(a.id) : pauseAgent(a.id)}
                className={clsx(
                  'flex items-center gap-0.5 text-xs font-mono px-1.5 py-0.5 rounded border transition-all',
                  a.status === 'paused'
                    ? 'border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg'
                    : 'border-terminal-dim text-terminal-dim hover:border-yellow-400 hover:text-yellow-400'
                )}
              >
                {a.status === 'paused' ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                {a.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showTradingFloor ? (
          <TradingFloorChat
            messages={tradingFloorMessages}
            addMessage={addTradingFloorMessage}
            agents={agents}
            isLoading={isLoading}
          />
        ) : agent ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-surface flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={clsx('w-2 h-2 rounded-full',
                  agent.status === 'active' ? 'bg-terminal-green live-indicator' :
                  agent.status === 'analyzing' ? 'bg-terminal-accent live-indicator' :
                  'bg-terminal-dim'
                )} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-terminal-text">{agent.name}</span>
                    <span className="badge badge-neutral capitalize">{agent.status}</span>
                    {agent.isAdminJoined && (
                      <span className="badge badge-bullish">Admin Joined</span>
                    )}
                  </div>
                  <div className="text-xs text-terminal-dim">{agent.specialty}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono text-terminal-dim">Confidence</div>
                  <div className="text-sm font-mono font-bold text-terminal-accent">{agent.confidence}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-terminal-dim">Budget Left</div>
                  <div className="text-sm font-mono font-bold text-terminal-text">
                    ${(agent.dailyBudget - agent.dailyBudgetUsed).toFixed(0)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (agent.isAdminJoined) {
                      adminLeaveChat(agent.id)
                      toast('Left agent chat')
                    } else {
                      adminJoinChat(agent.id)
                      toast.success(`Joined ${agent.name}'s chat`)
                      addMessage(agent.id, {
                        id: uuidv4(),
                        agentId: agent.id,
                        role: 'system',
                        content: `🔴 ADMIN JOINED — ${agent.name} acknowledges admin presence. Current positions: ${agent.todayTrades} trades today, $${agent.todayPnL.toFixed(2)} P&L. Awaiting instructions.`,
                        timestamp: new Date().toISOString(),
                      })
                    }
                  }}
                  className={clsx(
                    'text-xs font-mono px-2.5 py-1.5 rounded border transition-all',
                    agent.isAdminJoined
                      ? 'border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-white'
                      : 'border-terminal-accent text-terminal-accent hover:bg-terminal-accent hover:text-terminal-bg'
                  )}
                >
                  {agent.isAdminJoined ? 'Leave Chat' : 'Join Chat'}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {agentMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-terminal-muted flex items-center justify-center mb-3">
                    <BarChart2 className="w-6 h-6 text-terminal-accent" />
                  </div>
                  <div className="font-mono font-bold text-terminal-text mb-1">{agent.name} Ready</div>
                  <div className="text-xs text-terminal-dim max-w-sm">{agent.description}</div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleAnalyze(agent.id)}
                      className="btn-primary flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      Start Analysis
                    </button>
                    <button
                      onClick={() => {
                        adminJoinChat(agent.id)
                        addMessage(agent.id, {
                          id: uuidv4(),
                          agentId: agent.id,
                          role: 'system',
                          content: `Admin has joined the chat. ${agent.name} is ready to receive instructions.`,
                          timestamp: new Date().toISOString(),
                        })
                      }}
                      className="btn-ghost"
                    >
                      Join & Chat
                    </button>
                  </div>
                </div>
              )}

              {agentMessages.map(msg => {
                const { isJson, data } = parseAgentContent(msg.content)
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      'flex gap-2',
                      msg.role === 'admin' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-1',
                      msg.role === 'agent' ? 'bg-terminal-accent bg-opacity-20 text-terminal-accent' :
                      msg.role === 'admin' ? 'bg-terminal-purple bg-opacity-20 text-terminal-purple' :
                      'bg-terminal-muted text-terminal-dim'
                    )}>
                      {msg.role === 'agent' ? agent.name[0] :
                       msg.role === 'admin' ? 'A' : '⚙'}
                    </div>

                    {/* Message bubble */}
                    <div className={clsx(
                      'flex-1 max-w-2xl',
                      msg.role === 'admin' && 'text-right'
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-terminal-dim">
                          {msg.role === 'agent' ? agent.name :
                           msg.role === 'admin' ? 'ADMIN' : 'SYSTEM'}
                        </span>
                        {msg.confidence !== undefined && (
                          <span className="text-xs font-mono text-terminal-accent">{msg.confidence}% confidence</span>
                        )}
                        <span className="text-xs font-mono text-terminal-dim">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        {msg.isPinned && <Pin className="w-3 h-3 text-terminal-gold" />}
                        <button
                          onClick={() => pinMessage(agent.id, msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-terminal-dim hover:text-terminal-gold transition-all"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>

                      {isJson && data ? (
                        <TradeRecommendationCard data={data} />
                      ) : (
                        <div className={clsx(
                          'rounded-lg px-3 py-2 text-xs font-mono leading-relaxed whitespace-pre-wrap',
                          msg.role === 'agent' ? 'bg-terminal-surface border border-terminal-border text-terminal-text' :
                          msg.role === 'admin' ? 'bg-terminal-purple bg-opacity-20 border border-terminal-purple border-opacity-30 text-terminal-text' :
                          'bg-terminal-muted text-terminal-dim italic'
                        )}>
                          {msg.content}
                        </div>
                      )}

                      {msg.dataSources && msg.dataSources.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {msg.dataSources.map(s => (
                            <span key={s} className="text-xs font-mono text-terminal-dim bg-terminal-bg px-1.5 py-0.5 rounded border border-terminal-border">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-terminal-accent bg-opacity-20 flex items-center justify-center text-xs font-mono text-terminal-accent">
                    {agent.name[0]}
                  </div>
                  <div className="bg-terminal-surface border border-terminal-border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-terminal-accent rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-terminal-border p-3 bg-terminal-surface">
              <div className="flex items-center gap-2">
                <input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={agent.isAdminJoined ? `Send instruction to ${agent.name}...` : `Join chat to message ${agent.name}...`}
                  disabled={!agent.isAdminJoined || isLoading}
                  className="flex-1 input-terminal text-xs disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!agent.isAdminJoined || !inputValue.trim() || isLoading}
                  className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
              </div>
              {!agent.isAdminJoined && (
                <div className="mt-1 text-xs font-mono text-terminal-dim">
                  Click "Join Chat" above to send instructions to {agent.name}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-terminal-dim font-mono text-sm">
            Select an agent
          </div>
        )}
      </div>
    </div>
  )
}

// Trade recommendation card component
function TradeRecommendationCard({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false)
  const isActionable = ['BUY', 'SELL'].includes(data.action)

  return (
    <div className={clsx(
      'rounded-lg border p-3 text-xs font-mono',
      data.action === 'BUY' ? 'border-terminal-green bg-terminal-green bg-opacity-5' :
      data.action === 'SELL' ? 'border-terminal-red bg-terminal-red bg-opacity-5' :
      'border-terminal-border bg-terminal-surface'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'font-bold text-sm',
            data.action === 'BUY' ? 'text-terminal-green' :
            data.action === 'SELL' ? 'text-terminal-red' :
            'text-terminal-accent'
          )}>
            ● {data.action}
          </span>
          {data.symbol && <span className="text-terminal-text font-bold">{data.symbol}</span>}
          {data.confidence && (
            <span className="text-terminal-dim">{data.confidence}% confidence</span>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-terminal-dim hover:text-terminal-text">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Key metrics */}
      {isActionable && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {data.positionSize && (
            <div className="bg-terminal-bg rounded p-1.5">
              <div className="text-terminal-dim text-xs">Position</div>
              <div className="text-terminal-text font-bold">${data.positionSize}</div>
            </div>
          )}
          {data.stopLoss && (
            <div className="bg-terminal-bg rounded p-1.5">
              <div className="text-terminal-red text-xs">Stop Loss</div>
              <div className="text-terminal-red font-bold">${data.stopLoss}</div>
            </div>
          )}
          {data.takeProfit && (
            <div className="bg-terminal-bg rounded p-1.5">
              <div className="text-terminal-green text-xs">Take Profit</div>
              <div className="text-terminal-green font-bold">${data.takeProfit}</div>
            </div>
          )}
        </div>
      )}

      {/* Narrative */}
      {data.narrative && (
        <div className="text-terminal-text text-xs leading-relaxed mb-2">{data.narrative}</div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {data.reasoning && (
              <div className="mt-2 pt-2 border-t border-terminal-border">
                <div className="text-terminal-dim mb-1">Reasoning:</div>
                <div className="text-terminal-text text-xs leading-relaxed">{data.reasoning}</div>
              </div>
            )}
            {data.riskWarnings?.length > 0 && (
              <div className="mt-2">
                <div className="text-yellow-400 mb-1">⚠ Risk Warnings:</div>
                {data.riskWarnings.map((w: string, i: number) => (
                  <div key={i} className="text-yellow-400 text-xs">• {w}</div>
                ))}
              </div>
            )}
            {data.timeframe && (
              <div className="mt-2 text-terminal-dim">Timeframe: <span className="text-terminal-accent uppercase">{data.timeframe}</span></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Trading Floor chat
function TradingFloorChat({ messages, addMessage, agents, isLoading }: {
  messages: AgentMessage[]
  addMessage: (msg: AgentMessage) => void
  agents: Agent[]
  isLoading: boolean
}) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-terminal-border bg-terminal-surface flex-shrink-0">
        <Users className="w-4 h-4 text-terminal-accent" />
        <span className="font-mono font-bold text-terminal-text">Trading Floor</span>
        <span className="text-xs text-terminal-dim">All agents · Admin view</span>
        <div className="flex items-center gap-1 ml-auto">
          {agents.map(a => (
            <div key={a.id} className="flex items-center gap-1">
              <div className={clsx('w-1.5 h-1.5 rounded-full',
                a.status === 'active' ? 'bg-terminal-green' :
                a.status === 'analyzing' ? 'bg-terminal-accent' :
                a.status === 'paused' ? 'bg-terminal-dim' : 'bg-yellow-400'
              )} />
              <span className="text-xs font-mono text-terminal-dim">{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-terminal-dim font-mono text-xs py-8">
            Trading floor is active. Agents will share signals and discuss market conditions here.
          </div>
        )}
        {messages.map(msg => {
          const agent = agents.find(a => a.id === msg.agentId)
          return (
            <div key={msg.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-terminal-accent bg-opacity-20 flex items-center justify-center text-xs font-mono text-terminal-accent flex-shrink-0">
                {msg.role === 'admin' ? 'A' : (agent?.name[0] || '?')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-bold text-terminal-text">
                    {msg.role === 'admin' ? 'ADMIN' : agent?.name || msg.agentId.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-terminal-dim">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs font-mono text-terminal-text leading-relaxed bg-terminal-surface border border-terminal-border rounded px-2 py-1.5">
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 border-t border-terminal-border p-3 bg-terminal-surface">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (!input.trim()) return
                addMessage({ id: uuidv4(), agentId: 'admin', role: 'admin', content: input, timestamp: new Date().toISOString() })
                setInput('')
              }
            }}
            placeholder="Broadcast message to all agents..."
            className="flex-1 input-terminal text-xs"
          />
          <button
            onClick={() => {
              if (!input.trim()) return
              addMessage({ id: uuidv4(), agentId: 'admin', role: 'admin', content: input, timestamp: new Date().toISOString() })
              setInput('')
            }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            Broadcast
          </button>
        </div>
      </div>
    </div>
  )
}
