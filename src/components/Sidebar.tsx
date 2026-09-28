import React, { useState } from 'react';
import { PageId } from '../types';
import { TWG_LOGO_BASE64 } from '../assets/logo';
import {
  LayoutDashboard,
  Zap,
  Sliders,
  SlidersHorizontal,
  TrendingUp,
  LineChart,
  FileText,
  History,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  pendingCount
}) => {
  const [opsExpanded, setOpsExpanded] = useState<boolean>(true);

  const reportItems: Array<{ key: PageId; label: string; icon: React.ReactNode; badge?: boolean }> = [
    { key: 'summary', label: 'Executive Summary', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'action', label: 'Action Center', icon: <Zap className="w-4 h-4" />, badge: true },
    { key: 'context', label: 'Context Engine', icon: <Sliders className="w-4 h-4" /> },
    { key: 'config', label: 'Configuration Center', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { key: 'sim', label: 'Simulation Center', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'predict', label: 'Predictive Analytics', icon: <LineChart className="w-4 h-4" /> }
  ];

  const opsItems: Array<{ key: PageId; label: string; icon: React.ReactNode }> = [
    { key: 'audit', label: 'Audit Log', icon: <FileText className="w-4 h-4" /> },
    { key: 'runs', label: 'Run History', icon: <History className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-[248px] shrink-0 bg-white border-r border-[#E3EADF] flex flex-col h-screen select-none shadow-[1px_0_3px_rgba(44,90,30,0.04)]">
      {/* Brand Header */}
      <div className="bg-gradient-to-br from-[#234E1A] via-[#2D6421] to-[#204818] p-4 text-white relative overflow-hidden shrink-0 border-b border-[#1E4517]">
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 mb-3.5">
          <img
            src={TWG_LOGO_BASE64}
            alt="The Warehouse Group"
            className="w-full h-auto rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.2)] block border border-white/10"
          />
        </div>
        <div className="relative z-10 font-extrabold text-[15px] leading-tight text-white">
          Aged Stock<br />Action Center
        </div>
        <div className="relative z-10 text-[10.5px] text-[#C5E6B6] mt-1 font-medium">
          Ageing &middot; Markdown &middot; Exit Channels
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider font-extrabold text-[#94A48D]">
          Report
        </div>

        {reportItems.map(item => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-[13.5px] text-left transition-all duration-150 border-l-[3px] ${
                isActive
                  ? 'bg-[#DFEFD7] text-[#2C5A1E] font-bold border-transparent'
                  : 'text-[#26331F] font-semibold border-transparent hover:bg-[#F3F8F1] hover:text-[#2C5A1E] hover:pl-6'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-[#2C5A1E]' : 'text-[#4A5D43]'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="bg-[#D0342C] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingCount.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}

        {/* Collapsible Operations Section */}
        <div
          onClick={() => setOpsExpanded(!opsExpanded)}
          className="flex items-center justify-between px-5 pt-4 pb-2 mt-2 text-[10px] uppercase tracking-wider font-extrabold text-[#94A48D] cursor-pointer border-t border-[#E3EADF] hover:text-[#2C5A1E]"
        >
          <span>Operations</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${
              opsExpanded ? 'rotate-180 text-[#2C5A1E]' : ''
            }`}
          />
        </div>

        {opsExpanded && (
          <div className="animate-fadeIn">
            {opsItems.map(item => {
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-[13.5px] text-left transition-all duration-150 border-l-[3px] ${
                    isActive
                      ? 'bg-[#DFEFD7] text-[#2C5A1E] font-bold border-transparent'
                      : 'text-[#26331F] font-semibold border-transparent hover:bg-[#F3F8F1] hover:text-[#2C5A1E] hover:pl-6'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-[#2C5A1E]' : 'text-[#4A5D43]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
};
