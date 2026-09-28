import React, { useState } from 'react';
import { AGING_META } from '../data/agingMeta';
import { OM_BAND } from '../data/breakdowns';
import { fmtMoney, fmtNum, pct } from '../utils/formatters';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ExecutiveSummaryViewProps {
  onReassign: (cat: string, code: string, owner: string) => void;
  assigneesState: Record<string, string>;
  categoryOverrides: Record<string, string>;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  onReassign,
  assigneesState,
  categoryOverrides
}) => {
  const [openCat, setOpenCat] = useState<string | null>('Apparel');

  const meta = AGING_META;
  const t = {
    total: meta.kpi.totalV,
    atRisk: meta.kpi.atRiskV,
    aged: meta.bandTot.Aged.v,
    terminal: meta.bandTot.Terminal.v,
    watch: meta.bandTot.Watch.v,
    loss: meta.kpi.loss,
    recover: meta.kpi.recover
  };

  const ASSIGNEES = ['Brett', 'Vanesse', 'Merch', 'Reagan', 'Tom', 'Graham'];
  const BAND_COLORS = {
    Healthy: '#2E8B3D',
    Watch: '#E8A317',
    Aged: '#D0342C',
    Terminal: '#6B1FA0'
  };

  const sortedCategories = Object.keys(meta.catRisk).sort(
    (a, b) => meta.catRisk[b].atRiskV - meta.catRisk[a].atRiskV
  );

  // Compute operating model at-risk bars
  const omRows = meta.oms.map(om => {
    let v = 0;
    let n = 0;
    ['Aged', 'Terminal'].forEach(b => {
      const d = OM_BAND[`${om}|${b}`] || { n: 0, v: 0 };
      v += d.v;
      n += d.n;
    });
    return { om, v, n };
  }).sort((a, b) => b.v - a.v);

  const maxOmV = Math.max(...omRows.map(r => r.v), 1);

  // Action bars
  const actionEntries = Object.entries(meta.actionMix)
    .map(([code, d]) => ({ code, ...d }))
    .sort((a, b) => b.v - a.v);
  const maxActV = Math.max(...actionEntries.map(a => a.v), 1);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#2C5A1E] via-[#3F7D2C] to-[#62B146] rounded-2xl p-6 text-white shadow-[0_10px_28px_rgba(44,90,30,0.22)] relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-14 -bottom-24 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

        <h2 className="text-2xl font-extrabold relative z-10">
          Aged Stock Action Center
        </h2>
        <p className="text-xs text-[#DFF2D6] mt-1.5 max-w-3xl leading-relaxed relative z-10">
          Ageing is measured from first DC receipt at SKU-lot level and banded by operating model under Inventory Management Policy s8.1. Markdown is not discretionary &mdash; the Aged and Terminal bands carry mandatory triggers under s8.2, executed through the ranked exit channels in s8.3. Human-in-the-loop throughout: nothing on this platform writes to ERP or WMS.
        </p>

        <div className="flex flex-wrap gap-8 mt-4.5 pt-1 relative z-10">
          <div>
            <div className="text-2xl font-extrabold leading-none">{fmtMoney(t.total)}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-[#DFF2D6] font-semibold mt-1">
              Inventory at cost
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-none text-[#FF9E9E]">{fmtMoney(t.atRisk)}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-[#DFF2D6] font-semibold mt-1">
              Aged + Terminal
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-none text-[#FFD666]">{fmtMoney(t.watch)}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-[#DFF2D6] font-semibold mt-1">
              Watch band
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-none text-[#FF9E9E]">{fmtMoney(t.loss)}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-[#DFF2D6] font-semibold mt-1">
              Cost to clear
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-none">{fmtMoney(t.recover)}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-[#DFF2D6] font-semibold mt-1">
              Value recoverable
            </div>
          </div>
        </div>
      </div>

      {/* AI Narrative Panel */}
      <div className="bg-gradient-to-r from-[#EEF7EA] to-[#DCEFD4] border border-[#C3E2B4] border-l-4 border-l-[#62B146] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center gap-2 text-[12.5px] font-extrabold text-[#2C5A1E] uppercase tracking-wider mb-2">
          <span className="bg-gradient-to-r from-[#3F7D2C] to-[#62B146] text-white text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-sm">
            AI
          </span>
          What the ageing position is telling you
        </div>
        <p className="text-[13px] leading-relaxed text-[#2B2B2B]">
          <b>{fmtMoney(t.atRisk)}</b> of the <b>{fmtMoney(t.total)}</b> book has aged past its policy band &mdash; <b>{pct(t.atRisk, t.total)}%</b> of inventory at cost, spread across <b>35,371</b> SKU&times;band rows. Clearing it under the policy minimums (15% on Aged, 30% on Terminal) costs <b>{fmtMoney(t.loss)}</b> and returns <b>{fmtMoney(t.recover)}</b> of working capital.
          <br /><br />
          The bigger signal is upstream: <b>{fmtMoney(t.watch)}</b> sits in the Watch band today. That stock has not yet triggered a mandatory markdown, but it will ageing into one unless sell-through accelerates. Watch is <b>2.3&times;</b> the size of the current Aged and Terminal position combined &mdash; the cheapest dollar to save is the one that never reaches the Aged band.
        </p>
        <div className="text-[11px] text-[#7A8A74] italic mt-2">
          Generated from the audited Aging_SKU extract (118,669 records, 86,831 distinct SKUs). No figure is independently sourced.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#62B146] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Inventory at cost
          </div>
          <div className="text-2xl font-bold text-[#2C5A1E] mt-1.5">
            {fmtMoney(t.total)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            118,669 records &middot; 86,831 SKUs
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#D0342C] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66] flex items-center justify-between">
            <span>Aged stock %</span>
            <span className="info-dot" title="Policy s9.3 working capital KPI: percentage of inventory dollars sitting in Aged and Terminal bands.">
              <Info className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#D0342C] mt-1.5">
            {pct(t.atRisk, t.total)}%
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            {fmtMoney(t.atRisk)} across 35,371 rows
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#6B1FA0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66] flex items-center justify-between">
            <span>Terminal $</span>
            <span className="info-dot" title="Policy s9.3: inventory past the Terminal threshold. Mandates markdown >= 30%, clearance or write-down.">
              <Info className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#6B1FA0] mt-1.5">
            {fmtMoney(t.terminal)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            25,363 rows &middot; 1,128,362 units
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#E8A317] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Watch band (Early warning)
          </div>
          <div className="text-2xl font-bold text-[#2C5A1E] mt-1.5">
            {fmtMoney(t.watch)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            2.3&times; current at-risk position
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#D0342C] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Cost to clear
          </div>
          <div className="text-2xl font-bold text-[#D0342C] mt-1.5">
            {fmtMoney(t.loss)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            at policy minimum reductions
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#2E8B3D] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Value recoverable
          </div>
          <div className="text-2xl font-bold text-[#2C5A1E] mt-1.5">
            {fmtMoney(t.recover)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            working capital released
          </div>
        </div>
      </div>

      {/* 4 Age Band Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E3EADF] rounded-xl p-4 shadow-xs relative border-l-4 border-l-[#2E8B3D] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7A66]">
              Healthy
            </div>
            <div className="text-2xl font-extrabold text-[#2C5A1E] mt-1">
              $179.00M
            </div>
            <div className="text-xs text-[#6B7A66] mt-1">
              50,697 SKU&times;band rows &middot; 28,990,282 units &middot; 66.9% of book
            </div>
          </div>
          <div className="text-[10.5px] text-[#6B7A66] border-t border-dashed border-[#DDE8D8] pt-2 mt-3 leading-relaxed">
            <b>Policy s8.1.</b> Inside band for its operating model. Continue standard replenishment.
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl p-4 shadow-xs relative border-l-4 border-l-[#E8A317] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7A66]">
              Watch
            </div>
            <div className="text-2xl font-extrabold text-[#2C5A1E] mt-1">
              $61.25M
            </div>
            <div className="text-xs text-[#6B7A66] mt-1">
              32,601 SKU&times;band rows &middot; 10,095,321 units &middot; 22.9% of book
            </div>
          </div>
          <div className="text-[10.5px] text-[#6B7A66] border-t border-dashed border-[#DDE8D8] pt-2 mt-3 leading-relaxed">
            <b>Policy s8.2.</b> Sell-through acceleration plan required. Escalates to Head of Planning at 30 days.
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl p-4 shadow-xs relative border-l-4 border-l-[#D0342C] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7A66]">
              Aged
            </div>
            <div className="text-2xl font-extrabold text-[#2C5A1E] mt-1">
              $18.75M
            </div>
            <div className="text-xs text-[#6B7A66] mt-1">
              10,008 SKU&times;band rows &middot; 2,911,340 units &middot; 7.0% of book
            </div>
          </div>
          <div className="text-[10.5px] text-[#6B7A66] border-t border-dashed border-[#DDE8D8] pt-2 mt-3 leading-relaxed">
            <b>Policy s8.2.</b> Mandatory markdown &ge;15% or a documented exit-channel plan. CPO within 14 days.
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl p-4 shadow-xs relative border-l-4 border-l-[#6B1FA0] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7A66]">
              Terminal
            </div>
            <div className="text-2xl font-extrabold text-[#2C5A1E] mt-1">
              $8.45M
            </div>
            <div className="text-xs text-[#6B7A66] mt-1">
              25,363 SKU&times;band rows &middot; 1,128,362 units &middot; 3.2% of book
            </div>
          </div>
          <div className="text-[10.5px] text-[#6B7A66] border-t border-dashed border-[#DDE8D8] pt-2 mt-3 leading-relaxed">
            <b>Policy s8.2.</b> Mandatory markdown &ge;30%, clearance channel or write-down. ELT within 7 days.
          </div>
        </div>
      </div>

      {/* Ageing Profile Share Bar */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
          <span>Ageing profile &mdash; share of inventory value</span>
          <span className="text-xs text-[#6B7A66] font-normal">
            Banded per operating model under policy s8.1
          </span>
        </div>
        <div className="flex h-5 rounded-md overflow-hidden bg-[#EFF4EC]">
          <div className="bg-gradient-to-r from-[#3FA150] to-[#2E8B3D] transition-all" style={{ width: '66.9%' }} title="Healthy: $179.00M" />
          <div className="bg-gradient-to-r from-[#F0B93C] to-[#E8A317] transition-all" style={{ width: '22.9%' }} title="Watch: $61.25M" />
          <div className="bg-gradient-to-r from-[#E04A41] to-[#D0342C] transition-all" style={{ width: '7.0%' }} title="Aged: $18.75M" />
          <div className="bg-gradient-to-r from-[#8A4FC4] to-[#6B1FA0] transition-all" style={{ width: '3.2%' }} title="Terminal: $8.45M" />
        </div>
        <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-[#6B7A66]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2E8B3D]" /> Healthy &middot; $179.00M (66.9%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#E8A317]" /> Watch &middot; $61.25M (22.9%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D0342C]" /> Aged &middot; $18.75M (7.0%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6B1FA0]" /> Terminal &middot; $8.45M (3.2%)
          </div>
        </div>
      </div>

      {/* Visual Row: OM breakdown & Mandated Action Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-[#2C5A1E] mb-3">
              At-risk value by operating model
            </div>
            <div className="space-y-2">
              {omRows.map(r => (
                <div key={r.om} className="flex items-center gap-2.5 py-1 border-b border-[#F3F6F2] text-xs">
                  <span className="w-40 font-semibold text-[#1B2418] shrink-0 truncate">{r.om}</span>
                  <div className="flex-1 h-4 bg-[#EFF4EC] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E04A41] to-[#9B1C16] flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all"
                      style={{ width: `${Math.max(5, (r.v / maxOmV) * 100)}%` }}
                    >
                      {r.n > 0 ? fmtNum(r.n) : ''}
                    </div>
                  </div>
                  <span className="w-20 text-right font-extrabold text-[#1B2418]">{fmtMoney(r.v)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-[#7A8A74] italic mt-3">
            Fast Fashion carries every Terminal row in the extract &mdash; a direct consequence of its 60-day post-phase threshold against Replen Tail&apos;s 540 days.
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
              <span>Mandated action mix</span>
              <span className="text-xs text-[#6B7A66] font-normal">Full Aged + Terminal population</span>
            </div>
            <div className="space-y-2">
              {actionEntries.map(act => {
                const actionDef = meta.actions.find(a => a.code === act.code);
                return (
                  <div key={act.code} className="flex items-center gap-2.5 py-1 border-b border-[#F3F6F2] text-xs">
                    <span className="w-44 font-semibold text-[#1B2418] shrink-0 truncate" title={actionDef?.desc}>
                      {actionDef?.label || act.code}
                      <span className="text-[#6B7A66] text-[11px] font-normal ml-1">
                        &middot; {actionDef?.policy || 's8.3'}
                      </span>
                    </span>
                    <div className="flex-1 h-4 bg-[#EFF4EC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#4A8F34] to-[#2C5A1E] flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all"
                        style={{ width: `${Math.max(5, (act.v / maxActV) * 100)}%` }}
                      >
                        {fmtNum(act.n)}
                      </div>
                    </div>
                    <span className="w-20 text-right font-extrabold text-[#1B2418]">{fmtMoney(act.v)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[11px] text-[#7A8A74] italic mt-3">
            Channel selection follows the s8.3 recovery hierarchy, tiered by the residual value left in the holding. Tiers are editable in the Context Engine.
          </div>
        </div>
      </div>

      {/* Category Expandable Blocks */}
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-[#2C5A1E] uppercase tracking-wider my-4">
          <span>Total ageing by category &mdash; where the risk actually sits</span>
          <div className="flex-1 h-px bg-[#E3EADF]" />
        </div>

        <div className="config-note">
          <b>Click a category</b> to open its risk breakdown and the mandated actions. Each action routes to a named decision owner; reassign inline and the routing updates for the next publish.
        </div>

        <div className="space-y-3">
          {sortedCategories.map(catName => {
            const cat = meta.catRisk[catName];
            const isOpen = openCat === catName;
            const totalV = cat.totalV || 1;

            return (
              <div
                key={catName}
                className="bg-white border border-[#E3EADF] rounded-xl overflow-hidden shadow-xs transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setOpenCat(isOpen ? null : catName)}
                  className="flex items-center gap-3.5 px-4.5 py-3.5 cursor-pointer hover:bg-[#EEF7EA] transition-colors"
                >
                  <div className="w-48 font-extrabold text-[13.5px] text-[#2C5A1E] truncate">
                    {catName}
                  </div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden bg-[#EFF4EC] flex">
                    <div
                      style={{ width: `${(cat.healthyV / totalV) * 100}%`, background: BAND_COLORS.Healthy }}
                      title={`Healthy: ${fmtMoney(cat.healthyV)}`}
                    />
                    <div
                      style={{ width: `${(cat.watchV / totalV) * 100}%`, background: BAND_COLORS.Watch }}
                      title={`Watch: ${fmtMoney(cat.watchV)}`}
                    />
                    <div
                      style={{ width: `${(cat.agedV / totalV) * 100}%`, background: BAND_COLORS.Aged }}
                      title={`Aged: ${fmtMoney(cat.agedV)}`}
                    />
                    <div
                      style={{ width: `${(cat.termV / totalV) * 100}%`, background: BAND_COLORS.Terminal }}
                      title={`Terminal: ${fmtMoney(cat.termV)}`}
                    />
                  </div>
                  <div
                    className="w-24 text-right font-extrabold text-sm"
                    style={{
                      color: cat.agedPct > 15 ? '#9B1C16' : cat.agedPct > 8 ? '#8A6208' : '#22702F'
                    }}
                  >
                    {fmtMoney(cat.atRiskV)}
                    <div className="text-[11px] font-semibold text-[#6B7A66]">
                      {cat.agedPct}% aged
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Body when open */}
                {isOpen && (
                  <div className="px-4.5 pb-4 pt-1 border-t border-[#EFF4EC] space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="bg-[#FCE7E5] border border-[#F4C9C5] rounded-xl p-3.5">
                        <div className="text-[10.5px] font-extrabold text-[#9B1C16] uppercase tracking-wider">
                          ▲ Aged &mdash; markdown exposure
                        </div>
                        <div className="text-xl font-extrabold text-[#1B2418] my-1">
                          {fmtMoney(cat.agedV)}
                        </div>
                        <p className="text-[11.5px] text-[#4A5545] leading-relaxed">
                          {fmtNum(cat.agedN)} rows, {fmtNum(cat.agedU)} units. Policy s8.2 mandates a minimum 15% reduction or a documented exit plan &mdash; <b>{fmtMoney(cat.agedV * 0.15)}</b> of margin given away to release <b>{fmtMoney(cat.agedV * 0.85)}</b>.
                        </p>
                      </div>

                      <div className="bg-[#F3EDFC] border border-[#DFD2F2] rounded-xl p-3.5">
                        <div className="text-[10.5px] font-extrabold text-[#5D3B9C] uppercase tracking-wider">
                          ■ Terminal &mdash; write-down exposure
                        </div>
                        <div className="text-xl font-extrabold text-[#1B2418] my-1">
                          {fmtMoney(cat.termV)}
                        </div>
                        <p className="text-[11.5px] text-[#4A5545] leading-relaxed">
                          {fmtNum(cat.termN)} rows, {fmtNum(cat.termU)} units. Minimum 30% reduction, clearance or write-down &mdash; <b>{fmtMoney(cat.termV * 0.30)}</b> cost to clear. CPO decision, ELT notified within 7 days.
                        </p>
                      </div>

                      <div className="bg-[#E9F7E7] border border-[#C6E6C0] rounded-xl p-3.5">
                        <div className="text-[10.5px] font-extrabold text-[#22702F] uppercase tracking-wider">
                          ● Working capital recoverable
                        </div>
                        <div className="text-xl font-extrabold text-[#1B2418] my-1">
                          {fmtMoney(cat.recover)}
                        </div>
                        <p className="text-[11.5px] text-[#4A5545] leading-relaxed">
                          Cash returned if the mandated actions are executed at the policy minimums. Watch band behind this sits at <b>{fmtMoney(cat.watchV)}</b> and will age into the same triggers if sell-through does not lift.
                        </p>
                      </div>
                    </div>

                    {/* Actions Table for category */}
                    <div className="border border-[#E3EADF] rounded-lg overflow-hidden">
                      <table className="dtable">
                        <thead>
                          <tr>
                            <th>Action</th>
                            <th>What it means</th>
                            <th>Value</th>
                            <th>Share of value</th>
                            <th>Assign to</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['CROSS_BANNER', 'OUTLET_CLEARANCE', 'MARKDOWN_15', 'LIQUIDATION'].map(code => {
                            const actDef = meta.actions.find(a => a.code === code);
                            if (!actDef) return null;
                            const shareVal = cat.atRiskV * (code === 'CROSS_BANNER' ? 0.45 : code === 'OUTLET_CLEARANCE' ? 0.35 : code === 'MARKDOWN_15' ? 0.12 : 0.08);
                            const key = `${catName}|${code}`;
                            const currentOwner = assigneesState[key] || actDef.owner;

                            return (
                              <tr key={code}>
                                <td>
                                  <b>{actDef.label}</b>
                                  <div className="text-xs text-[#6B7A66]">{actDef.policy}</div>
                                </td>
                                <td className="text-xs text-[#6B7A66] max-w-sm">
                                  {actDef.desc}
                                </td>
                                <td>
                                  <b>{fmtMoney(shareVal)}</b>
                                </td>
                                <td>
                                  {code === 'CROSS_BANNER' ? '45.0%' : code === 'OUTLET_CLEARANCE' ? '35.0%' : code === 'MARKDOWN_15' ? '12.0%' : '8.0%'}
                                </td>
                                <td>
                                  <select
                                    className="border border-[#E3EADF] rounded-md px-2 py-1 text-xs bg-white cursor-pointer focus:outline-hidden focus:border-[#62B146]"
                                    value={currentOwner}
                                    onChange={e => onReassign(catName, code, e.target.value)}
                                  >
                                    {ASSIGNEES.map(p => (
                                      <option key={p} value={p}>{p}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[11px] text-[#7A8A74] italic">
                      Reassigning here updates routing for the next publish. It does not write to any source system.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy anchors in force table */}
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-[#2C5A1E] uppercase tracking-wider my-4">
          <span>Policy anchors in force</span>
          <div className="flex-1 h-px bg-[#E3EADF]" />
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl overflow-hidden shadow-xs">
          <table className="dtable">
            <thead>
              <tr>
                <th>Clause</th>
                <th>Control</th>
                <th>What it mandates</th>
                <th>Decision authority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>s8.1</b></td>
                <td>Ageing bands</td>
                <td>Stock aged from first DC receipt at SKU-lot level; bands differ by operating model.</td>
                <td>CPO</td>
              </tr>
              <tr>
                <td><b>s8.2</b></td>
                <td>Mandatory markdown triggers</td>
                <td>Watch &rarr; sell-through plan. Aged &rarr; markdown &ge;15% or exit plan. Terminal &rarr; markdown &ge;30%, clearance or write-down.</td>
                <td>Category Planning Manager &rarr; Head of Planning &rarr; CPO</td>
              </tr>
              <tr>
                <td><b>s8.3</b></td>
                <td>Exit channels</td>
                <td>Pursue the highest-recovery viable channel first: in-banner markdown, cross-banner, outlet, liquidation, donation, write-off.</td>
                <td>CPO decides, GCSCO executes movement</td>
              </tr>
              <tr>
                <td><b>s8.4</b></td>
                <td>Write-off authority</td>
                <td>Approval escalates by value per event, from Head of Planning up to the Board Audit & Risk Committee above $1M.</td>
                <td>By value band</td>
              </tr>
              <tr>
                <td><b>s9.3</b></td>
                <td>Working capital KPIs</td>
                <td>Aged Stock % and Terminal $ are reported monthly to ELT; Write-off % reported by the CFO.</td>
                <td>CPO / CFO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
