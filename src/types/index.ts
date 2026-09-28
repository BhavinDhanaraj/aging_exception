export interface ActionDef {
  code: string;
  label: string;
  owner: string;
  band: 'Healthy' | 'Watch' | 'Aged' | 'Terminal';
  cut: number;
  lane: string;
  auth: string;
  esc: string;
  policy: string;
  desc: string;
}

export interface AuthorityRule {
  lo: number;
  hi: number | null;
  approver: string;
  report: string;
  n?: number;
  v?: number;
}

export interface ExceptionRow {
  rowId: string;
  id: string;
  sku: number;
  cat: string;
  om: string;
  band: 'Healthy' | 'Watch' | 'Aged' | 'Terminal';
  u: number;
  v: number;
  code: string;
  auth: string;
  loss?: number;
  status: 'Pending' | 'Accepted' | 'Modified' | 'Rejected';
  comment?: string;
  owner?: string;
}

export interface CategoryRisk {
  skus: number;
  records: number;
  healthyV: number;
  healthyU: number;
  healthyN: number;
  watchV: number;
  watchU: number;
  watchN: number;
  agedV: number;
  agedU: number;
  agedN: number;
  termV: number;
  termU: number;
  termN: number;
  totalV: number;
  atRiskV: number;
  loss: number;
  recover: number;
  agedPct: number;
}

export interface BandTotal {
  n: number;
  u: number;
  v: number;
}

export interface AuditEntry {
  id: string;
  ts: string;
  sku: number;
  cat: string;
  actor: string;
  action: 'Pending' | 'Accepted' | 'Modified' | 'Rejected';
  prev?: string;
  comment?: string;
  value: number;
  code?: string;
}

export interface RunEntry {
  id: string;
  ts: string;
  trigger: 'Scheduled' | 'Manual';
  status: 'Completed' | 'Running' | 'Failed';
  recs: number;
  exc: number;
  issues: number;
  dur: number;
}

export interface NotificationEntry {
  id: string;
  rowId: string;
  sku: number;
  cat: string;
  band: 'Healthy' | 'Watch' | 'Aged' | 'Terminal';
  v: number;
  code: string;
  owner: string;
  channel: 'Teams' | 'SharePoint';
  sent: string;
  hours: number;
  ack: 'Acknowledged' | 'Not Acknowledged';
  ackAt: string | null;
}

export interface AppConfig {
  days: Record<string, number[]>;
  tier: {
    outlet: number;
    liquidation: number;
    writeoff: number;
    crossbanner: number;
  };
  catAction: Record<string, string>;
  assign: Record<string, string>;
  autoMonitor: boolean;
  autoCap: number;
  teams: boolean;
  sharepoint: boolean;
  email: boolean;
  slaHours: number;
  schedule: string;
  slaClocks: {
    Watch: number;
    Aged: number;
    Terminal: number;
  };
}

export type PageId =
  | 'summary'
  | 'action'
  | 'context'
  | 'config'
  | 'sim'
  | 'predict'
  | 'audit'
  | 'runs';
