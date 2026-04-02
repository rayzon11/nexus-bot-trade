import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    const { agentId, systemPrompt, messages, maxTokens = 800 } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured', content: generateFallback(agentId) },
        { status: 200 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.slice(-20), // Keep last 20 messages for context
    })

    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n')

    return NextResponse.json({ content, agentId })
  } catch (error: any) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: error.message, content: 'Analysis temporarily unavailable. Retrying...' },
      { status: 200 }
    )
  }
}

function generateFallback(agentId: string): string {
  const responses: Record<string, string> = {
    apex: 'APEX analyzing tech sector momentum. NVDA showing strong breakout above $870 resistance. Monitoring for confirmation.',
    nexus: 'NEXUS tracking BTC on-chain flows. Whale accumulation detected at current levels. Bullish divergence on 4H RSI.',
    sigma: 'SIGMA watching EUR/USD at key 1.0850 support. NFP data will be the catalyst. Positioning neutral ahead of release.',
    quant: 'QUANT running correlation analysis. SPY/VIX relationship suggesting compression. Mean reversion trade setup forming.',
  }
  return responses[agentId] || 'Analyzing market conditions...'
}
