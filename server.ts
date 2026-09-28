import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { AGING_META } from './src/data/agingMeta';
import { OM_BAND, CAT_BAND, CAT_OM_BAND } from './src/data/breakdowns';
import { generateFullExceptions } from './src/data/exceptionsStore';
import { AuditEntry, RunEntry, AppConfig, ExceptionRow } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory data store
let exceptions: ExceptionRow[] = generateFullExceptions();

// Initial seed for audit log
let auditLog: AuditEntry[] = [];
const whoList = ['Brett', 'Vanesse', 'Merch', 'Reagan', 'Tom', 'Graham'];
const actionList: Array<'Accepted' | 'Modified' | 'Rejected'> = ['Accepted', 'Modified', 'Rejected'];
const notes: Record<string, string> = {
  Accepted: 'Approved - exit channel confirmed with the category team.',
  Modified: 'Modified - partial quantity only, balance held for the next promo window.',
  Rejected: 'Rejected - stock committed to an upcoming event, do not action.'
};

const baseDate = new Date(AGING_META.now).getTime();
for (let i = 0; i < 30; i++) {
  const r = exceptions[Math.floor(Math.random() * Math.min(200, exceptions.length))];
  const act = actionList[Math.floor(Math.random() * actionList.length)];
  auditLog.push({
    id: `AUD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    ts: new Date(baseDate - (i + 1) * 3600 * 1000 * Math.ceil(Math.random() * 7)).toISOString(),
    sku: r.sku,
    cat: r.cat,
    actor: whoList[Math.floor(Math.random() * whoList.length)],
    action: act,
    prev: 'Pending',
    comment: notes[act],
    value: r.v,
    code: r.code
  });
}
auditLog.sort((a, b) => b.ts.localeCompare(a.ts));

// Initial seed for run history
let runHistory: RunEntry[] = [];
let baseRecs = 117229;
let baseExc = 33940;
for (let i = 7; i >= 0; i--) {
  baseRecs += 180 + (i % 3) * 30;
  baseExc += 190 + (i % 4) * 45;
  runHistory.push({
    id: `RUN-${611 + (7 - i)}`,
    ts: new Date(baseDate - i * 7 * 86400000).toISOString(),
    trigger: i === 3 ? 'Manual' : 'Scheduled',
    status: 'Completed',
    recs: baseRecs,
    exc: baseExc,
    issues: 9 + ((i * 7) % 26),
    dur: 362 + ((i * 29) % 90)
  });
}
runHistory.reverse();

// Configuration state
let configState: AppConfig = {
  days: JSON.parse(JSON.stringify(AGING_META.bandsDays)),
  tier: { ...AGING_META.tier },
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
};

// --- REST API ENDPOINTS ---

// 1. Get base metadata and totals
app.get('/api/data', (_req, res) => {
  res.json({
    meta: AGING_META,
    omBand: OM_BAND,
    catBand: CAT_BAND,
    catOmBand: CAT_OM_BAND
  });
});

// Helper for effective action code on a row
function getEffectiveCode(r: ExceptionRow): string {
  const ov = configState.catAction[r.cat];
  if (ov && r.code !== 'MONITOR') return ov;
  return r.code;
}

// Helper for effective owner on a row
function getEffectiveOwner(r: ExceptionRow): string {
  const code = getEffectiveCode(r);
  const key = `${r.cat}|${code}`;
  if (configState.assign[key]) return configState.assign[key];
  const act = AGING_META.actions.find(a => a.code === code);
  return act?.owner || 'Merch';
}

// 2. Query exceptions (filters, search, pagination, sort)
app.get('/api/exceptions', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const cat = String(req.query.cat || '');
  const om = String(req.query.om || '');
  const band = String(req.query.band || '');
  const code = String(req.query.code || '');
  const owner = String(req.query.owner || '');
  const status = String(req.query.status || '');
  const sortKey = String(req.query.sortKey || 'v');
  const sortDir = parseInt(String(req.query.sortDir || '-1'), 10);
  const page = parseInt(String(req.query.page || '1'), 10);
  const limit = parseInt(String(req.query.limit || '60'), 10);

  let filtered = exceptions.filter(r => {
    const effCode = getEffectiveCode(r);
    const effOwner = getEffectiveOwner(r);

    if (cat && r.cat !== cat) return false;
    if (om && r.om !== om) return false;
    if (band && r.band !== band) return false;
    if (code && effCode !== code) return false;
    if (owner && effOwner !== owner) return false;
    if (status && r.status !== status) return false;
    if (q) {
      const matchSku = String(r.sku).includes(q);
      const matchCat = r.cat.toLowerCase().includes(q);
      const matchOm = r.om.toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      if (!matchSku && !matchCat && !matchOm && !matchId) return false;
    }
    return true;
  });

  const totV = filtered.reduce((acc, r) => acc + r.v, 0);
  const totL = filtered.reduce((acc, r) => acc + (r.loss || 0), 0);
  const pendCount = filtered.filter(r => r.status === 'Pending').length;

  // Sorting
  filtered.sort((a, b) => {
    let valA: any = a[sortKey as keyof ExceptionRow];
    let valB: any = b[sortKey as keyof ExceptionRow];

    if (sortKey === 'owner') {
      valA = getEffectiveOwner(a);
      valB = getEffectiveOwner(b);
    } else if (sortKey === 'code') {
      valA = getEffectiveCode(a);
      valB = getEffectiveCode(b);
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * sortDir;
    }
    return String(valA || '').localeCompare(String(valB || '')) * sortDir;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * limit;
  const paginatedRows = filtered.slice(startIndex, startIndex + limit).map(r => ({
    ...r,
    code: getEffectiveCode(r),
    owner: getEffectiveOwner(r)
  }));

  res.json({
    rows: paginatedRows,
    total,
    page: currentPage,
    limit,
    totalPages,
    totV,
    totL,
    pendCount
  });
});

// 3. Make single or bulk decision
app.post('/api/decisions', (req, res) => {
  const { rowIds, status, comment, actor } = req.body;
  if (!Array.isArray(rowIds) || !rowIds.length || !status) {
    return res.status(400).json({ error: 'Missing rowIds or status' });
  }

  const defaultNote = status === 'Accepted'
    ? 'Approved - exit channel confirmed with the category team.'
    : status === 'Modified'
      ? 'Modified - partial quantity only, balance retained.'
      : 'Rejected - retained pending category review.';

  let affectedValue = 0;
  const updatedRows: ExceptionRow[] = [];

  rowIds.forEach(id => {
    const row = exceptions.find(r => r.rowId === id || r.id === id);
    if (row) {
      const prev = row.status;
      row.status = status;
      row.comment = comment || defaultNote;
      affectedValue += row.v;
      updatedRows.push(row);

      auditLog.unshift({
        id: `AUD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        ts: new Date().toISOString(),
        sku: row.sku,
        cat: row.cat,
        actor: actor || getEffectiveOwner(row),
        action: status,
        prev,
        comment: row.comment,
        value: row.v,
        code: getEffectiveCode(row)
      });
    }
  });

  res.json({
    success: true,
    updatedCount: updatedRows.length,
    affectedValue,
    status
  });
});

// 4. Reassign owners
app.post('/api/reassign', (req, res) => {
  const { rowIds, cat, code, owner } = req.body;
  if (!owner) return res.status(400).json({ error: 'Missing owner' });

  if (cat && code) {
    configState.assign[`${cat}|${code}`] = owner;
    return res.json({ success: true, key: `${cat}|${code}`, owner });
  }

  if (Array.isArray(rowIds)) {
    rowIds.forEach(id => {
      const row = exceptions.find(r => r.rowId === id || r.id === id);
      if (row) {
        configState.assign[`${row.cat}|${getEffectiveCode(row)}`] = owner;
      }
    });
    return res.json({ success: true, count: rowIds.length, owner });
  }

  res.status(400).json({ error: 'Invalid parameters' });
});

// 5. Audit Log
app.get('/api/audit', (_req, res) => {
  res.json(auditLog);
});

// 6. Run History
app.get('/api/runs', (_req, res) => {
  res.json(runHistory);
});

app.post('/api/runs/trigger', (_req, res) => {
  const last = runHistory[0];
  const newRun: RunEntry = {
    id: `RUN-${parseInt(last.id.split('-')[1], 10) + 1}`,
    ts: new Date().toISOString(),
    trigger: 'Manual',
    status: 'Completed',
    recs: last.recs + 140,
    exc: last.exc + 165,
    issues: 11,
    dur: 377
  };
  runHistory.unshift(newRun);
  res.json(newRun);
});

// 7. Config Center
app.get('/api/config', (_req, res) => {
  res.json(configState);
});

app.put('/api/config', (req, res) => {
  configState = {
    ...configState,
    ...req.body
  };
  res.json(configState);
});

// 8. Grounded Chat Query
app.post('/api/chat', (req, res) => {
  const query = String(req.body.query || '').trim().toLowerCase();
  const totalAtRisk = AGING_META.kpi.atRiskV;
  const totalBook = AGING_META.kpi.totalV;
  const agedVal = AGING_META.bandTot.Aged.v;
  const termVal = AGING_META.bandTot.Terminal.v;
  const watchVal = AGING_META.bandTot.Watch.v;
  const totalLoss = AGING_META.kpi.loss;
  const totalRecover = AGING_META.kpi.recover;

  const src = "Audited Aging_SKU extract & Inventory Management Policy v2.0 (s8.1 - s8.4)";

  if (/capital|locked|tied up|how much.*aged|aged stock %|percentage/.test(query)) {
    return res.json({
      answer: `<b>$${(totalAtRisk / 1e6).toFixed(2)}M</b> of the <b>$${(totalBook / 1e6).toFixed(2)}M</b> inventory book has aged past its policy band — an Aged Stock percentage of <b>${(totalAtRisk / totalBook * 100).toFixed(1)}%</b>, which is the s9.3 working capital KPI reported monthly to ELT.<br><br>
• <b>$${(agedVal / 1e6).toFixed(2)}M</b> in the Aged band (${AGING_META.bandTot.Aged.n.toLocaleString()} rows, ${AGING_META.bandTot.Aged.u.toLocaleString()} units) — mandatory markdown of at least 15%.<br>
• <b>$${(termVal / 1e6).toFixed(2)}M</b> in Terminal (${AGING_META.bandTot.Terminal.n.toLocaleString()} rows) — at least 30%, clearance, or write-down.<br><br>
Behind both sits <b>$${(watchVal / 1e6).toFixed(2)}M</b> in the Watch band, which is <b>${(watchVal / totalAtRisk).toFixed(1)}×</b> the current at-risk position.`,
      source: src
    });
  }

  if (/cost to clear|what does it cost|clear it|how much.*clear/.test(query)) {
    return res.json({
      answer: `Clearing the aged position at the policy minimums costs <b>$${(totalLoss / 1e6).toFixed(2)}M</b> and returns <b>$${(totalRecover / 1e6).toFixed(2)}M</b> of working capital.<br><br>
• Aged: $${(agedVal / 1e6).toFixed(2)}M × 15% = <b>$${(agedVal * 0.15 / 1e6).toFixed(2)}M</b><br>
• Terminal: $${(termVal / 1e6).toFixed(2)}M × 30% = <b>$${(termVal * 0.30 / 1e6).toFixed(2)}M</b><br><br>
Policy s8.3 requires the highest-recovery viable channel first: in-banner markdown, cross-banner transfer, outlet clearance, bulk liquidation, donation, write-off.`,
      source: src
    });
  }

  if (/action first|priority|where.*start|which category/.test(query)) {
    const sortedCats = Object.entries(AGING_META.catRisk)
      .map(([cat, data]) => ({ cat, ...data }))
      .sort((a, b) => b.atRiskV - a.atRiskV);
    const top4 = sortedCats.slice(0, 4);

    return res.json({
      answer: `<b>${top4[0].cat}</b> is highest priority — <b>$${(top4[0].atRiskV / 1e6).toFixed(2)}M</b> aged and terminal (${top4[0].agedPct}% of category value).<br><br>` +
        top4.map((x, i) => `${i + 1}. <b>${x.cat}</b> — $${(x.atRiskV / 1e6).toFixed(2)}M ($${(x.agedV / 1e6).toFixed(2)}M Aged, $${(x.termV / 1e6).toFixed(2)}M Terminal), ${x.agedPct}% aged`).join('<br>') +
        `<br><br>Ranking is by absolute value at risk. Apparel and Home hold over 44% of the Group's total exposure.`,
      source: src
    });
  }

  if (/watch band|early warning|prevent|upstream/.test(query)) {
    return res.json({
      answer: `The Watch band holds <b>$${(watchVal / 1e6).toFixed(2)}M</b> — <b>${(watchVal / totalBook * 100).toFixed(1)}%</b> of the total inventory book and <b>${(watchVal / totalAtRisk).toFixed(1)}×</b> the combined Aged and Terminal position.<br><br>
Under Policy s8.2, stock in the Watch band mandates a sell-through acceleration plan built by the Category Planning Manager, escalating to the Head of Planning at 30 days. Intervening here prevents stock from crossing into the Aged band where mandatory 15%+ markdowns take effect.`,
      source: src
    });
  }

  if (/fast fashion|terminal stock|why.*terminal|which operating model|ages worst/.test(query)) {
    const ffTerminal = OM_BAND['Fast Fashion|Terminal'];
    return res.json({
      answer: `Fast Fashion carries essentially the entire Terminal position — <b>$${(ffTerminal.v / 1e6).toFixed(2)}M</b> across ${ffTerminal.n.toLocaleString()} rows.<br><br>
This is a threshold effect defined in Policy s8.1: Fast Fashion reaches Terminal at <b>60 days post phase</b>, whereas Replen Tail does not reach Terminal until <b>540 days</b>. Fast Fashion lines have no second season, so ageing rules trigger significantly faster.`,
      source: src
    });
  }

  if (/sla|breach|overdue|escalat|pending activit/.test(query)) {
    return res.json({
      answer: `Under Policy s8.2, Aged stock has an escalation clock of <b>14 days</b> (escalating to the CPO) and Terminal stock has <b>7 days</b> (escalating to the ELT). Stock in Watch escalates at <b>30 days</b> to the Head of Planning. Decisions can be logged directly in the Action Center.`,
      source: src
    });
  }

  if (/approve|authority|sign-off|sign off|who needs|cpo|board|governance/.test(query)) {
    return res.json({
      answer: `Write-off and provisioning authority escalates by value per event under Policy s8.4:<br><br>
• <b>Up to $50K</b>: Head of Planning (Monthly summary to CPO + GCSCO)<br>
• <b>$50K – $250K</b>: CPO + GCSCO + CFO (Monthly ELT report)<br>
• <b>$250K – $1M</b>: CEO (ELT and Audit & Risk Committee)<br>
• <b>Above $1M</b>: Board Audit & Risk Committee (Full board visibility)<br><br>
Over 98% of rows clear within the Head of Planning tier.`,
      source: src
    });
  }

  // Fallback answer
  return res.json({
    answer: `I can answer specific questions on the aged stock position ($${(totalAtRisk / 1e6).toFixed(2)}M at risk), cost to clear ($${(totalLoss / 1e6).toFixed(2)}M), category risk ranking, Watch band sell-through, operating model thresholds, and Policy s8.4 approval tiers. Please try one of the suggested prompts below.`,
    source: src
  });
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
