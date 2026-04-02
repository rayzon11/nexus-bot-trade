import type { Quote, OHLCV, NewsItem, MarketSentiment, MacroIndicator } from '@/types'

// ============================================
// MARKET DATA CLIENT
// ============================================

const POLYGON_KEY = process.env.POLYGON_API_KEY || ''
const COINGECKO_KEY = process.env.COINGECKO_API_KEY || ''
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || ''
const FRED_KEY = process.env.FRED_API_KEY || ''
const NEWS_KEY = process.env.NEWS_API_KEY || ''

// Mock data for when APIs are not configured
export const MOCK_QUOTES: Quote[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 2.34, changePercent: 1.25, volume: 54230000, marketCap: 2940000000000, high24h: 190.12, low24h: 186.50, open: 186.91, previousClose: 186.91, timestamp: Date.now(), assetClass: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, change: -12.60, changePercent: -1.42, volume: 38100000, marketCap: 2160000000000, high24h: 893.00, low24h: 872.10, open: 888.00, previousClose: 888.00, timestamp: Date.now(), assetClass: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.80, change: 5.20, changePercent: 1.27, volume: 21400000, marketCap: 3090000000000, high24h: 417.00, low24h: 410.50, open: 410.60, previousClose: 410.60, timestamp: Date.now(), assetClass: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -8.30, changePercent: -3.23, volume: 89200000, marketCap: 791000000000, high24h: 258.00, low24h: 246.00, open: 256.80, previousClose: 256.80, timestamp: Date.now(), assetClass: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 172.30, change: 1.80, changePercent: 1.06, volume: 18600000, marketCap: 2130000000000, high24h: 173.50, low24h: 170.20, open: 170.50, previousClose: 170.50, timestamp: Date.now(), assetClass: 'stock' },
  { symbol: 'META', name: 'Meta Platforms', price: 512.60, change: 8.90, changePercent: 1.77, volume: 14300000, marketCap: 1310000000000, high24h: 515.00, low24h: 503.00, open: 503.70, previousClose: 503.70, timestamp: Date.now(), assetClass: 'stock' },
  { symbol: 'BTC', name: 'Bitcoin', price: 67842.50, change: 1243.80, changePercent: 1.87, volume: 28400000000, marketCap: 1336000000000, high24h: 68900.00, low24h: 66400.00, open: 66598.70, previousClose: 66598.70, timestamp: Date.now(), assetClass: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 3524.80, change: -42.30, changePercent: -1.19, volume: 14200000000, marketCap: 423000000000, high24h: 3590.00, low24h: 3490.00, open: 3567.10, previousClose: 3567.10, timestamp: Date.now(), assetClass: 'crypto' },
  { symbol: 'SOL', name: 'Solana', price: 162.40, change: 7.80, changePercent: 5.05, volume: 3200000000, marketCap: 72000000000, high24h: 165.00, low24h: 154.00, open: 154.60, previousClose: 154.60, timestamp: Date.now(), assetClass: 'crypto' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0842, change: 0.0012, changePercent: 0.11, volume: 890000000, high24h: 1.0865, low24h: 1.0815, open: 1.0830, previousClose: 1.0830, timestamp: Date.now(), assetClass: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2734, change: -0.0028, changePercent: -0.22, volume: 450000000, high24h: 1.2770, low24h: 1.2720, open: 1.2762, previousClose: 1.2762, timestamp: Date.now(), assetClass: 'forex' },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 524.80, change: 4.20, changePercent: 0.81, volume: 67800000, marketCap: 490000000000, high24h: 526.00, low24h: 520.40, open: 520.60, previousClose: 520.60, timestamp: Date.now(), assetClass: 'etf' },
]

export function simulateQuoteUpdate(quote: Quote): Quote {
  const change = (Math.random() - 0.5) * 0.004
  const newPrice = quote.price * (1 + change)
  const priceChange = newPrice - quote.previousClose
  return {
    ...quote,
    price: parseFloat(newPrice.toFixed(quote.assetClass === 'forex' ? 4 : 2)),
    change: parseFloat(priceChange.toFixed(2)),
    changePercent: parseFloat(((priceChange / quote.previousClose) * 100).toFixed(2)),
    timestamp: Date.now(),
  }
}

export function generateMockOHLCV(symbol: string, days: number = 180): OHLCV[] {
  const data: OHLCV[] = []
  const basePrice = MOCK_QUOTES.find(q => q.symbol === symbol)?.price || 100
  let price = basePrice * 0.7
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * 0.03
    const open = price
    const close = price * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.015)
    const low = Math.min(open, close) * (1 - Math.random() * 0.015)
    const volume = Math.floor(Math.random() * 50000000 + 10000000)

    data.push({
      time: Math.floor((now - i * dayMs) / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    })
    price = close
  }
  return data
}

export async function fetchRealQuote(symbol: string): Promise<Quote | null> {
  // Try Polygon.io for stocks
  if (POLYGON_KEY && !symbol.includes('/') && !['BTC','ETH','SOL','BNB','ADA'].includes(symbol)) {
    try {
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_KEY}`
      )
      const data = await res.json()
      if (data.results?.[0]) {
        const r = data.results[0]
        return {
          symbol,
          name: symbol,
          price: r.c,
          change: r.c - r.o,
          changePercent: ((r.c - r.o) / r.o) * 100,
          volume: r.v,
          high24h: r.h,
          low24h: r.l,
          open: r.o,
          previousClose: r.o,
          timestamp: Date.now(),
          assetClass: 'stock',
        }
      }
    } catch { /* fallthrough */ }
  }

  // Try CoinGecko for crypto
  const cryptoMap: Record<string, string> = {
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', ADA: 'cardano'
  }
  if (cryptoMap[symbol]) {
    try {
      const id = cryptoMap[symbol]
      const url = COINGECKO_KEY
        ? `https://pro-api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&x_cg_pro_api_key=${COINGECKO_KEY}`
        : `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      const res = await fetch(url)
      const data = await res.json()
      if (data[id]) {
        const mock = MOCK_QUOTES.find(q => q.symbol === symbol)
        return {
          symbol,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          price: data[id].usd,
          change: (data[id].usd * data[id].usd_24h_change) / 100,
          changePercent: data[id].usd_24h_change || 0,
          volume: data[id].usd_24h_vol || 0,
          high24h: mock?.high24h || data[id].usd * 1.02,
          low24h: mock?.low24h || data[id].usd * 0.98,
          open: data[id].usd,
          previousClose: data[id].usd,
          timestamp: Date.now(),
          assetClass: 'crypto',
        }
      }
    } catch { /* fallthrough */ }
  }

  // Return mock data as fallback
  return MOCK_QUOTES.find(q => q.symbol === symbol) || null
}

export async function fetchNews(query: string = 'trading finance markets'): Promise<NewsItem[]> {
  if (NEWS_KEY) {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_KEY}`
      )
      const data = await res.json()
      if (data.articles) {
        return data.articles.map((a: any, i: number) => ({
          id: `news-${i}`,
          title: a.title,
          summary: a.description || '',
          url: a.url,
          source: a.source.name,
          publishedAt: a.publishedAt,
          sentiment: scoreSentiment(a.title + ' ' + (a.description || '')),
          sentimentScore: Math.random() * 2 - 1,
          relatedSymbols: extractSymbols(a.title),
        }))
      }
    } catch { /* fallthrough */ }
  }
  return MOCK_NEWS
}

function scoreSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullish = ['surge', 'rally', 'gain', 'bull', 'up', 'rise', 'growth', 'profit', 'beat', 'strong']
  const bearish = ['drop', 'fall', 'crash', 'bear', 'down', 'loss', 'decline', 'miss', 'weak', 'recession']
  const lower = text.toLowerCase()
  const b = bullish.filter(w => lower.includes(w)).length
  const be = bearish.filter(w => lower.includes(w)).length
  if (b > be) return 'bullish'
  if (be > b) return 'bearish'
  return 'neutral'
}

function extractSymbols(text: string): string[] {
  const symbols = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'META', 'BTC', 'ETH', 'SPY']
  return symbols.filter(s => text.includes(s))
}

const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'NVIDIA Surges Past $3T Market Cap on AI Demand', summary: 'NVIDIA continues to dominate the AI chip market as demand for H100 GPUs reaches unprecedented levels.', url: '#', source: 'Bloomberg', publishedAt: new Date().toISOString(), sentiment: 'bullish', sentimentScore: 0.82, relatedSymbols: ['NVDA'] },
  { id: '2', title: 'Fed Signals Rate Hold Through Q2 2026', summary: 'Federal Reserve officials indicate interest rates will remain steady as inflation data shows mixed signals.', url: '#', source: 'Reuters', publishedAt: new Date(Date.now() - 3600000).toISOString(), sentiment: 'neutral', sentimentScore: 0.05, relatedSymbols: ['SPY'] },
  { id: '3', title: 'Bitcoin Tests $70K Resistance Level', summary: 'BTC approaches key resistance as institutional inflows into spot ETFs accelerate.', url: '#', source: 'CoinDesk', publishedAt: new Date(Date.now() - 7200000).toISOString(), sentiment: 'bullish', sentimentScore: 0.65, relatedSymbols: ['BTC', 'ETH'] },
  { id: '4', title: 'Tesla Deliveries Miss Q1 Estimates by 20%', summary: 'Electric vehicle maker reports disappointing delivery numbers amid production challenges.', url: '#', source: 'WSJ', publishedAt: new Date(Date.now() - 10800000).toISOString(), sentiment: 'bearish', sentimentScore: -0.74, relatedSymbols: ['TSLA'] },
  { id: '5', title: 'Apple Eyes AI Partnership for iPhone 17 Supercycle', summary: 'Reports suggest Apple is in advanced talks with multiple AI providers for next-generation Siri integration.', url: '#', source: 'FT', publishedAt: new Date(Date.now() - 14400000).toISOString(), sentiment: 'bullish', sentimentScore: 0.71, relatedSymbols: ['AAPL'] },
]

export async function fetchMacroIndicators(): Promise<MacroIndicator[]> {
  return [
    { name: 'US CPI (YoY)', value: 3.2, previousValue: 3.4, unit: '%', date: '2024-03-12', source: 'BLS' },
    { name: 'GDP Growth (QoQ)', value: 2.8, previousValue: 3.4, unit: '%', date: '2024-03-28', source: 'BEA' },
    { name: 'Unemployment Rate', value: 3.9, previousValue: 3.7, unit: '%', date: '2024-04-05', source: 'BLS' },
    { name: 'Fed Funds Rate', value: 5.25, previousValue: 5.25, unit: '%', date: '2024-03-20', source: 'FRED' },
    { name: '10Y Treasury Yield', value: 4.42, previousValue: 4.31, unit: '%', date: '2024-04-08', source: 'FRED' },
    { name: 'VIX', value: 14.8, previousValue: 16.2, unit: 'pts', date: '2024-04-08', source: 'CBOE' },
  ]
}

export async function fetchFearGreedIndex(): Promise<MarketSentiment> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1')
    const data = await res.json()
    const val = parseInt(data.data?.[0]?.value || '50')
    return {
      fearGreedIndex: val,
      fearGreedLabel: data.data?.[0]?.value_classification || 'Neutral',
      marketTrend: val > 60 ? 'bullish' : val < 40 ? 'bearish' : 'neutral',
      timestamp: new Date().toISOString(),
    }
  } catch {
    return {
      fearGreedIndex: 65,
      fearGreedLabel: 'Greed',
      marketTrend: 'bullish',
      timestamp: new Date().toISOString(),
    }
  }
}
