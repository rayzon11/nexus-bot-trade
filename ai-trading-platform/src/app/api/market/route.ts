import { NextRequest, NextResponse } from 'next/server'
import { fetchRealQuote, MOCK_QUOTES } from '@/lib/api/market'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbols = searchParams.get('symbols')?.split(',') || []

  if (!symbols.length) {
    return NextResponse.json({ quotes: MOCK_QUOTES })
  }

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      const real = await fetchRealQuote(symbol.trim())
      return real || MOCK_QUOTES.find(q => q.symbol === symbol.trim())
    })
  )

  return NextResponse.json({ quotes: quotes.filter(Boolean) })
}
