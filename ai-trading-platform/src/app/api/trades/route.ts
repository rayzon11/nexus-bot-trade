import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, side, orderType, quantity, price, agentId, reasoning, confidence } = body

    // Simulate realistic execution
    const slippage = (Math.random() * 0.001) * (side === 'buy' ? 1 : -1)
    const spread = price * 0.0002
    const executionPrice = parseFloat((price * (1 + slippage) + (side === 'buy' ? spread / 2 : -spread / 2)).toFixed(4))
    const fees = parseFloat((price * quantity * 0.001).toFixed(4)) // 0.1% fee

    const trade = {
      id: uuidv4(),
      symbol,
      name: symbol,
      assetClass: detectAssetClass(symbol),
      side,
      orderType: orderType || 'market',
      quantity,
      entryPrice: executionPrice,
      fees,
      spread: parseFloat((spread * quantity).toFixed(4)),
      slippage: parseFloat(Math.abs(slippage * price * quantity).toFixed(4)),
      status: 'filled',
      agentId: agentId || 'manual',
      reasoning: reasoning || 'Manual trade',
      dataSources: ['Market Data'],
      confidence: confidence || 75,
      openedAt: new Date().toISOString(),
    }

    return NextResponse.json({ trade, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

function detectAssetClass(symbol: string) {
  const crypto = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'XRP', 'DOT', 'AVAX']
  const forex = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF']
  const etf = ['SPY', 'QQQ', 'IWM', 'GLD', 'SLV', 'TLT', 'VTI']
  if (crypto.includes(symbol)) return 'crypto'
  if (forex.includes(symbol)) return 'forex'
  if (etf.includes(symbol)) return 'etf'
  return 'stock'
}
