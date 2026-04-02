import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

export async function POST(req: NextRequest) {
  try {
    const { agent, trades, mode } = await req.json()

    const wins = trades.filter((t: any) => (t.pnl || 0) > 0).length
    const losses = trades.filter((t: any) => (t.pnl || 0) < 0).length
    const netPnL = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)

    const prompt = `Generate a concise daily trading report for ${agent.name} (${agent.specialty}).

Stats: ${trades.length} trades, ${wins} wins, ${losses} losses, Net P&L: $${netPnL.toFixed(2)}

Provide:
1. Top 3 specific learnings from today
2. Strategy adjustments for tomorrow  
3. Market outlook
4. Admin recommendation

Be specific and actionable. Max 300 words.`

    let content = ''

    if (process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })
      content = response.content.filter(b => b.type === 'text').map(b => (b as any).text).join('\n')
    } else {
      content = `Performance summary: ${wins} wins, ${losses} losses. P&L: $${netPnL.toFixed(2)}. Strategy refinements ongoing.`
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
