import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Agent, AgentMessage, Alert, MarketSentiment, Position,
  Quote, Trade, TradingMode, WalletState, DailyReport, PlatformReport
} from '@/types'

// ============================================
// DEFAULT AGENTS
// ============================================

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'apex',
    name: 'APEX',
    avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=apex&backgroundColor=0d1117',
    specialty: 'Tech Equities & Growth Stocks',
    description: 'Senior equity analyst specializing in FAANG and high-growth technology companies. Combines fundamental DCF analysis with momentum trading.',
    skillLevel: 8,
    status: 'active',
    riskTolerance: 'moderate',
    allowedAssets: ['stock', 'etf'],
    dailyBudget: 300,
    dailyBudgetUsed: 0,
    maxPositionSize: 100,
    maxTradesPerDay: 10,
    stopLossThreshold: 2,
    takeProfitTarget: 5,
    confidence: 78,
    todayPnL: 0,
    todayPnLPercent: 0,
    todayWinRate: 0,
    allTimeWinRate: 67.3,
    todayTrades: 0,
    allTimeTrades: 284,
    sharpeRatio: 1.87,
    lastAction: 'Analyzing NVDA earnings pre-market',
    lastActionTime: new Date().toISOString(),
    isAdminJoined: false,
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nexus&backgroundColor=0d1117',
    specialty: 'Crypto Momentum & DeFi',
    description: 'Quantitative crypto trader with deep expertise in on-chain analytics, whale tracking, and cross-exchange arbitrage opportunities.',
    skillLevel: 9,
    status: 'analyzing',
    riskTolerance: 'aggressive',
    allowedAssets: ['crypto'],
    dailyBudget: 250,
    dailyBudgetUsed: 0,
    maxPositionSize: 80,
    maxTradesPerDay: 15,
    stopLossThreshold: 3,
    takeProfitTarget: 8,
    confidence: 85,
    todayPnL: 0,
    todayPnLPercent: 0,
    todayWinRate: 0,
    allTimeWinRate: 71.2,
    todayTrades: 0,
    allTimeTrades: 412,
    sharpeRatio: 2.14,
    lastAction: 'Monitoring BTC order book for breakout signal',
    lastActionTime: new Date().toISOString(),
    isAdminJoined: false,
  },
  {
    id: 'sigma',
    name: 'SIGMA',
    avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=sigma&backgroundColor=0d1117',
    specialty: 'FX Macro & Commodities',
    description: 'Goldman Sachs-caliber FX trader focused on G10 currency pairs, macro flow analysis, and commodity-linked instruments.',
    skillLevel: 7,
    status: 'waiting',
    riskTolerance: 'conservative',
    allowedAssets: ['forex', 'etf'],
    dailyBudget: 200,
    dailyBudgetUsed: 0,
    maxPositionSize: 75,
    maxTradesPerDay: 8,
    stopLossThreshold: 1.5,
    takeProfitTarget: 3,
    confidence: 62,
    todayPnL: 0,
    todayPnLPercent: 0,
    todayWinRate: 0,
    allTimeWinRate: 59.8,
    todayTrades: 0,
    allTimeTrades: 198,
    sharpeRatio: 1.45,
    lastAction: 'Waiting for NFP data release',
    lastActionTime: new Date().toISOString(),
    isAdminJoined: false,
  },
  {
    id: 'quant',
    name: 'QUANT',
    avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=quant&backgroundColor=0d1117',
    specialty: 'Statistical Arbitrage & Options',
    description: 'Renaissance Technologies-style quant exploiting statistical mispricings, volatility surface anomalies, and mean-reversion patterns.',
    skillLevel: 10,
    status: 'active',
    riskTolerance: 'moderate',
    allowedAssets: ['stock', 'options', 'etf', 'crypto'],
    dailyBudget: 250,
    dailyBudgetUsed: 0,
    maxPositionSize: 90,
    maxTradesPerDay: 20,
    stopLossThreshold: 2.5,
    takeProfitTarget: 6,
    confidence: 91,
    todayPnL: 0,
    todayPnLPercent: 0,
    todayWinRate: 0,
    allTimeWinRate: 74.6,
    todayTrades: 0,
    allTimeTrades: 891,
    sharpeRatio: 2.71,
    lastAction: 'Running mean-reversion scan on SPY components',
    lastActionTime: new Date().toISOString(),
    isAdminJoined: false,
  }
]

const DEFAULT_WALLET: WalletState = {
  mode: 'demo',
  startingBalance: 1000,
  currentBalance: 1000,
  unrealizedPnL: 0,
  realizedPnL: 0,
  totalPnL: 0,
  dailyReturn: 0,
  winRate: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  bestTrade: null,
  worstTrade: null,
  positions: [],
  sessionStartTime: Date.now(),
  lastReset: new Date().toISOString(),
}

// ============================================
// STORE INTERFACES
// ============================================

interface TradingStore {
  // Mode
  mode: TradingMode
  setMode: (mode: TradingMode) => void

  // Wallet
  wallet: WalletState
  resetDemo: () => void
  updateWallet: (updates: Partial<WalletState>) => void
  addPosition: (position: Position) => void
  closePosition: (positionId: string, exitPrice: number) => void

  // Market Data
  quotes: Record<string, Quote>
  updateQuote: (quote: Quote) => void
  watchlist: string[]
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  selectedSymbol: string
  setSelectedSymbol: (symbol: string) => void

  // Agents
  agents: Agent[]
  updateAgent: (agentId: string, updates: Partial<Agent>) => void
  pauseAgent: (agentId: string) => void
  resumeAgent: (agentId: string) => void
  killSwitch: boolean
  activateKillSwitch: () => void
  deactivateKillSwitch: () => void
  adminJoinChat: (agentId: string) => void
  adminLeaveChat: (agentId: string) => void

  // Chat
  messages: Record<string, AgentMessage[]>
  addMessage: (agentId: string, message: AgentMessage) => void
  pinMessage: (agentId: string, messageId: string) => void
  tradingFloorMessages: AgentMessage[]
  addTradingFloorMessage: (message: AgentMessage) => void

  // Trades
  trades: Trade[]
  addTrade: (trade: Trade) => void
  updateTrade: (tradeId: string, updates: Partial<Trade>) => void

  // Reports
  dailyReports: DailyReport[]
  platformReports: PlatformReport[]
  addReport: (report: DailyReport) => void

  // Alerts
  alerts: Alert[]
  addAlert: (alert: Alert) => void
  markAlertRead: (alertId: string) => void
  clearAlerts: () => void

  // Sentiment
  sentiment: MarketSentiment | null
  setSentiment: (s: MarketSentiment) => void

  // UI State
  darkMode: boolean
  toggleDarkMode: () => void
  sidebarOpen: boolean
  toggleSidebar: () => void
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useTradingStore = create<TradingStore>()(
  persist(
    (set, get) => ({
      mode: 'demo',
      setMode: (mode) => set({ mode }),

      wallet: DEFAULT_WALLET,
      resetDemo: () => set({
        wallet: {
          ...DEFAULT_WALLET,
          sessionStartTime: Date.now(),
          lastReset: new Date().toISOString(),
        },
        trades: [],
      }),
      updateWallet: (updates) =>
        set((s) => ({ wallet: { ...s.wallet, ...updates } })),

      addPosition: (position) =>
        set((s) => ({
          wallet: {
            ...s.wallet,
            positions: [...s.wallet.positions, position],
            currentBalance: s.wallet.currentBalance - (position.quantity * position.entryPrice),
          }
        })),

      closePosition: (positionId, exitPrice) =>
        set((s) => {
          const pos = s.wallet.positions.find(p => p.id === positionId)
          if (!pos) return s
          const pnl = (exitPrice - pos.entryPrice) * pos.quantity * (pos.side === 'short' ? -1 : 1)
          const newPositions = s.wallet.positions.filter(p => p.id !== positionId)
          const newBalance = s.wallet.currentBalance + (pos.quantity * exitPrice) + pnl
          const newRealizedPnL = s.wallet.realizedPnL + pnl
          const newWins = pnl > 0 ? s.wallet.winningTrades + 1 : s.wallet.winningTrades
          const newLosses = pnl < 0 ? s.wallet.losingTrades + 1 : s.wallet.losingTrades
          const total = newWins + newLosses
          return {
            wallet: {
              ...s.wallet,
              positions: newPositions,
              currentBalance: newBalance,
              realizedPnL: newRealizedPnL,
              totalPnL: newRealizedPnL + s.wallet.unrealizedPnL,
              winningTrades: newWins,
              losingTrades: newLosses,
              winRate: total > 0 ? (newWins / total) * 100 : 0,
            }
          }
        }),

      quotes: {},
      updateQuote: (quote) =>
        set((s) => ({ quotes: { ...s.quotes, [quote.symbol]: quote } })),

      watchlist: ['AAPL', 'NVDA', 'BTC', 'ETH', 'EUR/USD', 'SPY'],
      addToWatchlist: (symbol) =>
        set((s) => ({
          watchlist: s.watchlist.includes(symbol)
            ? s.watchlist
            : [...s.watchlist, symbol]
        })),
      removeFromWatchlist: (symbol) =>
        set((s) => ({ watchlist: s.watchlist.filter(w => w !== symbol) })),

      selectedSymbol: 'AAPL',
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

      agents: DEFAULT_AGENTS,
      updateAgent: (agentId, updates) =>
        set((s) => ({
          agents: s.agents.map(a => a.id === agentId ? { ...a, ...updates } : a)
        })),
      pauseAgent: (agentId) =>
        set((s) => ({
          agents: s.agents.map(a => a.id === agentId ? { ...a, status: 'paused' } : a)
        })),
      resumeAgent: (agentId) =>
        set((s) => ({
          agents: s.agents.map(a => a.id === agentId ? { ...a, status: 'active' } : a)
        })),

      killSwitch: false,
      activateKillSwitch: () =>
        set((s) => ({
          killSwitch: true,
          agents: s.agents.map(a => ({ ...a, status: 'paused' as const }))
        })),
      deactivateKillSwitch: () => set({ killSwitch: false }),

      adminJoinChat: (agentId) =>
        set((s) => ({
          agents: s.agents.map(a => a.id === agentId ? { ...a, isAdminJoined: true } : a)
        })),
      adminLeaveChat: (agentId) =>
        set((s) => ({
          agents: s.agents.map(a => a.id === agentId ? { ...a, isAdminJoined: false } : a)
        })),

      messages: { apex: [], nexus: [], sigma: [], quant: [] },
      addMessage: (agentId, message) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [agentId]: [...(s.messages[agentId] || []), message]
          }
        })),
      pinMessage: (agentId, messageId) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [agentId]: (s.messages[agentId] || []).map(m =>
              m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
            )
          }
        })),

      tradingFloorMessages: [],
      addTradingFloorMessage: (message) =>
        set((s) => ({ tradingFloorMessages: [...s.tradingFloorMessages, message] })),

      trades: [],
      addTrade: (trade) =>
        set((s) => ({
          trades: [trade, ...s.trades],
          wallet: {
            ...s.wallet,
            totalTrades: s.wallet.totalTrades + 1,
          }
        })),
      updateTrade: (tradeId, updates) =>
        set((s) => ({
          trades: s.trades.map(t => t.id === tradeId ? { ...t, ...updates } : t)
        })),

      dailyReports: [],
      platformReports: [],
      addReport: (report) =>
        set((s) => ({ dailyReports: [...s.dailyReports, report] })),

      alerts: [],
      addAlert: (alert) =>
        set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 100) })),
      markAlertRead: (alertId) =>
        set((s) => ({
          alerts: s.alerts.map(a => a.id === alertId ? { ...a, read: true } : a)
        })),
      clearAlerts: () => set({ alerts: [] }),

      sentiment: null,
      setSentiment: (sentiment) => set({ sentiment }),

      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'nexus-trader-store',
      partialize: (state) => ({
        wallet: state.wallet,
        watchlist: state.watchlist,
        agents: state.agents,
        trades: state.trades,
        messages: state.messages,
        tradingFloorMessages: state.tradingFloorMessages,
        dailyReports: state.dailyReports,
        alerts: state.alerts,
        darkMode: state.darkMode,
        mode: state.mode,
      }),
    }
  )
)
