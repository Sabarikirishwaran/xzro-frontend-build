'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { MarketFeature } from '@/lib/types'

const axisStyle = { fontSize: 11, fill: '#8b8b93' }
const gridColor = 'rgba(255, 255, 255, 0.08)'
const ACCENT = '#5b8def'
const DANGER = '#ef6f7b'

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-xborder-strong bg-xpanel px-3 py-2 text-xs shadow-lg">
      <p className="font-mono font-medium text-xtext">{p.symbol}</p>
      {p.spread_pct !== undefined && (
        <p className="text-xtext-muted">{`spread: ${Number(p.spread_pct).toFixed(4)}%`}</p>
      )}
      {p.liquidity_score !== undefined && (
        <p className="text-xtext-muted">{`liquidity: ${Number(p.liquidity_score).toFixed(2)}`}</p>
      )}
      {p.order_book_imbalance_l5 !== undefined && (
        <p className="text-xtext-muted">{`OBI L5: ${Number(p.order_book_imbalance_l5).toFixed(3)}`}</p>
      )}
    </div>
  )
}

export function LiquiditySpreadScatter({ features }: { features: MarketFeature[] }) {
  const data = features
    .filter((f) => f.liquidity_score !== undefined && f.spread_pct !== undefined)
    .map((f) => ({ ...f, z: 1 }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 24, left: 4 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="liquidity_score"
          name="Liquidity"
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          label={{ value: 'Liquidity score', position: 'insideBottom', offset: -14, fill: '#8b8b93', fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="spread_pct"
          name="Spread %"
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
        />
        <ZAxis type="number" dataKey="z" range={[60, 60]} />
        <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3', stroke: gridColor }} />
        <Scatter data={data} fill={ACCENT} fillOpacity={0.8} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export function ObiBarChart({ features }: { features: MarketFeature[] }) {
  const data = features
    .filter((f) => f.order_book_imbalance_l5 !== undefined)
    .slice(0, 16)
    .map((f) => ({ symbol: f.symbol, order_book_imbalance_l5: f.order_book_imbalance_l5 }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 12, right: 16, bottom: 24, left: 4 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="symbol"
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          angle={-40}
          textAnchor="end"
          height={50}
          interval={0}
        />
        <YAxis tick={axisStyle} tickLine={false} axisLine={{ stroke: gridColor }} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
        <Bar dataKey="order_book_imbalance_l5" radius={[3, 3, 0, 0]}>
          {data.map((d) => (
            <Cell
              key={d.symbol}
              fill={(d.order_book_imbalance_l5 ?? 0) >= 0 ? ACCENT : DANGER}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
