import React from 'react';
import { RunEntry } from '../types';
import { fmtNum, fmtTs } from '../utils/formatters';
import { Play } from 'lucide-react';

interface RunHistoryViewProps {
  runs: RunEntry[];
  onTriggerRun: () => void;
}

export const RunHistoryView: React.FC<RunHistoryViewProps> = ({ runs, onTriggerRun }) => {
  const last = runs[0] || {
    id: 'RUN-618',
    ts: new Date().toISOString(),
    trigger: 'Scheduled',
    status: 'Completed',
    recs: 118669,
    exc: 35371,
    issues: 16,
    dur: 382
  };

  const chron = [...runs].reverse();
  const maxExc = Math.max(...runs.map(r => r.exc), 1);
  const minExc = Math.min(...runs.map(r => r.exc), 0);
  const span = Math.max(1, maxExc - minExc);

  const firstRun = chron[0] || last;
  const growth = (((last.exc - firstRun.exc) / (firstRun.exc || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      <div className="config-note">
        <b>Run History.</b> The ageing pipeline runs weekly, re-banding every SKU-lot from first DC receipt and re-scoring the mandated action. A manual trigger is available for ad-hoc runs ahead of a category review.
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E3EADF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Last run
          </div>
          <div className="text-xl font-extrabold text-[#2C5A1E] mt-1.5">
            {last.id}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            {fmtTs(last.ts)} &middot; {last.trigger}
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Records processed
          </div>
          <div className="text-2xl font-bold text-[#1B2418] mt-1.5">
            {fmtNum(last.recs)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            SKU-lot level extract
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#D0342C] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Exceptions generated
          </div>
          <div className="text-2xl font-bold text-[#D0342C] mt-1.5">
            {fmtNum(last.exc)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            +{growth}% over eight weeks
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#E8A317] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Data issues flagged
          </div>
          <div className="text-2xl font-bold text-[#E8A317] mt-1.5">
            {fmtNum(last.issues)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            rows quarantined for review
          </div>
        </div>
      </div>

      {/* Weekly Exception Trend Bar Chart */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs space-y-3">
        <div className="text-sm font-bold text-[#2C5A1E]">
          Weekly exception trend &mdash; Aged + Terminal rows generated per run
        </div>

        <div className="flex items-end gap-2.5 h-36 pt-2 pb-1">
          {chron.map(r => {
            const height = 24 + ((r.exc - minExc) / span) * 100;
            return (
              <div key={r.id} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="text-[9.5px] font-bold text-[#1B2418] opacity-80 group-hover:opacity-100">
                  {fmtNum(r.exc)}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-[#2C5A1E] to-[#62B146] rounded-t-md hover:brightness-110 transition-all cursor-pointer"
                  style={{ height: `${height}px` }}
                  title={`${r.id}: ${fmtNum(r.exc)} exceptions on ${fmtTs(r.ts)}`}
                />
                <div className="text-[9.5px] text-[#6B7A66] font-semibold">
                  {r.ts.slice(5, 10)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-[11px] text-[#7A8A74] italic">
          The exception count is rising week on week because stock continues to age into band faster than it is being cleared &mdash; the same signal the Watch band carries on the Executive Summary.
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white border border-[#E3EADF] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#E3EADF]">
          <span className="text-sm font-bold text-[#2C5A1E]">
            Agent run history
          </span>
          <button
            onClick={onTriggerRun}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Trigger manual run
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Timestamp</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Records processed</th>
                <th>Exceptions generated</th>
                <th>Data issues</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id}>
                  <td className="mono font-bold text-[#2C5A1E]">{r.id}</td>
                  <td className="mono text-xs">{fmtTs(r.ts)}</td>
                  <td>{r.trigger}</td>
                  <td>
                    <span className="badge badge-accepted">
                      {r.status}
                    </span>
                  </td>
                  <td>{fmtNum(r.recs)}</td>
                  <td>{fmtNum(r.exc)}</td>
                  <td>{r.issues}</td>
                  <td>{r.dur}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#E3EADF] text-[11px] text-[#7A8A74] italic">
          Run history is retained for weekly audits. Manual runs execute in read-only mode and do not write to ERP/WMS.
        </div>
      </div>
    </div>
  );
};
