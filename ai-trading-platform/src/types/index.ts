// ============================================
// CORE PLATFORM TYPES
// ============================================

export type AssetClass = 'stock' | 'crypto' | 'forex' | 'etf' | 'options'
export type OrderType = 'market' | 'limit' | 'stop-loss' | 'take-profit'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'partial'
export type AgentStatus = 'active' | 'paused' | 'analyzing' | 'waiting' | 'retired'
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'
export type TradingMode = 'demo' | 'live'

// ============================================
// MARKET DATA
// ============================================

export interface Quote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high24h: number
  low24h: number
  open: number
  previousClose: number
  timestamp: number
  assetClass: AssetClass
}

export interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface OrderBook {
  symbol: string
  bids: [number, number][] // [price, size]
  asks: [number, number][]
  timestamp: number
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number // -1 to 1
  relatedSymbols: string[]
}

export interface MacroIndicator {
  name: string
  value: number
  previousValue: number
  unit: string
  date: string
  source: string
}

// ============================================
// WALLET & PORTFOLIO
// ============================================

export interface WalletState {
  mode: TradingMode
  startingBalance: number
  currentBalance: number
  unrealizedPnL: number
  realizedPnL: number
  totalPnL: number
  dailyReturn: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  bestTrade: Trade | null
  worstTrade: Trade | null
  positions: Position[]
  sessionStartTime: number
  lastReset: string
}

export interface Position {
  id: string
  symbol: string
  name: string
  assetClass: AssetClass
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  currentPrice: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  openedAt: string
  agentId: string
  stopLoss?: number
  takeProfit?: number
}

export interface Trade {
  id: string
  symbol: string
  name: string
  assetClass: AssetClass
  side: OrderSide
  orderType: OrderType
  quantity: number
  entryPrice: number
  exitPrice?: number
  pnl?: number
  pnlPercent?: number
  fees: number
  spread: number
  slippage: number
  status: OrderStatus
  agentId: string
  reasoning: string
  dataSources: string[]
  confidence: number
  openedAt: string
  closedAt?: string
}

// ============================================
// AGENTS
// ============================================

export interface Agent {
  id: string
  name: string
  avatar: string
  specialty: string
  description: string
  skillLevel: number // 1-10
  status: AgentStatus
  riskTolerance: RiskTolerance
  allowedAssets: AssetClass[]
  dailyBudget: number
  dailyBudgetUsed: number
  maxPositionSize: number
  maxTradesPerDay: number
  stopLossThreshold: number
  takeProfitTarget: number
  confidence: number // 0-100
  todayPnL: number
  todayPnLPercent: number
  todayWinRate: number
  allTimeWinRate: number
  todayTrades: number
  allTimeTrades: number
  sharpeRatio: number
  lastAction: string
  lastActionTime: string
  isAdminJoined: boolean
}

export interface AgentMessage {
  id: string
  agentId: string
  role: 'agent' | 'user' | 'admin' | 'system'
  content: string
  timestamp: string
  confidence?: number
  dataSources?: string[]
  tradeAction?: Partial<Trade>
  tradeOutcome?: 'profit' | 'loss' | 'pending'
  isPinned?: boolean
}

export interface DailyReport {
  id: string
  agentId: string
  agentName: string
  skillLevel: number
  date: string
  totalTrades: number
  wins: number
  losses: number
  breakevens: number
  netPnL: number
  netPnLPercent: number
  bestTrade: {
    ticker: string
    entryPrice: number
    exitPrice: number
    reason: string
    profit: number
  } | null
  worstTrade: {
    ticker: string
    entryPrice: number
    exitPrice: number
    whatWentWrong: string
    loss: number
  } | null
  marketConditions: string
  learnings: string[]
  strategyAdjustments: string
  valuableDataSources: string[]
  confidenceChange: { yesterday: number; today: number; reason: string }
  riskEventsHandled: string[]
  adminRecommendation: string
}

export interface PlatformReport {
  date: string
  combinedPnL: number
  overallWinRate: number
  bestAgent: string
  worstAgent: string
  totalTrades: number
  riskEvents: string[]
  agentsNeedingReview: string[]
  actionItems: string[]
  marketOutlook: string
  agentReports: DailyReport[]
}

// ============================================
// SWAP
// ============================================

export interface SwapRoute {
  fromAsset: string
  toAsset: string
  fromAmount: number
  toAmount: number
  exchangeRate: number
  priceImpact: number
  slippage: number
  platformFee: number
  networkFee: number
  totalCost: number
  estimatedTime: number
  exchange: string
  route: string[]
}

// ============================================
// ALERTS
// ============================================

export interface Alert {
  id: string
  type: 'price' | 'agent' | 'news' | 'risk' | 'system'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  symbol?: string
  agentId?: string
  timestamp: string
  read: boolean
}

// ============================================
// MARKET SENTIMENT
// ============================================

export interface MarketSentiment {
  fearGreedIndex: number // 0-100
  fearGreedLabel: string
  marketTrend: 'bullish' | 'bearish' | 'neutral'
  vix?: number
  btcDominance?: number
  timestamp: string
}
