import React, { useState, useEffect } from 'react';
import { ExceptionRow, ActionDef } from '../types';
import { fmtMoneyFull, fmtNum, fmtMoney, pct } from '../utils/formatters';
import { Check, Edit3, X } from 'lucide-react';

interface DrawerProps {
  row: ExceptionRow | null;
  actions: ActionDef[];
  bandsPolicy: Record<string, Record<string, string>>;
  categoryRisk: Record<string, any>;
  onClose: () => void;
  onDecide: (status: 'Accepted' | 'Modified' | 'Rejected', comment: string) => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  row,
  actions,
  bandsPolicy,
  categoryRisk,
  onClose,
  onDecide
}) => {
  const [selectedDecision, setSelectedDecision] = useState<'Accepted' | 'Modified' | 'Rejected' | null>(null);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    if (row) {
      setSelectedDecision(row.status !== 'Pending' ? row.status : null);
      setComment(row.comment || '');
    }
  }, [row]);

  if (!row) return null;

  const act = actions.find(a => a.code === row.code) || {
    label: row.code,
    policy: 's8.2',
    desc: 'Mandated exit channel action.',
    cut: 0.15,
    auth: row.auth,
    esc: 'CPO within 14 days',
    lane: 'REC',
    owner: 'Merch'
  };

  const catData = categoryRisk[row.cat] || {
    agedV: 0,
    termV: 0,
    watchV: 0,
    agedPct: 0
  };

  const handleDecisionClick = (status: 'Accepted' | 'Modified' | 'Rejected') => {
    setSelectedDecision(status);
    onDecide(status, comment);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const bandClass = {
    Healthy: 'b-healthy',
    Watch: 'b-watch',
    Aged: 'b-aged',
    Terminal: 'b-terminal'
  }[row.band] || 'b-aged';

  const bandDotColor = {
    Healthy: '#2E8B3D',
    Watch: '#E8A317',
    Aged: '#D0342C',
    Terminal: '#6B1FA0'
  }[row.band] || '#D0342C';

  return (
    <div
      className="fixed inset-0 bg-[#0F141E]/40 z-[300] flex justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-[92vw] h-full bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.18)] flex flex-col animate-slideLeft"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E3EADF] flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-[#2C5A1E]">
              {row.id} &middot; SKU {row.sku}
            </div>
            <div className="text-xs text-[#6B7A66] mt-0.5">
              {row.cat} &middot; {row.om}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                Age Band
              </div>
              <div className="mt-1">
                <span className={`badge ${bandClass}`}>
                  <span className="badge-dot" style={{ background: bandDotColor }} />
                  {row.band}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                Operating Model
              </div>
              <div className="text-[13px] text-[#1B2418] font-medium mt-1">
                {row.om}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                Aged Units
              </div>
              <div className="text-[13px] text-[#1B2418] font-medium mt-1">
                {fmtNum(row.u)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                Value At Cost
              </div>
              <div className="text-[13px] text-[#1B2418] font-bold mt-1">
                {fmtMoneyFull(row.v)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                Cost To Clear
              </div>
              <div className="text-[13px] text-[#1B2418] font-medium mt-1">
                {fmtMoneyFull(row.loss || row.v * (act.cut || 0.15))}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                Reduction Applied
              </div>
              <div className="text-[13px] text-[#1B2418] font-medium mt-1">
                {((act.cut || 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <hr className="border-[#E3EADF]" />

          {/* Recommended Action */}
          <div>
            <div className="text-[12.5px] font-bold text-[#1B2418] mb-2">
              Recommended action
            </div>
            <div className="bg-[#F5F7FA] border-l-[3px] border-[#3F7D2C] p-3 text-[12.5px] text-[#333] rounded-r-md leading-relaxed space-y-2">
              <div>
                <b>{act.label}</b> &mdash; policy {act.policy}
                <div className="text-gray-600 mt-0.5">{act.desc}</div>
              </div>
              <div>
                <b>Band rule.</b> {bandsPolicy[row.om]?.[row.band] || 'Policy s8.1'} for {row.om} under s8.1.
              </div>
              <div>
                <b>Decision authority.</b> {act.auth}. Escalation: {act.esc}.
              </div>
              <div>
                <b>Write-off authority (s8.4).</b> {row.auth} at this value.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                  Decision Owner
                </div>
                <div className="mt-1">
                  <span className="owner-chip">{row.owner || act.owner}</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6B7A66] uppercase font-bold tracking-wider">
                  Lane
                </div>
                <div className="text-[13px] font-medium mt-1">
                  {act.lane}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#E3EADF]" />

          {/* Category Context */}
          <div>
            <div className="text-[12.5px] font-bold text-[#1B2418] mb-1">
              Category context &mdash; {row.cat}
            </div>
            <div className="text-xs text-[#6B7A66] leading-relaxed">
              Aged {fmtMoney(catData.agedV)} &middot; Terminal {fmtMoney(catData.termV)} &middot; Watch behind it {fmtMoney(catData.watchV)}.
              <br />
              {catData.agedPct}% of the category&apos;s inventory value has aged past band, against a Group position of 10.2%.
            </div>
          </div>

          <hr className="border-[#E3EADF]" />

          {/* Your Decision */}
          <div>
            <div className="text-[12.5px] font-bold text-[#1B2418] mb-2.5">
              Your decision
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDecisionClick('Accepted')}
                className={`flex-1 py-2 px-3 rounded-md font-bold text-xs border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedDecision === 'Accepted'
                    ? 'border-[#2E8B3D] bg-[#DFF3E6] text-[#1E7A3D]'
                    : 'border-[#E3EADF] bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                onClick={() => handleDecisionClick('Modified')}
                className={`flex-1 py-2 px-3 rounded-md font-bold text-xs border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedDecision === 'Modified'
                    ? 'border-[#E8A317] bg-[#FFF1E0] text-[#B96A00]'
                    : 'border-[#E3EADF] bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Modify
              </button>
              <button
                onClick={() => handleDecisionClick('Rejected')}
                className={`flex-1 py-2 px-3 rounded-md font-bold text-xs border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedDecision === 'Rejected'
                    ? 'border-[#D0342C] bg-[#F7D5D3] text-[#B3212C]'
                    : 'border-[#E3EADF] bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>

            <textarea
              className="w-full mt-3 p-2.5 border border-[#E3EADF] rounded-md text-xs font-sans resize-y min-h-[70px] focus:outline-hidden focus:border-[#62B146] focus:ring-1 focus:ring-[#62B146]"
              placeholder="Add a comment for the audit trail..."
              value={comment}
              onChange={handleCommentChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E3EADF] flex items-center justify-between bg-gray-50/50">
          <span className="text-xs text-[#6B7A66] flex items-center gap-2">
            Current:
            <span
              className={`badge ${
                row.status === 'Accepted'
                  ? 'badge-accepted'
                  : row.status === 'Modified'
                  ? 'badge-modified'
                  : row.status === 'Rejected'
                  ? 'badge-rejected'
                  : 'badge-pending'
              }`}
            >
              {row.status}
            </span>
          </span>
          <button
            onClick={() => {
              if (selectedDecision) {
                onDecide(selectedDecision, comment);
              }
              onClose();
            }}
            className="btn btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
