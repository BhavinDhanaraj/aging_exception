import React, { useState, useEffect, useMemo } from 'react';
import { ExceptionRow, ActionDef } from '../types';
import { fetchExceptions, submitDecisions, reassignRows } from '../services/api';
import { fmtMoney, fmtNum } from '../utils/formatters';
import { Check, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActionCenterViewProps {
  actions: ActionDef[];
  onSelectRow: (row: ExceptionRow) => void;
  onShowToast: (message: string, type?: 'success' | 'warn') => void;
  onRefreshStats: () => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  actions,
  onSelectRow,
  onShowToast,
  onRefreshStats
}) => {
  const [rows, setRows] = useState<ExceptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(60);
  const [totalPages, setTotalPages] = useState(1);
  const [totV, setTotV] = useState(0);
  const [totL, setTotL] = useState(0);
  const [pendCount, setPendCount] = useState(0);

  // Filters
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [om, setOm] = useState('');
  const [band, setBand] = useState('');
  const [code, setCode] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState('');

  // Sort
  const [sortKey, setSortKey] = useState<string>('v');
  const [sortDir, setSortDir] = useState<number>(-1);

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const ASSIGNEES = ['Brett', 'Vanesse', 'Merch', 'Reagan', 'Tom', 'Graham'];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchExceptions({
        page,
        limit,
        q,
        cat,
        om,
        band,
        code,
        owner,
        status,
        sortKey,
        sortDir
      });
      setRows(res.rows);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setTotV(res.totV);
      setTotL(res.totL);
      setPendCount(res.pendCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, q, cat, om, band, code, owner, status, sortKey, sortDir]);

  const handleClearFilters = () => {
    setQ('');
    setCat('');
    setOm('');
    setBand('');
    setCode('');
    setOwner('');
    setStatus('');
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 1 ? -1 : 1);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
    setPage(1);
  };

  const toggleSelectRow = (e: React.MouseEvent, rowId: string) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const toggleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentPageIds = rows.map(r => r.rowId);
    const allSelected = currentPageIds.every(id => selectedIds.has(id));

    setSelectedIds(prev => {
      const next = new Set(prev);
      currentPageIds.forEach(id => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const handleBulkDecide = async (decisionStatus: 'Accepted' | 'Modified' | 'Rejected') => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    try {
      const res = await submitDecisions({
        rowIds: ids,
        status: decisionStatus
      });
      onShowToast(
        `<b>${fmtNum(ids.length)}</b> row${ids.length === 1 ? '' : 's'} ${decisionStatus.toLowerCase()} &middot; ${fmtMoney(res.affectedValue)} of value logged to audit trail.`,
        decisionStatus === 'Rejected' ? 'warn' : 'success'
      );
      setSelectedIds(new Set());
      loadData();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkReassign = async (newOwner: string) => {
    if (!newOwner) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    try {
      await reassignRows({ rowIds: ids, owner: newOwner });
      onShowToast(`<b>${fmtNum(ids.length)}</b> rows reassigned to <b>${newOwner}</b>.`, 'success');
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedRowsList = useMemo(() => {
    return rows.filter(r => selectedIds.has(r.rowId));
  }, [rows, selectedIds]);

  const selectedValue = useMemo(() => {
    return selectedRowsList.reduce((acc, r) => acc + r.v, 0);
  }, [selectedRowsList]);

  const selectedLoss = useMemo(() => {
    return selectedRowsList.reduce((acc, r) => acc + (r.loss || 0), 0);
  }, [selectedRowsList]);

  const allOnPageSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.rowId));

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Config note */}
      <div className="config-note">
        <b>Action Center.</b> Every Aged and Terminal SKU&times;band row carries a mandated action under policy s8.2 and a routed decision owner. Tick rows to accept, modify, reject or reassign in bulk. The top 5,200 rows by value are loaded here out of 35,371 in the full population &mdash; category and operating-model totals elsewhere reflect all of them.
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E3EADF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Rows in view
          </div>
          <div className="text-2xl font-bold text-[#2C5A1E] mt-1.5">
            {fmtNum(total)}
          </div>
          <div className="text-xs text-[#6B7A66] mt-1">
            of 5,200 loaded
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#D0342C] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Value at cost
          </div>
          <div className="text-2xl font-bold text-[#1B2418] mt-1.5">
            {fmtMoney(totV)}
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#E8A317] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Cost to clear
          </div>
          <div className="text-2xl font-bold text-[#1B2418] mt-1.5">
            {fmtMoney(totL)}
          </div>
        </div>

        <div className="bg-white border border-[#E3EADF] border-t-3 border-t-[#2E8B3D] rounded-xl p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7A66]">
            Awaiting decision
          </div>
          <div className="text-2xl font-bold text-[#1B2418] mt-1.5">
            {fmtNum(pendCount)}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-2.5 bg-white p-3.5 border border-[#E3EADF] rounded-xl shadow-xs text-xs">
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Search</label>
          <input
            type="text"
            placeholder="SKU, category or alert ID"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Category</label>
          <select
            value={cat}
            onChange={e => { setCat(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All categories</option>
            {['Apparel', 'Automotive & DIY', 'Footwear', 'Grocery & Consumables', 'Health & Beauty', 'Home', 'Office Furniture & Storage', 'Party Celebrations & Cards', 'Pet Care', 'Sports Outdoor & Leisure', 'Tech & Print Consumables', 'Toys', 'Work Study & Create'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Operating Model</label>
          <select
            value={om}
            onChange={e => { setOm(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All models</option>
            {['Continuity Core', 'Fast Fashion', 'MTE', 'Replen Tail'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Age Band</label>
          <select
            value={band}
            onChange={e => { setBand(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">Aged + Terminal</option>
            <option value="Aged">Aged</option>
            <option value="Terminal">Terminal</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Action</label>
          <select
            value={code}
            onChange={e => { setCode(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All actions</option>
            {actions.filter(a => a.code !== 'MONITOR').map(a => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Decision Owner</label>
          <select
            value={owner}
            onChange={e => { setOwner(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All owners</option>
            {ASSIGNEES.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[110px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Decision</label>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Modified">Modified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          className="btn btn-danger btn-sm"
        >
          Clear filters
        </button>
      </div>

      {/* Bulk Action Bar when rows are selected */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-[#2C5A1E] to-[#3F7D2C] text-white rounded-xl p-3 shadow-md flex items-center justify-between gap-4 flex-wrap animate-fadeIn text-xs">
          <div className="font-extrabold text-sm">
            {fmtNum(selectedIds.size)} row{selectedIds.size === 1 ? '' : 's'} selected
          </div>
          <div className="text-[#DFF2D6] hidden md:block">
            {fmtMoney(selectedValue)} at cost &middot; {fmtMoney(selectedLoss)} cost to clear
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkDecide('Accepted')}
              className="px-3 py-1.5 bg-[#E9F7E7] text-[#22702F] font-bold rounded-md hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Accept all
            </button>
            <button
              onClick={() => handleBulkDecide('Modified')}
              className="px-3 py-1.5 bg-[#FDF6E4] text-[#8A6208] font-bold rounded-md hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Modify all
            </button>
            <button
              onClick={() => handleBulkDecide('Rejected')}
              className="px-3 py-1.5 bg-[#FCE7E5] text-[#9B1C16] font-bold rounded-md hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reject all
            </button>
            <select
              className="bg-white text-gray-800 rounded-md px-2.5 py-1.5 text-xs font-semibold cursor-pointer border border-white/40"
              onChange={e => {
                if (e.target.value) {
                  handleBulkReassign(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Reassign to...</option>
              {ASSIGNEES.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-white/80 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Table Panel */}
      <div className="bg-white border border-[#E3EADF] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#E3EADF]">
          <span className="text-sm font-bold text-[#2C5A1E]">
            Aged & Terminal SKU &times; band rows
          </span>
          <span className="text-xs text-[#6B7A66]">
            Click a row for the full record and decision panel
          </span>
        </div>

        <div className="overflow-x-auto max-h-[560px]">
          <table className="dtable">
            <thead>
              <tr>
                <th className="w-9 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#62B146] cursor-pointer"
                    checked={allOnPageSelected}
                    onChange={e => toggleSelectAll(e as any)}
                  />
                </th>
                <th className="sortable" onClick={() => handleSort('sku')}>
                  SKU ID
                  <span className={`sort-caret ${sortKey === 'sku' ? 'on' : ''}`}>
                    {sortKey === 'sku' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('cat')}>
                  Category
                  <span className={`sort-caret ${sortKey === 'cat' ? 'on' : ''}`}>
                    {sortKey === 'cat' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('om')}>
                  Operating Model
                  <span className={`sort-caret ${sortKey === 'om' ? 'on' : ''}`}>
                    {sortKey === 'om' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('band')}>
                  Age Band
                  <span className={`sort-caret ${sortKey === 'band' ? 'on' : ''}`}>
                    {sortKey === 'band' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('code')}>
                  Recommended Action
                  <span className={`sort-caret ${sortKey === 'code' ? 'on' : ''}`}>
                    {sortKey === 'code' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('owner')}>
                  Decision Owner
                  <span className={`sort-caret ${sortKey === 'owner' ? 'on' : ''}`}>
                    {sortKey === 'owner' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('u')}>
                  Units
                  <span className={`sort-caret ${sortKey === 'u' ? 'on' : ''}`}>
                    {sortKey === 'u' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('v')}>
                  Value At Cost
                  <span className={`sort-caret ${sortKey === 'v' ? 'on' : ''}`}>
                    {sortKey === 'v' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('loss')}>
                  Cost To Clear
                  <span className={`sort-caret ${sortKey === 'loss' ? 'on' : ''}`}>
                    {sortKey === 'loss' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('auth')}>
                  Approval Level
                  <span className={`sort-caret ${sortKey === 'auth' ? 'on' : ''}`}>
                    {sortKey === 'auth' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('status')}>
                  Decision
                  <span className={`sort-caret ${sortKey === 'status' ? 'on' : ''}`}>
                    {sortKey === 'status' ? (sortDir > 0 ? '▲' : '▼') : '▾'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-[#6B7A66]">
                    Loading rows...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-[#6B7A66]">
                    No rows match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map(r => {
                  const isSelected = selectedIds.has(r.rowId);
                  const actDef = actions.find(a => a.code === r.code);

                  return (
                    <tr
                      key={r.rowId}
                      className={`clickable ${isSelected ? 'row-sel' : ''}`}
                      onClick={() => onSelectRow(r)}
                    >
                      <td className="text-center" onClick={e => toggleSelectRow(e, r.rowId)}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#62B146] cursor-pointer"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                      </td>
                      <td className="mono">{r.sku}</td>
                      <td>{r.cat}</td>
                      <td>{r.om}</td>
                      <td>
                        <span className={`badge ${r.band === 'Aged' ? 'b-aged' : 'b-terminal'}`}>
                          <span
                            className="badge-dot"
                            style={{ background: r.band === 'Aged' ? '#D0342C' : '#6B1FA0' }}
                          />
                          {r.band}
                        </span>
                      </td>
                      <td>
                        <b>{actDef?.label || r.code}</b>
                        <div className="text-[11px] text-[#6B7A66]">
                          {actDef?.policy || 's8.2'}
                        </div>
                      </td>
                      <td>
                        <span className="owner-chip">
                          {r.owner || actDef?.owner || 'Merch'}
                        </span>
                      </td>
                      <td>{fmtNum(r.u)}</td>
                      <td><b>{fmtMoney(r.v)}</b></td>
                      <td>{fmtMoney(r.loss || r.v * (actDef?.cut || 0.15))}</td>
                      <td className="text-[#6B7A66]">{r.auth}</td>
                      <td>
                        <span
                          className={`badge ${
                            r.status === 'Accepted'
                              ? 'badge-accepted'
                              : r.status === 'Modified'
                              ? 'badge-modified'
                              : r.status === 'Rejected'
                              ? 'badge-rejected'
                              : 'badge-pending'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-5 py-3 border-t border-[#E3EADF] flex items-center justify-between text-xs text-[#6B7A66]">
          <span>
            Showing {fmtNum(rows.length)} of {fmtNum(total)} rows
          </span>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="btn btn-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="font-semibold text-[#1B2418]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="btn btn-sm"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
