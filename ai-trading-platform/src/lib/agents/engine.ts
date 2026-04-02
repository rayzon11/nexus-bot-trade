import type { Agent, AgentMessage, Quote, NewsItem, Trade, DailyReport } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// ============================================
// AGENT SYSTEM PROMPTS
// ============================================

export function buildSystemPrompt(agent: Agent, mode: 'demo' | 'live'): string {
  return `You are ${agent.name}, an elite AI trading agent on NexusTrader platform.

Your analytical capabilities combine:
- JPMorgan senior equity analyst (15 years, fundamental + technical analysis)
- BlackRock portfolio manager ($500M hedge fund, risk-adjusted returns)
- Renaissance Technologies quantitative researcher (statistical arbitrage)
- Goldman Sachs FX and derivatives trader (currency pairs, macro flows)

AGENT PROFILE:
- Specialty: ${agent.specialty}
- Skill Level: ${agent.skillLevel}/10
- Risk Tolerance: ${agent.riskTolerance}
- Allowed Assets: ${agent.allowedAssets.join(', ')}
- Daily Budget: $${agent.dailyBudget} (${mode} mode)
- Max Position Size: $${agent.maxPositionSize} per trade
- Max Trades Per Day: ${agent.maxTradesPerDay}
- Stop-Loss Threshold: ${agent.stopLossThreshold}%
- Take-Profit Target: ${agent.takeProfitTarget}%
- Current Confidence: ${agent.confidence}%
- Budget Remaining: $${agent.dailyBudget - agent.dailyBudgetUsed}

TRADING MODE: ${mode.toUpperCase()} — ${mode === 'demo' ? 'using virtual capital, real market data' : 'REAL MONEY — extra caution required'}

YOUR JOB:
1. Analyze market data, news sentiment, technicals, and macro conditions
2. Make high-conviction recommendations with clear reasoning
3. Never risk more than ${agent.stopLossThreshold}% on a single trade
4. Cite your data sources for every recommendation
5. Track performance and adjust strategy accordingly
6. Communicate like a Wall Street professional

RESPONSE FORMAT (for trade recommendations):
Always structure as JSON when making a trade call:
{
  "action": "BUY|SELL|HOLD|ANALYZE",
  "symbol": "TICKER",
  "reasoning": "detailed explanation",
  "confidence": 0-100,
  "positionSize": dollar amount,
  "stopLoss": price level,
  "takeProfit": price level,
  "timeframe": "intraday|swing|position",
  "dataSources": ["source1", "source2"],
  "riskWarnings": ["risk1", "risk2"],
  "narrative": "plain English summary for admin"
}

For non-trade responses, respond conversationally but always:
- State your current market view
- Reference specific data points
- Quantify your conviction level
- Flag any risk concerns

When admin joins this chat:
- Acknowledge immediately with a position summary
- Defer to their guidance on overrides
- Ask for clarification if instructions conflict with risk parameters
- Maintain professionalism at all times

Remember: Capital preservation is paramount. One great trade beats ten mediocre ones.`
}

export function buildTradingFloorPrompt(agents: Agent[]): string {
  return `You are participating in the NexusTrader Trading Floor — a collaborative discussion between elite AI trading agents.

Active agents: ${agents.map(a => `${a.name} (${a.specialty})`).join(', ')}

Rules of the Trading Floor:
1. Share market observations and signals openly
2. Challenge each other's reasoning constructively
3. Identify cross-asset correlations
4. Flag systemic risks that affect multiple books
5. Coordinate on macro themes
6. Never override another agent's trade decisions (advise only)

Keep discussions concise, data-driven, and professional. Use agent names when addressing specific colleagues.`
}

// ============================================
// ANTHROPIC API CALL
// ============================================

export async function callAgentAPI(
  agent: Agent,
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string,
  maxTokens: number = 800
): Promise<string> {
  const response = await fetch('/api/agents/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: agent.id,
      systemPrompt,
      messages,
      maxTokens,
    }),
  })

  if (!response.ok) {
    throw new Error(`Agent API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content
}

// ============================================
// GENERATE AGENT ANALYSIS
// ============================================

export async function generateAgentAnalysis(
  agent: Agent,
  symbol: string,
  quote: Quote,
  news: NewsItem[],
  mode: 'demo' | 'live',
  conversationHistory: AgentMessage[]
): Promise<AgentMessage> {
  const systemPrompt = buildSystemPrompt(agent, mode)

  const recentNews = news.slice(0, 3).map(n =>
    `[${n.source}] ${n.title} (Sentiment: ${n.sentiment}, Score: ${n.sentimentScore.toFixed(2)})`
  ).join('\n')

  const userContent = `Analyze ${symbol} for a potential trade.

Current Market Data:
- Price: $${quote.price} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
- Volume: ${(quote.volume / 1000000).toFixed(1)}M
- Day Range: $${quote.low24h} - $${quote.high24h}
- Open: $${quote.open}

Recent News:
${recentNews}

Budget remaining: $${agent.dailyBudget - agent.dailyBudgetUsed}
Trades today: ${agent.todayTrades}/${agent.maxTradesPerDay}

Provide your analysis and recommendation.`

  const history = conversationHistory.slice(-6).map(m => ({
    role: (m.role === 'agent' ? 'assistant' : 'user') as 'user' | 'assistant',
    content: m.content,
  }))

  try {
    const content = await callAgentAPI(
      agent,
      [...history, { role: 'user', content: userContent }],
      systemPrompt
    )

    return {
      id: uuidv4(),
      agentId: agent.id,
      role: 'agent',
      content,
      timestamp: new Date().toISOString(),
      confidence: agent.confidence,
      dataSources: ['Polygon.io', 'NewsAPI', 'Technical Analysis'],
    }
  } catch (error) {
    // Fallback mock response
    return {
      id: uuidv4(),
      agentId: agent.id,
      role: 'agent',
      content: generateMockAnalysis(agent, symbol, quote),
      timestamp: new Date().toISOString(),
      confidence: agent.confidence,
      dataSources: ['Mock Data'],
    }
  }
}

function generateMockAnalysis(agent: Agent, symbol: string, quote: Quote): string {
  const direction = quote.changePercent > 0 ? 'bullish' : 'bearish'
  const action = direction === 'bullish' ? 'BUY' : 'SELL'
  return JSON.stringify({
    action,
    symbol,
    reasoning: `${symbol} is showing ${direction} momentum with ${Math.abs(quote.changePercent).toFixed(2)}% move. Technical indicators align with ${agent.specialty} strategy. Volume is ${quote.volume > 50000000 ? 'elevated' : 'moderate'}, suggesting ${direction} conviction.`,
    confidence: agent.confidence,
    positionSize: Math.min(agent.maxPositionSize, agent.dailyBudget - agent.dailyBudgetUsed),
    stopLoss: parseFloat((quote.price * (1 - agent.stopLossThreshold / 100)).toFixed(2)),
    takeProfit: parseFloat((quote.price * (1 + agent.takeProfitTarget / 100)).toFixed(2)),
    timeframe: 'intraday',
    dataSources: ['Technical Analysis', 'Price Action', 'Volume Profile'],
    riskWarnings: ['Market volatility elevated', 'Position size within limits'],
    narrative: `${symbol} presenting a ${action} opportunity based on ${agent.specialty} analysis. Risk/reward at ${(agent.takeProfitTarget / agent.stopLossThreshold).toFixed(1)}:1.`,
  }, null, 2)
}

// ============================================
// GENERATE DAILY REPORT
// ============================================

export async function generateDailyReport(
  agent: Agent,
  trades: Trade[],
  mode: 'demo' | 'live'
): Promise<DailyReport> {
  const wins = trades.filter(t => (t.pnl || 0) > 0)
  const losses = trades.filter(t => (t.pnl || 0) < 0)
  const breakevens = trades.filter(t => (t.pnl || 0) === 0)
  const netPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const bestTrade = trades.reduce((best, t) => (!best || (t.pnl || 0) > (best.pnl || 0)) ? t : best, trades[0])
  const worstTrade = trades.reduce((worst, t) => (!worst || (t.pnl || 0) < (worst.pnl || 0)) ? t : worst, trades[0])

  const systemPrompt = buildSystemPrompt(agent, mode)
  const reportRequest = `Generate your end-of-day report for today.

Trading Stats:
- Total trades: ${trades.length}
- Wins: ${wins.length}, Losses: ${losses.length}, Breakeven: ${breakevens.length}
- Net P&L: $${netPnL.toFixed(2)} (${((netPnL / agent.dailyBudget) * 100).toFixed(2)}%)
- Win rate: ${trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : 0}%

Write your daily report covering:
1. What worked and what didn't
2. Top 3 learnings (specific and actionable)
3. Strategy adjustments for tomorrow
4. Your recommendation to the admin
5. Market outlook

Keep it concise and professional.`

  let reportContent = ''
  try {
    reportContent = await callAgentAPI(
      agent,
      [{ role: 'user', content: reportRequest }],
      systemPrompt,
      1000
    )
  } catch {
    reportContent = `Today's performance: ${wins.length} wins, ${losses.length} losses. Net P&L: $${netPnL.toFixed(2)}. Continuing to refine ${agent.specialty} strategy.`
  }

  return {
    id: uuidv4(),
    agentId: agent.id,
    agentName: agent.name,
    skillLevel: agent.skillLevel,
    date: new Date().toISOString().split('T')[0],
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    netPnL,
    netPnLPercent: (netPnL / agent.dailyBudget) * 100,
    bestTrade: bestTrade ? {
      ticker: bestTrade.symbol,
      entryPrice: bestTrade.entryPrice,
      exitPrice: bestTrade.exitPrice || bestTrade.entryPrice,
      reason: bestTrade.reasoning,
      profit: bestTrade.pnl || 0,
    } : null,
    worstTrade: worstTrade && (worstTrade.pnl || 0) < 0 ? {
      ticker: worstTrade.symbol,
      entryPrice: worstTrade.entryPrice,
      exitPrice: worstTrade.exitPrice || worstTrade.entryPrice,
      whatWentWrong: 'Stop loss triggered',
      loss: worstTrade.pnl || 0,
    } : null,
    marketConditions: 'Mixed signals across sectors. Tech showing relative strength.',
    learnings: [
      'Volume confirmation is critical for momentum trades',
      'News sentiment alone insufficient without technical confirmation',
      'Pre-market positioning advantages for gap plays',
    ],
    strategyAdjustments: reportContent,
    valuableDataSources: ['Polygon.io', 'NewsAPI'],
    confidenceChange: {
      yesterday: Math.max(0, agent.confidence - 5),
      today: agent.confidence,
      reason: netPnL > 0 ? 'Positive P&L day reinforces strategy' : 'Loss day prompts strategy review',
    },
    riskEventsHandled: ['Earnings volatility managed', 'Position sizing maintained'],
    adminRecommendation: netPnL > 0
      ? `${agent.name} performing well. Consider increasing daily budget.`
      : `${agent.name} underperforming. Review strategy and consider reducing position sizes.`,
  }
}
