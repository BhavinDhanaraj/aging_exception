import React from 'react';
import { AGING_META } from '../data/agingMeta';
import { OM_BAND } from '../data/breakdowns';
import { AppConfig } from '../types';
import { fmtMoney, fmtMoneyFull } from '../utils/formatters';

interface ContextEngineViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
  onShowToast: (message: string, type?: 'success' | 'warn') => void;
}

export const ContextEngineView: React.FC<ContextEngineViewProps> = ({
  config,
  onUpdateConfig,
  onShowToast
}) => {
  const meta = AGING_META;

  const handleDayChange = (om: string, index: number, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    const currentDays = { ...config.days };
    const arr = [...(currentDays[om] || [90, 180, 365])];
    arr[index] = num;
    currentDays[om] = arr;
    onUpdateConfig({ days: currentDays });
    onShowToast(`<b>${om}</b> ageing thresholds updated to ${arr.join(' / ')} days.`, 'success');
  };

  const handleCatActionChange = (cat: string, code: string) => {
    const currentOverrides = { ...config.catAction };
    if (!code) {
      delete currentOverrides[cat];
      onUpdateConfig({ catAction: currentOverrides });
      onShowToast(`<b>${cat}</b> reverted to engine default recommendation.`, 'warn');
    } else {
      currentOverrides[cat] = code;
      const actDef = meta.actions.find(a => a.code === code);
      onUpdateConfig({ catAction: currentOverrides });
      onShowToast(`<b>${cat}</b> overridden to <b>${actDef?.label || code}</b> (${actDef?.owner || 'Merch'}).`, 'success');
    }
  };

  const handleTierChange = (tierKey: keyof AppConfig['tier'], valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) return;
    const newTier = { ...config.tier, [tierKey]: num };
    onUpdateConfig({ tier: newTier });
    onShowToast(`<b>${tierKey}</b> tier set to ${fmtMoneyFull(num)}. Assumption pending sign-off.`, 'warn');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      <div className="config-note">
        <b>Context Engine.</b> The ageing thresholds, exit-channel value tiers and per-category recommendation overrides that drive every figure on this platform. Changes take effect immediately across the Action Center and Simulation Center, and are held for this session only pending business sign-off. Nothing here writes to the published rule set or to ERP/WMS.
      </div>

      {/* Ageing Day Thresholds */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
          <span>Ageing day thresholds by operating model &mdash; editable</span>
          <span className="text-xs text-[#6B7A66] font-normal">
            Policy s8.1 &middot; aged from first DC receipt at SKU-lot level
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Operating model</th>
                <th>Healthy below</th>
                <th>Watch below</th>
                <th>Aged below</th>
                <th>Terminal above</th>
                <th>Policy definition</th>
                <th>At-risk value</th>
              </tr>
            </thead>
            <tbody>
              {meta.oms.map(om => {
                const days = config.days[om] || [90, 180, 365];
                const agedData = OM_BAND[`${om}|Aged`] || { v: 0 };
                const termData = OM_BAND[`${om}|Terminal`] || { v: 0 };
                const atRiskVal = agedData.v + termData.v;

                return (
                  <tr key={om}>
                    <td><b>{om}</b></td>
                    <td>
                      <input
                        type="number"
                        className="w-16 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                        value={days[0]}
                        onChange={e => handleDayChange(om, 0, e.target.value)}
                      /> d
                    </td>
                    <td>
                      <input
                        type="number"
                        className="w-16 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                        value={days[1]}
                        onChange={e => handleDayChange(om, 1, e.target.value)}
                      /> d
                    </td>
                    <td>
                      <input
                        type="number"
                        className="w-16 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                        value={days[2]}
                        onChange={e => handleDayChange(om, 2, e.target.value)}
                      /> d
                    </td>
                    <td className="font-semibold text-[#1B2418]">
                      {days[2]}d+
                    </td>
                    <td className="text-xs text-[#6B7A66] max-w-xs">
                      Aged: {meta.bandsPolicy[om as keyof typeof meta.bandsPolicy]?.Aged} &middot; Terminal: {meta.bandsPolicy[om as keyof typeof meta.bandsPolicy]?.Terminal}
                    </td>
                    <td><b>{fmtMoney(atRiskVal)}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#7A8A74] italic mt-3">
          MTE and Fast Fashion are measured from event close and phase close respectively, so the Healthy threshold is zero days &mdash; ageing starts the moment the window ends.
        </div>
      </div>

      {/* Category Recommendation Overrides */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
          <span>Category recommendation overrides &mdash; editable</span>
          <span className="text-xs text-[#6B7A66] font-normal">
            Replaces the engine&apos;s exit channel for every actionable row in the category
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Category</th>
                <th>Aged value</th>
                <th>Terminal value</th>
                <th>Engine default</th>
                <th>Override</th>
                <th>Owner</th>
                <th>Cost to clear</th>
              </tr>
            </thead>
            <tbody>
              {meta.cats.map(cat => {
                const k = meta.catRisk[cat];
                const overrideCode = config.catAction[cat] || '';
                const isOverridden = Boolean(overrideCode);
                const actDef = meta.actions.find(a => a.code === overrideCode);

                return (
                  <tr
                    key={cat}
                    className={isOverridden ? '!bg-[#FDF9EE]' : ''}
                  >
                    <td><b>{cat}</b></td>
                    <td>{fmtMoney(k.agedV)}</td>
                    <td>{fmtMoney(k.termV)}</td>
                    <td className="text-xs text-[#6B7A66]">Value-tiered s8.3 hierarchy</td>
                    <td>
                      <select
                        className="w-56 border border-[#E3EADF] rounded px-2.5 py-1 text-xs bg-white focus:outline-hidden focus:border-[#62B146]"
                        value={overrideCode}
                        onChange={e => handleCatActionChange(cat, e.target.value)}
                      >
                        <option value="">Engine recommendation</option>
                        {meta.actions.filter(a => a.code !== 'MONITOR').map(a => (
                          <option key={a.code} value={a.code}>{a.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {isOverridden ? (
                        <span className="owner-chip">{actDef?.owner || 'Merch'}</span>
                      ) : (
                        <span className="text-xs text-[#6B7A66]">per rule</span>
                      )}
                    </td>
                    <td>
                      {isOverridden ? (
                        <b>{fmtMoney(k.atRiskV * (actDef?.cut || 0.15))}</b>
                      ) : (
                        <span className="text-xs text-[#6B7A66]">{fmtMoney(k.loss)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#7A8A74] italic mt-3">
          Overridden categories are shaded in soft amber. Reverting to &quot;Engine recommendation&quot; restores the value-tiered s8.3 hierarchy.
        </div>
      </div>

      {/* Exit-Channel Value Tiers */}
      <div className="assume-note">
        <b>Assumption &mdash; for business sign-off.</b> Policy s8.3 requires the highest-recovery viable channel to be pursued first, but does not define <i>viable</i>. The value tiers below are our assumption: it is not economic to run outlet handling on a small residual. They are editable and should be confirmed with the category teams before the rules are published.
      </div>

      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="text-sm font-bold text-[#2C5A1E] mb-3">
          Exit-channel value tiers &mdash; editable assumption
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Threshold (value at cost)</th>
                <th>Channel selected at or above</th>
                <th>Channel below</th>
                <th>Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Cross-banner</b></td>
                <td>
                  <input
                    type="number"
                    className="w-24 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.tier.crossbanner}
                    onChange={e => handleTierChange('crossbanner', e.target.value)}
                  />
                </td>
                <td>Cross-banner transfer</td>
                <td>In-banner markdown 15%</td>
                <td className="text-xs text-[#6B7A66]">s8.3(2) &mdash; only worth the freight on larger Aged holdings</td>
              </tr>
              <tr>
                <td><b>Outlet</b></td>
                <td>
                  <input
                    type="number"
                    className="w-24 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.tier.outlet}
                    onChange={e => handleTierChange('outlet', e.target.value)}
                  />
                </td>
                <td>Outlet / clearance allocation</td>
                <td>Bulk liquidation</td>
                <td className="text-xs text-[#6B7A66]">s8.3(3) &mdash; outlet handling cost per line</td>
              </tr>
              <tr>
                <td><b>Liquidation</b></td>
                <td>
                  <input
                    type="number"
                    className="w-24 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.tier.liquidation}
                    onChange={e => handleTierChange('liquidation', e.target.value)}
                  />
                </td>
                <td>Bulk liquidation</td>
                <td>Charitable donation</td>
                <td className="text-xs text-[#6B7A66]">s8.3(4)&ndash;(5) &mdash; minimum lot size a secondary partner will take</td>
              </tr>
              <tr>
                <td><b>Write-off</b></td>
                <td>
                  <input
                    type="number"
                    className="w-24 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.tier.writeoff}
                    onChange={e => handleTierChange('writeoff', e.target.value)}
                  />
                </td>
                <td>Any channel above</td>
                <td>Destruction / write-off</td>
                <td className="text-xs text-[#6B7A66]">s8.3(6) &mdash; residual below the cost to handle</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Legend */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
          <span>Action legend &mdash; mandated actions, owners and escalation</span>
          <span className="text-xs text-[#6B7A66] font-normal">Policy s8.2 and s8.3</span>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Action</th>
                <th>Band</th>
                <th>Reduction</th>
                <th>Decision owner</th>
                <th>Policy authority</th>
                <th>Escalation</th>
                <th>Clause</th>
              </tr>
            </thead>
            <tbody>
              {meta.actions.map(a => (
                <tr key={a.code}>
                  <td>
                    <b>{a.label}</b>
                    <div className="text-xs text-[#6B7A66] max-w-sm">{a.desc}</div>
                  </td>
                  <td>
                    <span className={`badge ${
                      a.band === 'Healthy' ? 'b-healthy' : a.band === 'Watch' ? 'b-watch' : a.band === 'Aged' ? 'b-aged' : 'b-terminal'
                    }`}>
                      {a.band}
                    </span>
                  </td>
                  <td>{a.cut ? `${(a.cut * 100).toFixed(0)}%` : '—'}</td>
                  <td><span className="owner-chip">{a.owner}</span></td>
                  <td className="text-xs text-[#6B7A66]">{a.auth}</td>
                  <td className="text-xs text-[#6B7A66]">{a.esc}</td>
                  <td><b>{a.policy}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
