import { formatPct, formatPrice } from '@/lib/format'
import type { FeatureRow } from '@/lib/types'
import { Panel, PanelHeader } from './ui'

export function FeatureTable({ features }: { features: FeatureRow[] }) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Venue features"
        description={`${features.length} symbol${features.length === 1 ? '' : 's'} in the current market state.`}
      />
      {features.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-text-muted">
          No venue features returned.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.12em] text-text-muted">
                {['Symbol', 'Mid', 'Spread', 'Funding', 'OBI L1', 'OBI L5', 'Vol 1m', 'Liquidity'].map(
                  (label, index) => (
                    <th
                      key={label}
                      className={`px-4 py-3 font-medium ${
                        index === 0 ? 'text-left' : 'text-right'
                      }`}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr
                  key={feature.symbol}
                  className="border-b border-white/[0.055] text-xs text-text-secondary transition last:border-b-0 hover:bg-white/[0.025]"
                >
                  <td className="mono-number px-4 py-3.5">{feature.symbol}</td>
                  <NumberCell>{formatPrice(feature.mid)}</NumberCell>
                  <NumberCell>{formatPct(feature.spreadPct)}</NumberCell>
                  <NumberCell>
                    {formatPct(
                      feature.fundingRate === undefined
                        ? undefined
                        : feature.fundingRate * 100,
                      4,
                    )}
                  </NumberCell>
                  <NumberCell>{formatNumber(feature.obiL1)}</NumberCell>
                  <NumberCell>{formatNumber(feature.obiL5)}</NumberCell>
                  <NumberCell>{formatPct(feature.vol1m)}</NumberCell>
                  <NumberCell>{formatNumber(feature.liquidity)}</NumberCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function NumberCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="mono-number px-4 py-3.5 text-right">{children}</td>
  )
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return value.toFixed(3)
}
