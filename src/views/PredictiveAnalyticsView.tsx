import React from 'react';
import { fmtMoney } from '../utils/formatters';
import { AGING_META } from '../data/agingMeta';
import { AlertTriangle } from 'lucide-react';

export const PredictiveAnalyticsView: React.FC = () => {
  const meta = AGING_META;
  const t = {
    aged: meta.bandTot.Aged.v,
    terminal: meta.bandTot.Terminal.v,
    watch: meta.bandTot.Watch.v,
    loss: meta.kpi.loss,
    records: meta.kpi.records,
    skus: meta.kpi.skus
  };

  const paCard = (tag: string, title: string, desc: string, rows: [string, string][], note?: string) => (
    <div className="bg-white border border-[#E3EADF] border-l-4 border-l-[#6B1FA0] rounded-xl p-4 shadow-xs flex flex-col justify-between">
      <div>
        <span className="inline-flex items-center bg-gradient-to-r from-[#6B1FA0] to-[#8A4FC4] text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider">
          {tag}
        </span>
        <div className="text-[13.5px] font-bold text-[#2C5A1E] mt-2 mb-1">
          {title}
        </div>
        <p className="text-xs text-[#4A5545] leading-relaxed">
          {desc}
        </p>

        <div className="bg-[#F7F3FC] border border-[#E4D7F3] rounded-lg p-2.5 mt-3 space-y-1">
          <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#6B1FA0] mb-1">
            Illustrative example
          </div>
          {rows.map(([label, val], idx) => (
            <div key={idx} className="flex justify-between items-center text-xs text-[#3C2B4A]">
              <span>{label}</span>
              <b className="text-[#4A1173]">{val}</b>
            </div>
          ))}
        </div>
      </div>

      {note && (
        <div className="text-[11px] text-[#7A8A74] italic mt-3 pt-2 border-t border-[#F0EBF7]">
          {note}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Informational purple banner */}
      <div className="bg-[#F7F3FC] border border-[#E4D7F3] border-l-4 border-l-[#6B1FA0] rounded-xl p-4 text-xs leading-relaxed text-[#3C2B4A]">
        <b>Predictive Analytics &mdash; forward-looking, not current state.</b> Everything on this page is a <b>candidate capability</b>, not a live figure. The platform today answers <i>where is aged stock now and what does it cost to clear</i>. These metrics would answer <i>what is about to age, when, and what will it cost if we do nothing</i>. The numbers shown are illustrative examples to frame the discussion with the business &mdash; they are not computed from the current extract.
      </div>

      {/* Key predictive metrics grid */}
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-[#2C5A1E] uppercase tracking-wider mb-3">
          <span>Key predictive metrics</span>
          <div className="flex-1 h-px bg-[#E3EADF]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paCard(
            'A',
            'Predicted health migration',
            'Predict the probability that each SKU moves to the next health state, so the Watch band stops being a passive label and becomes a ranked queue.',
            [
              ['Healthy → Watch within 30 days', '18%'],
              ['Watch → Aged within 30 days', '34%'],
              ['Watch → Aged within 60 days', '61%'],
              ['Aged → Terminal within 30 days', '27%']
            ],
            'Directly feeds Simulation Center scenario 2 — today Watch-to-Aged conversion rate is an assumption; this would make it measured.'
          )}

          {paCard(
            'B',
            'Days to Aged or Terminal',
            'Estimate the remaining days before a SKU-lot enters an action state, turning the s8.2 escalation clock from reactive to anticipatory.',
            [
              ['Predicted days to Aged', '21 days'],
              ['Predicted days to Terminal', '67 days'],
              ['Lots entering Aged this month', '1,240'],
              ['Lead time to act before markdown', '3 weeks']
            ],
            'Lets Action Center rows be prioritized by time remaining rather than time already elapsed.'
          )}

          {paCard(
            'C',
            'Forecasted inventory value at risk',
            'Project how much cost-value crosses into Aged or Terminal over the next quarter if current sell-through holds.',
            [
              ['30-day value at risk', '$4.8M'],
              ['60-day value at risk', '$8.2M'],
              ['90-day value at risk', '$12.6M'],
              ['Against today’s aged position', fmtMoney(t.aged + t.terminal)]
            ],
            `The 90-day projection would be roughly half of the ${fmtMoney(t.watch)} currently sitting in Watch.`
          )}

          {paCard(
            'D',
            'Forecasted markdown loss',
            'Estimate future markdown loss if no preventive action is taken, so the cost of inaction is quantified alongside the cost of acting.',
            [
              ['Current approved markdown loss', '$5.3M'],
              ['Additional 30-day forecast loss', '$1.2M'],
              ['Additional 60-day forecast loss', '$2.7M'],
              ['Additional 90-day forecast loss', '$4.1M']
            ],
            `Anchors to the ${fmtMoney(t.loss)} of mandated markdown the platform calculates today under Policy s8.2.`
          )}

          {paCard(
            'E',
            'Sell-through forecast',
            'Predict how many units are likely to sell over the next 4, 8 and 12 weeks at SKU-location grain, which is what makes every other metric on this page possible.',
            [
              ['Next 4 weeks', '312 units'],
              ['Next 8 weeks', '540 units'],
              ['Next 12 weeks', '705 units'],
              ['Implied weeks of cover', '14.2 weeks']
            ],
            'This is the foundational model — migration, days-to-aged and value-at-risk are all derived from it.'
          )}

          {paCard(
            'F',
            'Excess stock quantity and value',
            'Separate the holding that will genuinely clear from the quantity that is structurally excess, rather than treating the whole aged band as one block.',
            [
              ['Units forecast to clear', '68%'],
              ['Structurally excess units', '32%'],
              ['Excess value at cost', '$8.7M'],
              ['Recommended exit channel', 'Cross-banner']
            ],
            'Sharpens Simulation Center scenario 3 — shifting only the stock that another channel can actually absorb.'
          )}
        </div>
      </div>

      {/* Optimal Markdown Percentage Section */}
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-[#2C5A1E] uppercase tracking-wider mb-3">
          <span>Optimal markdown percentage</span>
          <div className="flex-1 h-px bg-[#E3EADF]" />
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#2C5A1E]">
              Replacing the flat 15% / 30% with a per-SKU optimal depth
            </span>
            <span className="bg-[#6B1FA0] text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-sm">
              FUTURE
            </span>
          </div>
          <p className="text-[#4A5545] leading-relaxed">
            Policy s8.2 sets <b>15% at Aged</b> and <b>30% at Terminal</b> as mandatory <i>minimums</i> &mdash; a floor, not a recommendation. With price-elasticity history the engine could recommend the depth that actually maximises recovery for each SKU, which will be above the floor for slow sellers and at the floor for lines that clear on their own.
          </p>

          <div className="overflow-x-auto">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Depth applied</th>
                  <th>Basis</th>
                  <th>Limitation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Today &mdash; policy floor</b></td>
                  <td>15% Aged / 30% Terminal</td>
                  <td className="text-xs text-[#6B7A66]">Policy s8.2 mandated minimum</td>
                  <td className="text-xs text-[#6B7A66]">Same depth for a fast-moving line and a dead one &mdash; over-discounts some stock and under-discounts the rest</td>
                </tr>
                <tr>
                  <td><b>Simulation Center today</b></td>
                  <td>One depth across the scope</td>
                  <td className="text-xs text-[#6B7A66]">Modelled clearance response, optimised in aggregate</td>
                  <td className="text-xs text-[#6B7A66]">Finds the best single depth, not the best depth per SKU</td>
                </tr>
                <tr>
                  <td><b>With elasticity history</b></td>
                  <td>Optimal per SKU (e.g. 15%&ndash;45%)</td>
                  <td className="text-xs text-[#6B7A66]">Observed price/volume response by SKU, category and season</td>
                  <td className="text-xs text-[#6B7A66]">Requires repeated markdown observations at SKU grain</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-[#7A8A74] italic">
            The Simulation Center already optimises depth in aggregate and finds an interior peak. Per-SKU optimisation is the same idea applied at the grain where the money actually sits.
          </div>
        </div>
      </div>

      {/* What is needed to build this (Requirements box) */}
      <div className="bg-[#FDF6E4] border border-[#F3E2BC] border-l-4 border-l-[#E8A317] rounded-xl p-4.5 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#8A6208] uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4" /> What is needed to build this
        </div>
        <p className="text-[#4A3B12] leading-relaxed">
          To generate these insights reliably, the current Aging data needs to be supplemented with <b>historical weekly inventory, sales, receipts, pricing and markdown data</b>. The existing dataset provides a strong current-state foundation &mdash; {t.records.toLocaleString()} records across {t.skus.toLocaleString()} SKUs &mdash; but it is a single snapshot. Predictive metrics require <b>repeated observations of each SKU over time</b>; you cannot infer a trajectory from one point.
        </p>

        <div className="overflow-x-auto bg-white/70 rounded-lg p-2 border border-[#EEDDB8]">
          <table className="dtable">
            <thead>
              <tr>
                <th>Data required</th>
                <th>Grain</th>
                <th>History needed</th>
                <th>Unlocks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Weekly inventory snapshot</b></td>
                <td>SKU &times; location &times; week</td>
                <td>52+ weeks</td>
                <td className="text-xs text-[#6B7A66]">Health migration (A), days to Aged (B)</td>
              </tr>
              <tr>
                <td><b>Sales / units sold</b></td>
                <td>SKU &times; location &times; week</td>
                <td>52+ weeks</td>
                <td className="text-xs text-[#6B7A66]">Sell-through forecast (E), excess split (F)</td>
              </tr>
              <tr>
                <td><b>Receipts / inbound</b></td>
                <td>SKU &times; lot &times; date</td>
                <td>52+ weeks</td>
                <td className="text-xs text-[#6B7A66]">True band-entry date, replacing the derived clock</td>
              </tr>
              <tr>
                <td><b>Pricing history</b></td>
                <td>SKU &times; week</td>
                <td>2+ seasons</td>
                <td className="text-xs text-[#6B7A66]">Optimal markdown depth, price elasticity</td>
              </tr>
              <tr>
                <td><b>Markdown events + outcome</b></td>
                <td>SKU &times; event</td>
                <td>2+ seasons</td>
                <td className="text-xs text-[#6B7A66]">Forecast markdown loss (D), clearance response</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#8A6208] italic">
          Several assumptions currently flagged amber in the Simulation Center &mdash; clearance response, Watch-to-Aged conversion, channel capacity &mdash; would all become measured values once this history is available.
        </div>
      </div>
    </div>
  );
};
