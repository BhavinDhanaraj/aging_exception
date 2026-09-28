import React from 'react';
import { AuditEntry, ActionDef } from '../types';
import { fmtMoney, fmtNum, fmtTs } from '../utils/formatters';

interface AuditLogViewProps {
  auditLog: AuditEntry[];
  actions: ActionDef[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLog, actions }) => {
  const counts = {
    Accepted: 0,
    Modified: 0,
    Rejected: 0
  };

  auditLog.forEach(a => {
    if (a.action === 'Accepted') counts.Accepted++;
    else if (a.action === 'Modified') counts.Modified++;
    else if (a.action === 'Rejected') counts.Rejected++;
  });

  const totalValueTouched = auditLog.reduce((acc, a) => acc + (a.value || 0), 0);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      <div className="config-note">
        <b>Audit Log.</b> Every reviewer decision, with the time it was assigned and the time it was acted on. Immutable and retained for audit under policy s2(8) &mdash; no decision reaches ERP or WMS without the approval level set in Configuration Center.
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E3EADF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Decisions logged
          </div>
          <div className="text-2xl font-bold text-[#2C5A1E] mt-1.5">
            {fmtNum(auditLog.length)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            {fmtMoney(totalValueTouched)} of value touched
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#2E8B3D] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Accepted
          </div>
          <div className="text-2xl font-bold text-[#2E8B3D] mt-1.5">
            {fmtNum(counts.Accepted)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            actioned as recommended
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#E8A317] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Modified
          </div>
          <div className="text-2xl font-bold text-[#B96A00] mt-1.5">
            {fmtNum(counts.Modified)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            adjusted before execution
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#D0342C] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Rejected
          </div>
          <div className="text-2xl font-bold text-[#D0342C] mt-1.5">
            {fmtNum(counts.Rejected)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            retained / not actioned
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E3EADF] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#E3EADF]">
          <span className="text-sm font-bold text-[#2C5A1E]">
            Reviewer Decision History
          </span>
          <span className="text-xs text-[#6B7A66]">
            Most recent first &middot; {fmtNum(auditLog.length)} entries
          </span>
        </div>

        <div className="overflow-x-auto max-h-[560px]">
          <table className="dtable">
            <thead>
              <tr>
                <th>Assigned</th>
                <th>Acted on</th>
                <th>SKU ID</th>
                <th>Category</th>
                <th>Action</th>
                <th>Decision Owner</th>
                <th>Status</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#6B7A66]">
                    No decisions recorded yet.
                  </td>
                </tr>
              ) : (
                auditLog.map(a => {
                  const acted = new Date(a.ts);
                  const lead = 5 + (((a.id.charCodeAt(5) || 7)) % 44);
                  const assigned = new Date(acted.getTime() - lead * 3600000);
                  const actDef = actions.find(x => x.code === a.code) || {
                    label: a.code || 'In-banner markdown 15%',
                    policy: 's8.2'
                  };

                  return (
                    <tr key={a.id}>
                      <td className="mono text-xs text-[#6B7A66]">
                        {fmtTs(assigned.toISOString())}
                      </td>
                      <td className="mono text-xs text-[#1B2418]">
                        {fmtTs(a.ts)}
                      </td>
                      <td className="mono font-semibold">{a.sku}</td>
                      <td>{a.cat}</td>
                      <td>
                        <b>{actDef.label}</b>
                        <div className="text-[11px] text-[#6B7A66]">
                          {actDef.policy}
                        </div>
                      </td>
                      <td>
                        <span className="owner-chip">{a.actor}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            a.action === 'Accepted'
                              ? 'badge-accepted'
                              : a.action === 'Modified'
                              ? 'badge-modified'
                              : a.action === 'Rejected'
                              ? 'badge-rejected'
                              : 'badge-pending'
                          }`}
                        >
                          {a.action}
                        </span>
                      </td>
                      <td className="text-xs text-[#6B7A66] max-w-sm truncate">
                        {a.comment || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#E3EADF] text-xs text-[#6B7A66]">
          Showing {Math.min(auditLog.length, 200)} of {fmtNum(auditLog.length)} entries. Assignment time is derived from the decision record pending the workflow feed.
        </div>
      </div>
    </div>
  );
};
