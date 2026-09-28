import React, { useState, useEffect, useCallback } from 'react';
import { PageId, ExceptionRow, AuditEntry, RunEntry, AppConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Drawer } from './components/Drawer';
import { ToastContainer, ToastItem } from './components/Toast';
import { ChatAssistant } from './components/ChatAssistant';

import { ExecutiveSummaryView } from './views/ExecutiveSummaryView';
import { ActionCenterView } from './views/ActionCenterView';
import { ContextEngineView } from './views/ContextEngineView';
import { ConfigurationCenterView } from './views/ConfigurationCenterView';
import { SimulationCenterView } from './views/SimulationCenterView';
import { PredictiveAnalyticsView } from './views/PredictiveAnalyticsView';
import { AuditLogView } from './views/AuditLogView';
import { RunHistoryView } from './views/RunHistoryView';

import { AGING_META } from './data/agingMeta';
import {
  fetchConfig,
  updateConfig,
  fetchAuditLog,
  fetchRunHistory,
  triggerManualRun,
  submitDecisions,
  reassignRows,
  fetchExceptions
} from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('summary');
  const [pendingCount, setPendingCount] = useState<number>(AGING_META.kpi.atRiskN);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<ExceptionRow | null>(null);

  const [config, setConfig] = useState<AppConfig>({
    days: AGING_META.bandsDays,
    tier: AGING_META.tier,
    catAction: {},
    assign: {},
    autoMonitor: true,
    autoCap: 50000,
    teams: true,
    sharepoint: true,
    email: false,
    slaHours: 48,
    schedule: 'Weekly · Monday 06:00',
    slaClocks: {
      Watch: 30,
      Aged: 14,
      Terminal: 7
    }
  });

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'warn' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadInitialData = async () => {
    try {
      const [cfg, audits, rList] = await Promise.all([
        fetchConfig().catch(() => config),
        fetchAuditLog().catch(() => []),
        fetchRunHistory().catch(() => [])
      ]);
      setConfig(cfg);
      setAuditLog(audits);
      setRuns(rList);

      // Check current pending count
      const exRes = await fetchExceptions({ limit: 1 }).catch(() => null);
      if (exRes) {
        setPendingCount(exRes.pendCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshStats = async () => {
    try {
      const [audits, exRes] = await Promise.all([
        fetchAuditLog(),
        fetchExceptions({ limit: 1 })
      ]);
      setAuditLog(audits);
      if (exRes) setPendingCount(exRes.pendCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      const updated = await updateConfig(newConfig);
      setConfig(updated);
    } catch (err) {
      console.error(err);
      setConfig(prev => ({ ...prev, ...newConfig }));
    }
  };

  const handleReassign = async (cat: string, code: string, owner: string) => {
    try {
      await reassignRows({ cat, code, owner });
      const actDef = AGING_META.actions.find(a => a.code === code);
      showToast(`<b>${cat}</b> &middot; ${actDef?.label || code} reassigned to <b>${owner}</b>.`, 'success');
      const updatedConfig = await fetchConfig();
      setConfig(updatedConfig);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrawerDecision = async (status: 'Accepted' | 'Modified' | 'Rejected', comment: string) => {
    if (!selectedRow) return;

    try {
      await submitDecisions({
        rowIds: [selectedRow.rowId],
        status,
        comment
      });
      showToast(
        `<b>${selectedRow.id}</b> marked <b>${status.toLowerCase()}</b> and logged to the audit trail.`,
        status === 'Rejected' ? 'warn' : 'success'
      );
      setSelectedRow(prev => prev ? { ...prev, status, comment } : null);
      refreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerRun = async () => {
    try {
      const newRun = await triggerManualRun();
      setRuns(prev => [newRun, ...prev]);
      showToast(
        `<b>${newRun.id}</b> completed &mdash; ${newRun.recs.toLocaleString()} records re-banded, ${newRun.exc.toLocaleString()} exceptions generated. Read-only run; no source system written.`,
        'success'
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F8F2] overflow-hidden font-sans">
      {/* Sidebar with exact DOS layout & The Warehouse Group branding */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={page => setCurrentPage(page)}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar with Master Profile & TWG logo */}
        <Topbar currentPage={currentPage} />

        {/* View Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {currentPage === 'summary' && (
            <ExecutiveSummaryView
              onReassign={handleReassign}
              assigneesState={config.assign}
              categoryOverrides={config.catAction}
            />
          )}

          {currentPage === 'action' && (
            <ActionCenterView
              actions={AGING_META.actions}
              onSelectRow={row => setSelectedRow(row)}
              onShowToast={showToast}
              onRefreshStats={refreshStats}
            />
          )}

          {currentPage === 'context' && (
            <ContextEngineView
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'config' && (
            <ConfigurationCenterView
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'sim' && (
            <SimulationCenterView
              onShowToast={showToast}
            />
          )}

          {currentPage === 'predict' && (
            <PredictiveAnalyticsView />
          )}

          {currentPage === 'audit' && (
            <AuditLogView
              auditLog={auditLog}
              actions={AGING_META.actions}
            />
          )}

          {currentPage === 'runs' && (
            <RunHistoryView
              runs={runs}
              onTriggerRun={handleTriggerRun}
            />
          )}
        </main>
      </div>

      {/* Decision Detail Drawer */}
      <Drawer
        row={selectedRow}
        actions={AGING_META.actions}
        bandsPolicy={AGING_META.bandsPolicy}
        categoryRisk={AGING_META.catRisk}
        onClose={() => setSelectedRow(null)}
        onDecide={handleDrawerDecision}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />

      {/* Grounded Floating Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}
