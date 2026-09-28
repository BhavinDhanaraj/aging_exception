import React from 'react';
import { PageId } from '../types';

interface TopbarProps {
  currentPage: PageId;
}

const PAGE_TITLES: Record<PageId, [string, string]> = {
  summary: [
    'Executive Summary',
    'Aged stock exposure, what it costs to clear and where the risk sits'
  ],
  action: [
    'Action Center',
    'SKU × age-band decisions with bulk execution'
  ],
  context: [
    'Context Engine',
    'Ageing thresholds, exit-channel rules and recommendation overrides'
  ],
  config: [
    'Configuration Center',
    'Write-off authority, escalation clocks, automation and notification routing'
  ],
  sim: [
    'Simulation Center',
    'What-if scenarios — what each lever buys, what it costs, and where it peaks'
  ],
  predict: [
    'Predictive Analytics',
    'Forward-looking ageing metrics — what becomes possible with historical data'
  ],
  audit: [
    'Audit Log',
    'Reviewer decisions, assigned and acted on'
  ],
  runs: [
    'Run History',
    'Weekly ageing pipeline execution history and exception trend'
  ]
};

export const Topbar: React.FC<TopbarProps> = ({ currentPage }) => {
  const [title, subtitle] = PAGE_TITLES[currentPage] || PAGE_TITLES.summary;

  return (
    <header className="bg-white border-b border-[#E3EADF] px-6 py-3.5 flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(44,90,30,0.05)] z-20">
      <div>
        <h1 className="text-lg font-bold text-[#2C5A1E] leading-tight">
          {title}
        </h1>
        <p className="text-xs text-[#6B7A66] mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* User Profile Badge */}
      <div
        className="flex items-center gap-3 px-3.5 py-1.5 border border-[#DCE6DA] rounded-full bg-white select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        title="Role-based access · Master Profile"
      >
        {/* Avatar circle */}
        <div className="w-8 h-8 rounded-full bg-[#489930] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
          RN
        </div>

        {/* User details */}
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-bold text-[#1E4F18]">
            Ritwik Naskar
          </span>
          <span className="text-[11px] text-[#5D7258]">
            Master Profile &middot; full access
          </span>
        </div>

        {/* Admin pill */}
        <span className="bg-[#D8ECCF] text-[#1E4F18] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-1">
          ADMIN
        </span>
      </div>
    </header>
  );
};
