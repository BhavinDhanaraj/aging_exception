import React from 'react';
import { AGING_META } from '../data/agingMeta';
import { AppConfig } from '../types';
import { fmtMoney, fmtMoneyFull, fmtNum } from '../utils/formatters';

interface ConfigurationCenterViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
  onShowToast: (message: string, type?: 'success' | 'warn') => void;
}

export const ConfigurationCenterView: React.FC<ConfigurationCenterViewProps> = ({
  config,
  onUpdateConfig,
  onShowToast
}) => {
  const meta = AGING_META;
  const maxAuthV = Math.max(...meta.authority.map(a => meta.authMix[a.approver]?.v || 0), 1);

  const handleSlaClockChange = (band: 'Watch' | 'Aged' | 'Terminal', value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) return;
    const newClocks = { ...config.slaClocks, [band]: num };
    onUpdateConfig({ slaClocks: newClocks });
    onShowToast(`<b>${band}</b> escalation clock set to <b>${num} days</b>. Pending activities re-scored.`, 'success');
  };

  const handleToggle = (key: 'autoMonitor' | 'teams' | 'sharepoint' | 'email') => {
    const newVal = !config[key];
    onUpdateConfig({ [key]: newVal });
    onShowToast(`<b>${key}</b> ${newVal ? 'enabled' : 'disabled'}. Session only &mdash; no change to published rules.`, newVal ? 'success' : 'warn');
  };

  const handleCapChange = (valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num) || num < 0) return;
    onUpdateConfig({ autoCap: num });
    onShowToast(`Clearing cap set to <b>${fmtMoneyFull(num)}</b>. Escalation routing recalculated.`, 'success');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      <div className="config-note">
        <b>Configuration Center.</b> Administrative control over how the ageing engine behaves: who may approve a write-off at what value, how fast each band must be actioned, which recommendations are automated away, and where alerts are published. Changes are held for this session pending business sign-off and never write to ERP or WMS.
      </div>

      {/* Write-off and Provisioning Authority Table */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
          <span>Write-off and provisioning authority &mdash; editable</span>
          <span className="text-xs text-[#6B7A66] font-normal">
            Policy s8.4 &middot; value per event, NZD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Value per event</th>
                <th>Approval required</th>
                <th>Reporting</th>
                <th>Rows in scope</th>
                <th>Value</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {meta.authority.map(a => {
                const m = meta.authMix[a.approver] || { n: 0, v: 0 };
                const bandLabel = a.hi === null
                  ? `Above ${fmtMoney(a.lo)}`
                  : a.lo === 0
                  ? `Up to ${fmtMoney(a.hi)}`
                  : `${fmtMoney(a.lo)} – ${fmtMoney(a.hi)}`;

                return (
                  <tr key={a.approver}>
                    <td><b>{bandLabel}</b></td>
                    <td>{a.approver}</td>
                    <td className="text-xs text-[#6B7A66]">{a.report}</td>
                    <td>{fmtNum(m.n)}</td>
                    <td><b>{fmtMoney(m.v)}</b></td>
                    <td>
                      <div className="w-32 h-3.5 bg-[#EFF4EC] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#4A8F34] to-[#2C5A1E] transition-all"
                          style={{ width: `${Math.max(4, (m.v / maxAuthV) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#7A8A74] italic mt-3">
          Distribution is calculated across the full 35,371-row Aged and Terminal population, not just the rows loaded into the Action Center.
        </div>
      </div>

      {/* Escalation Clocks */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-3">
          <span>Escalation clocks &mdash; editable</span>
          <span className="text-xs text-[#6B7A66] font-normal">Policy s8.2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Trigger</th>
                <th>First action</th>
                <th>Decision authority</th>
                <th>Escalates to</th>
                <th>Clock (days)</th>
                <th>Value exposed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="badge b-watch">
                    <span className="badge-dot" style={{ background: '#E8A317' }} /> Watch
                  </span> Enters Watch band
                </td>
                <td>Sell-through acceleration plan; review on-order</td>
                <td>Category Planning Manager</td>
                <td>Head of Planning</td>
                <td>
                  <input
                    type="number"
                    className="w-16 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.slaClocks.Watch}
                    onChange={e => handleSlaClockChange('Watch', e.target.value)}
                  /> d
                </td>
                <td><b>{fmtMoney(meta.bandTot.Watch.v)}</b></td>
              </tr>
              <tr>
                <td>
                  <span className="badge b-aged">
                    <span className="badge-dot" style={{ background: '#D0342C' }} /> Aged
                  </span> Enters Aged band
                </td>
                <td>Markdown &ge;15% or documented exit plan</td>
                <td>Head of Planning</td>
                <td>CPO</td>
                <td>
                  <input
                    type="number"
                    className="w-16 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.slaClocks.Aged}
                    onChange={e => handleSlaClockChange('Aged', e.target.value)}
                  /> d
                </td>
                <td><b>{fmtMoney(meta.bandTot.Aged.v)}</b></td>
              </tr>
              <tr>
                <td>
                  <span className="badge b-terminal">
                    <span className="badge-dot" style={{ background: '#6B1FA0' }} /> Terminal
                  </span> Enters Terminal band
                </td>
                <td>Markdown &ge;30%, clearance or write-down</td>
                <td>CPO</td>
                <td>ELT</td>
                <td>
                  <input
                    type="number"
                    className="w-16 border border-[#E3EADF] rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#62B146]"
                    value={config.slaClocks.Terminal}
                    onChange={e => handleSlaClockChange('Terminal', e.target.value)}
                  /> d
                </td>
                <td><b>{fmtMoney(meta.bandTot.Terminal.v)}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#7A8A74] italic mt-3">
          Shortening a clock raises the number of rows that breach SLA; it does not change the mandated markdown.
        </div>
      </div>

      {/* Automation and Routing */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="text-sm font-bold text-[#2C5A1E] mb-3">
          Automation and routing
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Setting</th>
                <th>What it controls</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Auto-close Monitor recommendations</b></td>
                <td className="text-xs text-[#6B7A66] max-w-lg">
                  Stock inside its Healthy band generates no alert and never reaches reviewer queues.
                </td>
                <td>
                  <label className="sw">
                    <input
                      type="checkbox"
                      checked={config.autoMonitor}
                      onChange={() => handleToggle('autoMonitor')}
                    />
                    <span className="sw-t" />
                  </label>
                </td>
              </tr>
              <tr>
                <td><b>Publish to Microsoft Teams</b></td>
                <td className="text-xs text-[#6B7A66] max-w-lg">
                  Decision owners receive the alert in their category channel.
                </td>
                <td>
                  <label className="sw">
                    <input
                      type="checkbox"
                      checked={config.teams}
                      onChange={() => handleToggle('teams')}
                    />
                    <span className="sw-t" />
                  </label>
                </td>
              </tr>
              <tr>
                <td><b>Publish to SharePoint</b></td>
                <td className="text-xs text-[#6B7A66] max-w-lg">
                  Full exception extract written to the governance library for audit.
                </td>
                <td>
                  <label className="sw">
                    <input
                      type="checkbox"
                      checked={config.sharepoint}
                      onChange={() => handleToggle('sharepoint')}
                    />
                    <span className="sw-t" />
                  </label>
                </td>
              </tr>
              <tr>
                <td><b>Publish to email</b></td>
                <td className="text-xs text-[#6B7A66] max-w-lg">
                  Out of scope for this release under BR-006; shown for completeness.
                </td>
                <td>
                  <label className="sw">
                    <input
                      type="checkbox"
                      checked={config.email}
                      onChange={() => handleToggle('email')}
                    />
                    <span className="sw-t" />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-[#7A8A74] italic mt-3">
          Human-in-the-loop is not configurable. Every markdown, transfer and write-off requires the named approval in s8.4 regardless of the settings above.
        </div>
      </div>

      {/* Clearing Cap Setting */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-bold text-[#2C5A1E] mb-2">
          <span>Clearing cap &mdash; editable</span>
          <span className="text-xs text-[#6B7A66] font-normal">
            Sets the boundary between routine clearance and escalated approval
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B7A66]">Value per event: $</span>
            <input
              type="number"
              className="w-32 border border-[#E3EADF] rounded-md px-3 py-1.5 text-sm font-bold focus:outline-hidden focus:border-[#62B146]"
              value={config.autoCap}
              onChange={e => handleCapChange(e.target.value)}
            />
          </div>
          <p className="text-xs text-[#6B7A66] max-w-xl leading-relaxed">
            Below this value a row clears at <b>Head of Planning</b> authority. At or above it, s8.4 escalates to <b>CPO + GCSCO + CFO</b>, then CEO above $250K, then the Board Audit &amp; Risk Committee above $1M.
          </p>
        </div>
      </div>
    </div>
  );
};
