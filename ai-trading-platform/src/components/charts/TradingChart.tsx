'use client'
import { useEffect, useRef, useState } from 'react'
import { useTradingStore } from '@/lib/store'
import { generateMockOHLCV } from '@/lib/api/market'

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W'
type ChartType = 'candlestick' | 'line' | 'bar'

export function TradingChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const lineSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)

  const { selectedSymbol, quotes } = useTradingStore()
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [indicators, setIndicators] = useState({ rsi: true, macd: false, bb: false, ema: true })

  useEffect(() => {
    if (!chartRef.current) return

    let chart: any
    let cleanup = false

    const initChart = async () => {
      try {
        const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts')
        if (cleanup || !chartRef.current) return

        chart = createChart(chartRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: '#080c14' },
            textColor: '#5a7a9f',
          },
          grid: {
            vertLines: { color: '#1a2540' },
            horzLines: { color: '#1a2540' },
          },
          crosshair: { mode: CrosshairMode.Normal },
          rightPriceScale: {
            borderColor: '#1a2540',
            textColor: '#5a7a9f',
          },
          timeScale: {
            borderColor: '#1a2540',
            timeVisible: true,
            secondsVisible: false,
          },
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        })

        chartInstanceRef.current = chart

        const data = generateMockOHLCV(selectedSymbol, 180)

        if (chartType === 'line') {
          const lineSeries = chart.addLineSeries({
            color: '#00d4ff',
            lineWidth: 2,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
          })
          lineSeries.setData(data.map(d => ({ time: d.time, value: d.close })))
          lineSeriesRef.current = lineSeries
        } else {
          const candleSeries = chart.addCandlestickSeries({
            upColor: '#00ff9f',
            downColor: '#ff3d6b',
            borderUpColor: '#00ff9f',
            borderDownColor: '#ff3d6b',
            wickUpColor: '#00ff9f',
            wickDownColor: '#ff3d6b',
          })
          candleSeries.setData(data)
          candleSeriesRef.current = candleSeries

          // Volume
          const volSeries = chart.addHistogramSeries({
            color: '#1a2540',
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
            scaleMargins: { top: 0.8, bottom: 0 },
          })
          volSeries.setData(data.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(0, 255, 159, 0.3)' : 'rgba(255, 61, 107, 0.3)'
          })))
          volumeSeriesRef.current = volSeries

          // EMA lines
          if (indicators.ema) {
            const ema20 = calculateEMA(data.map(d => d.close), 20)
            const ema50 = calculateEMA(data.map(d => d.close), 50)

            const ema20Series = chart.addLineSeries({
              color: '#ffd700',
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            })
            ema20Series.setData(data.slice(19).map((d, i) => ({ time: d.time, value: ema20[i + 19] })))

            const ema50Series = chart.addLineSeries({
              color: '#a855f7',
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            })
            ema50Series.setData(data.slice(49).map((d, i) => ({ time: d.time, value: ema50[i + 49] })))
          }
        }

        chart.timeScale().fitContent()

        // Responsive resize
        const resizeObserver = new ResizeObserver(() => {
          if (chartRef.current && chart) {
            chart.applyOptions({
              width: chartRef.current.clientWidth,
              height: chartRef.current.clientHeight,
            })
          }
        })
        if (chartRef.current) resizeObserver.observe(chartRef.current)

        return () => resizeObserver.disconnect()
      } catch (e) {
        console.error('Chart init error:', e)
      }
    }

    initChart()

    return () => {
      cleanup = true
      if (chart) {
        try { chart.remove() } catch {}
      }
    }
  }, [selectedSymbol, timeframe, chartType, indicators.ema])

  // Update last candle with live price
  useEffect(() => {
    const quote = quotes[selectedSymbol]
    if (!quote || !candleSeriesRef.current) return
    try {
      candleSeriesRef.current.update({
        time: Math.floor(Date.now() / 1000),
        open: quote.open,
        high: quote.high24h,
        low: quote.low24h,
        close: quote.price,
      })
    } catch {}
  }, [quotes[selectedSymbol]?.price])

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']
  const chartTypes: { key: ChartType; label: string }[] = [
    { key: 'candlestick', label: 'Candle' },
    { key: 'line', label: 'Line' },
    { key: 'bar', label: 'Bar' },
  ]

  const quote = quotes[selectedSymbol]

  return (
    <div className="flex flex-col h-full">
      {/* Chart toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Symbol info */}
          {quote && (
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-terminal-text">{selectedSymbol}</span>
              <span className="font-mono font-bold text-lg text-terminal-text">
                ${quote.price < 10 ? quote.price.toFixed(4) : quote.price.toFixed(2)}
              </span>
              <span className={`font-mono text-sm font-semibold ${quote.changePercent >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </span>
              <span className="text-xs text-terminal-dim font-mono">
                H: ${quote.high24h.toFixed(2)} · L: ${quote.low24h.toFixed(2)} · Vol: {(quote.volume / 1e6).toFixed(1)}M
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type */}
          <div className="flex items-center gap-0.5 bg-terminal-bg rounded p-0.5">
            {chartTypes.map(ct => (
              <button
                key={ct.key}
                onClick={() => setChartType(ct.key)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  chartType === ct.key ? 'bg-terminal-muted text-terminal-accent' : 'text-terminal-dim hover:text-terminal-text'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-0.5 bg-terminal-bg rounded p-0.5">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  timeframe === tf ? 'bg-terminal-muted text-terminal-accent' : 'text-terminal-dim hover:text-terminal-text'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-1">
            {Object.entries(indicators).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setIndicators(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`px-1.5 py-0.5 text-xs font-mono rounded border transition-colors ${
                  val ? 'border-terminal-accent text-terminal-accent bg-terminal-accent bg-opacity-10' : 'border-terminal-border text-terminal-dim'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div ref={chartRef} className="flex-1 w-full" />
    </div>
  )
}

function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const ema = [prices[0]]
  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k))
  }
  return ema
}
