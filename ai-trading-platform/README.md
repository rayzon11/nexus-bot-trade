# ⚡ NexusTrader — Multi-Agent AI Trading Platform

A professional-grade AI trading platform with 4 elite AI agents, real-time market data, demo/live modes, and a full Bloomberg-style terminal UI.

---

## 🚀 Quick Deploy to Vercel

### 1. Unzip & Push to GitHub

```bash
# Unzip the project
unzip nexus-trader.zip -d nexus-trader
cd nexus-trader

# Initialize git
git init
git add .
git commit -m "Initial commit — NexusTrader v2.0"

# Push to GitHub (create repo first at github.com)
git remote add origin https://github.com/YOUR_USERNAME/nexus-trader.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Add Environment Variables (see below)
4. Click Deploy

---

## 🔑 Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Source | Free Tier? |
|----------|----------|--------|-----------|
| `ANTHROPIC_API_KEY` | ✅ Required | [console.anthropic.com](https://console.anthropic.com) | Pay-per-use |
| `POLYGON_API_KEY` | Optional | [polygon.io](https://polygon.io) | ✅ Yes |
| `COINGECKO_API_KEY` | Optional | [coingecko.com](https://www.coingecko.com/en/api) | ✅ Yes |
| `ALPHA_VANTAGE_API_KEY` | Optional | [alphavantage.co](https://www.alphavantage.co) | ✅ Yes |
| `FRED_API_KEY` | Optional | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api) | ✅ Yes |
| `NEWS_API_KEY` | Optional | [newsapi.org](https://newsapi.org) | ✅ Yes |

> **Note:** All API keys are optional except `ANTHROPIC_API_KEY`. Without other keys, the platform uses realistic simulated market data. The AI agents require the Anthropic key.

---

## 📁 Project Structure

```
nexus-trader/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/page.tsx  # Main trading terminal
│   │   ├── admin/page.tsx      # Admin panel
│   │   ├── chat/page.tsx       # Agent chat
│   │   ├── swap/page.tsx       # Asset swap
│   │   └── api/                # API routes
│   │       ├── agents/chat/    # Claude AI agent endpoint
│   │       ├── market/         # Market data
│   │       ├── trades/         # Trade execution
│   │       └── reports/        # Daily report generation
│   ├── components/
│   │   ├── dashboard/          # Terminal UI components
│   │   │   ├── Header.tsx      # Header with kill switch & mode toggle
│   │   │   ├── LeftPanel.tsx   # Watchlist, portfolio, agent feed
│   │   │   ├── CenterPanel.tsx # Chart + order entry
│   │   │   ├── RightPanel.tsx  # Order book, news, macro
│   │   │   └── BottomBar.tsx   # Positions, orders, alerts
│   │   ├── agents/
│   │   │   └── AgentPanel.tsx  # Agent chat + trading floor
│   │   └── charts/
│   │       └── TradingChart.tsx # TradingView lightweight charts
│   ├── lib/
│   │   ├── store/index.ts      # Zustand global state
│   │   ├── api/market.ts       # Market data client
│   │   └── agents/engine.ts    # AI agent orchestration
│   └── types/index.ts          # TypeScript types
└── ...config files
```

---

## 🤖 AI Agents

| Agent | Specialty | Skill | Model |
|-------|-----------|-------|-------|
| **APEX** | Tech Equities & Growth | 8/10 | claude-sonnet-4-20250514 |
| **NEXUS** | Crypto Momentum & DeFi | 9/10 | claude-sonnet-4-20250514 |
| **SIGMA** | FX Macro & Commodities | 7/10 | claude-sonnet-4-20250514 |
| **QUANT** | Statistical Arbitrage | 10/10 | claude-sonnet-4-20250514 |

Each agent has:
- Dedicated system prompt (JPMorgan/BlackRock/Renaissance/Goldman caliber)
- Persistent conversation history
- Daily budget cap with stop-loss
- Win rate tracking with visual badges
- Daily report generation
- Admin join/override capability

---

## 📊 Features

### Trading Terminal
- TradingView-style charts (candlestick/line/bar)
- RSI, MACD, Bollinger Bands, EMA 20/50/200
- Real-time order book simulation
- One-click buy/sell with market/limit/stop orders
- Live P&L tracking

### Demo Mode
- $1,000 starting virtual capital
- Real market prices with realistic spreads/slippage/fees
- Win rate badge coloring:
  - 🔴 Below 40% — Needs recalibration
  - 🟡 40-55% — Acceptable, monitor
  - 🟢 55-65% — Good performance  
  - 🥇 Above 65% — Elite performance
- "If real money" projection calculator
- One-click reset

### Admin Controls
- Per-agent budget caps
- Risk tolerance settings (Conservative/Moderate/Aggressive)
- Skill level management (1-10)
- Global kill switch (halts all agents instantly)
- Daily report generation via Claude AI
- Agent leaderboard by Sharpe ratio

### Asset Swap
- Multi-asset swap router
- Price impact calculation
- Best route finder
- Full cost breakdown before confirmation

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local and add your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🔧 Customization

### Add New Agents
Edit `src/lib/store/index.ts` — `DEFAULT_AGENTS` array.

### Change Demo Balance
Set `NEXT_PUBLIC_DEMO_STARTING_BALANCE` in `.env.local`.

### Modify Agent Prompts  
Edit `src/lib/agents/engine.ts` — `buildSystemPrompt()` function.

### Add New Data Sources
Add API calls in `src/lib/api/market.ts`.

---

## 📄 License

Personal use only. Do not redistribute.

---

Built with Next.js 14, Anthropic Claude, TradingView Lightweight Charts, Zustand, Tailwind CSS, Framer Motion.
