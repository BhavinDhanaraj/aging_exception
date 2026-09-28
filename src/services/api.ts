import { ExceptionRow, AuditEntry, RunEntry, AppConfig } from '../types';

export async function fetchBaseData() {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Failed to fetch base data');
  return res.json();
}

export interface ExceptionsQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  cat?: string;
  om?: string;
  band?: string;
  code?: string;
  owner?: string;
  status?: string;
  sortKey?: string;
  sortDir?: number;
}

export async function fetchExceptions(params: ExceptionsQueryParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const res = await fetch(`/api/exceptions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch exceptions');
  return res.json() as Promise<{
    rows: ExceptionRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totV: number;
    totL: number;
    pendCount: number;
  }>;
}

export async function submitDecisions(payload: {
  rowIds: string[];
  status: 'Accepted' | 'Modified' | 'Rejected';
  comment?: string;
  actor?: string;
}) {
  const res = await fetch('/api/decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit decision');
  return res.json();
}

export async function reassignRows(payload: {
  rowIds?: string[];
  cat?: string;
  code?: string;
  owner: string;
}) {
  const res = await fetch('/api/reassign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to reassign');
  return res.json();
}

export async function fetchAuditLog() {
  const res = await fetch('/api/audit');
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json() as Promise<AuditEntry[]>;
}

export async function fetchRunHistory() {
  const res = await fetch('/api/runs');
  if (!res.ok) throw new Error('Failed to fetch run history');
  return res.json() as Promise<RunEntry[]>;
}

export async function triggerManualRun() {
  const res = await fetch('/api/runs/trigger', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger run');
  return res.json() as Promise<RunEntry>;
}

export async function fetchConfig() {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json() as Promise<AppConfig>;
}

export async function updateConfig(config: Partial<AppConfig>) {
  const res = await fetch('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json() as Promise<AppConfig>;
}

export async function sendChatMessage(query: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to get chat response');
  return res.json() as Promise<{ answer: string; source: string }>;
}
