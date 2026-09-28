import React, { useState } from 'react';
import { AGING_META } from '../data/agingMeta';
import { OM_BAND, CAT_BAND, CAT_OM_BAND } from '../data/breakdowns';
import { fmtMoney } from '../utils/formatters';

interface SimulationCenterViewProps {
  onShowToast: (message: string, type?: 'success' | 'warn') => void;
}

export const SimulationCenterView: React.FC<SimulationCenterViewProps> = ({ onShowToast }) => {
  const meta = AGING_META;
  const [simScope, setSimScope] = useState<{ cat: string; om: string }>({ cat: '', om: '' });
  const [depth, setDepth] = useState<number>(25);
  const [timing, setTiming] = useState<number>(35);
  const [mix, setMix] = useState<number>(40);

  // Compute scoped pools
  const pools = () => {
    let aged = 0;
    let term = 0;
    let watch = 0;

    if (simScope.om) {
      Object.keys(CAT_OM_BAND).forEach(key => {
        const [pCat, pOm, pBand] = key.split('|');
        if (simScope.cat && pCat !== simScope.cat) return;
        if (pOm !== simScope.om) return;
        const v = CAT_OM_BAND[key].v || 0;
        if (pBand === 'Aged') aged += v;
        else if (pBand === 'Terminal') term += v;
        else if (pBand === 'Watch') watch += v;
      });
    } else {
      Object.keys(CAT_BAND).forEach(key => {
        const [pCat, pBand] = key.split('|');
        if (simScope.cat && pCat !== simScope.cat) return;
        const v = CAT_BAND[key].v || 0;
        if (pBand === 'Aged') aged += v;
        else if (pBand === 'Terminal') term += v;
        else if (pBand === 'Watch') watch += v;
      });
    }
    return { aged, term, watch, pool: aged + term };
  };

  const b = pools();
  const isScoped = Boolean(simScope.cat || simScope.om);

  // 1. Markdown depth economic model
  const mdModel = (poolVal: number, dPct: number) => {
    const d = dPct / 100;
    const clear = Math.min(1, 0.25 + 0.95 * (1 - Math.exp(-3.0 * d)));
    const g = poolVal * clear * (1 - d);
    const c = poolVal * clear * d + poolVal * (1 - clear) * 0.55;
    return { g, c, clear, sold: poolVal * clear };
  };

  // 2. Early intervention on Watch band economic model
  const timingModel = (watchVal: number, wPct: number) => {
    const w = wPct / 100;
    const MAXW = 0.60;
    const g = watchVal * 0.15 * (1 - Math.exp(-2.8 * w)) / (1 - Math.exp(-2.8 * MAXW));
    const c = watchVal * (0.012 * w + 0.55 * Math.pow(w, 3));
    return { g, c, touched: watchVal * w };
  };

  // 3. Exit channel mix economic model
  const mixModel = (termVal: number, mPct: number) => {
    const m = mPct / 100;
    const g = termVal * 0.38 * (1 - Math.exp(-2.4 * m)) / (1 - Math.exp(-2.4));
    const c = termVal * (0.05 * m + 0.72 * Math.pow(m, 3.2));
    return { g, c, moved: termVal * m };
  };

  // Optimizer helper
  const optimize = (fn: (val: number, step: number) => { g: number; c: number }, val: number, lo: number, hi: number, step: number) => {
    const pts: Array<{ x: number; n: number }> = [];
    let best = -Infinity;
    let bx = lo;
    for (let x = lo; x <= hi + 1e-9; x += step) {
      const res = fn(val, x);
      const n = res.g - res.c;
      pts.push({ x, n });
      if (n > best) {
        best = n;
        bx = x;
      }
    }
    return { pts, best, bx };
  };

  const o1 = optimize((v, x) => mdModel(v, x), b.pool, 15, 70, 1);
  const r1 = mdModel(b.pool, depth);
  const n1 = r1.g - r1.c;

  const o2 = optimize((v, x) => timingModel(v, x), b.watch, 0, 60, 1);
  const r2 = timingModel(b.watch, timing);
  const n2 = r2.g - r2.c;

  const o3 = optimize((v, x) => mixModel(v, x), b.term, 0, 100, 2);
  const r3 = mixModel(b.term, mix);
  const n3 = r3.g - r3.c;

  // Render SVG curve with peak optimum and current point
  const renderCurve = (optRes: { pts: Array<{ x: number; n: number }>; best: number; bx: number }, curVal: number, id: string) => {
    const W2 = 400;
    const H = 132;
    const PL = 50;
    const PB = 24;
    const PT = 12;
    const PR = 10;

    const xs = optRes.pts.map(p => p.x);
    const x0 = xs[0];
    const x1 = xs[xs.length - 1];
    const ns = optRes.pts.map(p => p.n);
    const nMin = Math.min(...ns, 0);
    const nMax = Math.max(...ns);
    const span = nMax - nMin || 1;

    const X = (x: number) => PL + ((x - x0) / (x1 - x0 || 1)) * (W2 - PL - PR);
    const Y = (n: number) => PT + (1 - (n - nMin) / span) * (H - PT - PB);

    const path = optRes.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.n).toFixed(1)}`).join(' ');
    const area = `${path} L${X(x1).toFixed(1)},${Y(nMin).toFixed(1)} L${X(x0).toFixed(1)},${Y(nMin).toFixed(1)} Z`;

    const optX = X(optRes.bx);
    const optY = Y(optRes.best);

    const curR = optRes.pts.reduce((prev, curr) => (
      Math.abs(curr.x - curVal) < Math.abs(prev.x - curVal) ? curr : prev
    ), optRes.pts[0]);

    return (
      <svg width="100%" viewBox={`0 0 ${W2} ${H}`} className="block">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#62B146" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#62B146" stopOpacity="0" />
          </linearGradient>
        </defs>
        {nMin < 0 && (
          <line
            x1={PL}
            y1={Y(0)}
            x2={W2 - PR}
            y2={Y(0)}
            stroke="#D0342C"
            strokeDasharray="3 3"
          />
        )}
        <path d={area} fill={`url(#grad-${id})`} />
        <path d={path} fill="none" stroke="#3F7D2C" strokeWidth="2.4" strokeLinejoin="round" />
        <line
          x1={optX}
          y1={PT}
          x2={optX}
          y2={H - PB}
          stroke="#1E3E14"
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
        <circle cx={optX} cy={optY} r={5} fill="#1E3E14" stroke="#fff" strokeWidth={2} />
        <text
          x={Math.min(W2 - 66, optX + 7)}
          y={PT + 10}
          fontSize="9.5"
          fontWeight="800"
          fill="#1E3E14"
        >
          peak {Math.round(optRes.bx)}%
        </text>
        <circle cx={X(curR.x)} cy={Y(curR.n)} r={4.5} fill="#E8A317" stroke="#fff" strokeWidth={2} />
        <text x={PL} y={H - 7} fontSize="9" fill="#6B7A66">{Math.round(x0)}%</text>
        <text x={W2 - PR} y={H - 7} fontSize="9" textAnchor="end" fill="#6B7A66">{Math.round(x1)}%</text>
        <text x={PL - 6} y={Y(nMax) + 4} fontSize="9" textAnchor="end" fill="#6B7A66">{fmtMoney(nMax)}</text>
        <text x={PL - 6} y={Y(nMin) + 4} fontSize="9" textAnchor="end" fill="#6B7A66">{fmtMoney(nMin)}</text>
      </svg>
    );
  };

  const handleJump = (setter: (v: number) => void, val: number, name: string) => {
    setter(val);
    onShowToast(`Moved ${name} to optimum: <b>${Math.round(val)}%</b>.`, 'success');
  };

  const handleReset = () => {
    setDepth(25);
    setTiming(35);
    setMix(40);
    setSimScope({ cat: '', om: '' });
    onShowToast('Scenarios reset to default positions.', 'warn');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      <div className="config-note">
        <b>Simulation Center.</b> Three levers, each with a cost that accelerates as you push it. Gain is concave (the easy win first), cost is convex (pain accelerates) &mdash; so every lever has a <b>genuine optimum in the middle</b>, marked on each curve. Computed live off the current aged position; nothing writes back to the rule set, ERP or WMS.
      </div>

      {/* Scope Selector */}
      <div className="bg-white p-3.5 border border-[#E3EADF] rounded-xl shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Category</label>
          <select
            value={simScope.cat}
            onChange={e => setSimScope(prev => ({ ...prev, cat: e.target.value }))}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All categories</option>
            {meta.cats.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[11px] uppercase font-bold text-[#6B7A66]">Operating Model</label>
          <select
            value={simScope.om}
            onChange={e => setSimScope(prev => ({ ...prev, om: e.target.value }))}
            className="border border-[#E3EADF] rounded-md px-3 py-1.5 bg-white text-[#1B2418] focus:outline-hidden focus:border-[#62B146]"
          >
            <option value="">All models</option>
            {meta.oms.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-sm self-end"
        >
          Reset
        </button>

        <div className="text-xs text-[#6B7A66] self-center ml-auto">
          Scope: <b className="text-[#2C5A1E]">{isScoped ? `${simScope.cat || 'All categories'} · ${simScope.om || 'All models'}` : 'Whole book'}</b>
          &nbsp;&middot;&nbsp; {fmtMoney(b.pool)} aged + terminal, {fmtMoney(b.watch)} in Watch
        </div>
      </div>

      {/* Scenario 1: Markdown depth on aged stock */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-extrabold text-[#2C5A1E] mb-1">
          <div className="flex items-center gap-2">
            1 &middot; Markdown depth on aged stock
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white ${Math.abs(depth - o1.bx) <= 2 ? 'bg-[#2E8B3D]' : 'bg-[#2C5A1E]'}`}>
              {Math.abs(depth - o1.bx) <= 2 ? '✓ at optimum' : `◆ optimum ${Math.round(o1.bx)}%`}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#6B7A66] mb-3">
          Deeper cuts clear more units &mdash; but concede more margin on every one, and whatever still does not clear ages on toward a full write-down.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          <div className="lg:col-span-7 space-y-3">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#6B7A66] uppercase">Markdown depth</span>
                <span className="text-xl font-extrabold text-[#2C5A1E]">{depth}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={70}
                step={5}
                value={depth}
                onChange={e => setDepth(Number(e.target.value))}
                className="w-full mt-2 accent-[#62B146] cursor-pointer"
              />
              <div className="text-xs text-[#6B7A66] mt-1">
                Policy s8.2 floor is 15% at Aged, 30% at Terminal. {fmtMoney(b.pool)} of aged + terminal stock in scope; <b>{(r1.clear * 100).toFixed(0)}%</b> ({fmtMoney(r1.sold)}) clears at this depth.
              </div>
            </div>

            {/* Trade-off boxes */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-[#E9F7E7] border border-[#C6E6C0] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#22702F] uppercase">▲ Cash recovered</div>
                <div className="text-base font-extrabold text-[#1B2418] my-0.5">{fmtMoney(r1.g)}</div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">Clearance response rises steeply at first then flattens.</div>
              </div>
              <div className="bg-[#FCE7E5] border border-[#F4C9C5] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#9B1C16] uppercase">▼ Margin + residual</div>
                <div className="text-base font-extrabold text-[#1B2418] my-0.5">{fmtMoney(r1.c)}</div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">Discount conceded on sold units + {fmtMoney(b.pool * (1 - r1.clear))} unsold residual.</div>
              </div>
              <div className="bg-[#EEF7EA] border border-[#DCEFD4] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#2C5A1E] uppercase">= Net</div>
                <div className={`text-base font-extrabold my-0.5 ${n1 >= 0 ? 'text-[#22702F]' : 'text-[#9B1C16]'}`}>
                  {n1 >= 0 ? '+' : ''}{fmtMoney(n1)}
                </div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">at {depth}% markdown depth</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gray-50/70 p-3 rounded-lg border border-[#E3EADF] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#2C5A1E] uppercase tracking-wide">
                Net position across the range
              </div>
              <div className="text-[10.5px] text-[#6B7A66] mb-1">
                Peak in dark green, your current setting in amber.
              </div>
              {renderCurve(o1, depth, 'depth')}
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
          Math.abs(depth - o1.bx) <= 2
            ? 'bg-[#E9F7E7] border-[#C6E6C0] text-[#22702F]'
            : depth > o1.bx
            ? 'bg-[#FCE7E5] border-[#F4C9C5] text-[#9B1C16]'
            : 'bg-[#FDF6E4] border-[#F3E2BC] text-[#8A6208]'
        }`}>
          {Math.abs(depth - o1.bx) <= 2 ? (
            <div>
              <b>You are at the optimum.</b> {depth}% returns {fmtMoney(n1)} net &mdash; the best available on this lever. Moving either way costs you margin.
            </div>
          ) : (
            <div>
              <b>{depth > o1.bx ? 'You have pushed past the optimum.' : 'You are short of the optimum.'}</b> At {depth}%, net is {fmtMoney(n1)}; the peak is <b>{Math.round(o1.bx)}%</b> at {fmtMoney(o1.best)}.
              {' '}
              <button
                onClick={() => handleJump(setDepth, o1.bx, 'Markdown depth')}
                className="underline font-bold cursor-pointer ml-1"
              >
                Move to {Math.round(o1.bx)}% &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scenario 2: Intervene earlier at Watch band */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-extrabold text-[#2C5A1E] mb-1">
          <div className="flex items-center gap-2">
            2 &middot; Intervene earlier, at the Watch band
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white ${Math.abs(timing - o2.bx) <= 2 ? 'bg-[#2E8B3D]' : 'bg-[#2C5A1E]'}`}>
              {Math.abs(timing - o2.bx) <= 2 ? '✓ at optimum' : `◆ optimum ${Math.round(o2.bx)}%`}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#6B7A66] mb-3">
          The cheapest dollar is one that never reaches the Aged band. But act too early and you are discounting stock that would have sold at full price anyway.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          <div className="lg:col-span-7 space-y-3">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#6B7A66] uppercase">Act early on</span>
                <span className="text-xl font-extrabold text-[#2C5A1E]">{timing}% of Watch stock</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={timing}
                onChange={e => setTiming(Number(e.target.value))}
                className="w-full mt-2 accent-[#62B146] cursor-pointer"
              />
              <div className="text-xs text-[#6B7A66] mt-1">
                {fmtMoney(b.watch)} currently sits in Watch &mdash; <b>{b.pool ? (b.watch / b.pool).toFixed(1) : 0}&times;</b> the entire aged + terminal position. Owner: Brett (s8.2 sell-through plan).
              </div>
            </div>

            {/* Trade-off boxes */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-[#E9F7E7] border border-[#C6E6C0] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#22702F] uppercase">▲ Future markdown avoided</div>
                <div className="text-base font-extrabold text-[#1B2418] my-0.5">{fmtMoney(r2.g)}</div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">{fmtMoney(r2.touched)} of Watch stock intercepted before mandating s8.2 markdown.</div>
              </div>
              <div className="bg-[#FCE7E5] border border-[#F4C9C5] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#9B1C16] uppercase">▼ Margin given away early</div>
                <div className="text-base font-extrabold text-[#1B2418] my-0.5">{fmtMoney(r2.c)}</div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">Discounting stock that would have cleared at full price without help.</div>
              </div>
              <div className="bg-[#EEF7EA] border border-[#DCEFD4] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#2C5A1E] uppercase">= Net</div>
                <div className={`text-base font-extrabold my-0.5 ${n2 >= 0 ? 'text-[#22702F]' : 'text-[#9B1C16]'}`}>
                  {n2 >= 0 ? '+' : ''}{fmtMoney(n2)}
                </div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">at {timing}% intervention rate</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gray-50/70 p-3 rounded-lg border border-[#E3EADF] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#2C5A1E] uppercase tracking-wide">
                Net position across the range
              </div>
              <div className="text-[10.5px] text-[#6B7A66] mb-1">
                The curve turns over once you start touching healthy sellers.
              </div>
              {renderCurve(o2, timing, 'timing')}
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
          Math.abs(timing - o2.bx) <= 2
            ? 'bg-[#E9F7E7] border-[#C6E6C0] text-[#22702F]'
            : timing > o2.bx
            ? 'bg-[#FCE7E5] border-[#F4C9C5] text-[#9B1C16]'
            : 'bg-[#FDF6E4] border-[#F3E2BC] text-[#8A6208]'
        }`}>
          {Math.abs(timing - o2.bx) <= 2 ? (
            <div>
              <b>You are at the optimum.</b> {timing}% returns {fmtMoney(n2)} net &mdash; the best available on this lever.
            </div>
          ) : (
            <div>
              <b>{timing > o2.bx ? 'You have pushed past the optimum.' : 'You are short of the optimum.'}</b> At {timing}%, net is {fmtMoney(n2)}; the peak is <b>{Math.round(o2.bx)}%</b> at {fmtMoney(o2.best)}.
              {' '}
              <button
                onClick={() => handleJump(setTiming, o2.bx, 'Watch intervention')}
                className="underline font-bold cursor-pointer ml-1"
              >
                Move to {Math.round(o2.bx)}% &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scenario 3: Shift terminal stock up exit hierarchy */}
      <div className="bg-white border border-[#E3EADF] rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-sm font-extrabold text-[#2C5A1E] mb-1">
          <div className="flex items-center gap-2">
            3 &middot; Shift terminal stock up the exit hierarchy
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white ${Math.abs(mix - o3.bx) <= 3 ? 'bg-[#2E8B3D]' : 'bg-[#2C5A1E]'}`}>
              {Math.abs(mix - o3.bx) <= 3 ? '✓ at optimum' : `◆ optimum ${Math.round(o3.bx)}%`}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#6B7A66] mb-3">
          Policy s8.3 ranks exit channels by margin recovery. Moving volume up a rung recovers more per unit &mdash; until the better channels run out of capacity to absorb it.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          <div className="lg:col-span-7 space-y-3">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#6B7A66] uppercase">Shift volume</span>
                <span className="text-xl font-extrabold text-[#2C5A1E]">{mix}% of terminal volume</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={mix}
                onChange={e => setMix(Number(e.target.value))}
                className="w-full mt-2 accent-[#62B146] cursor-pointer"
              />
              <div className="text-xs text-[#6B7A66] mt-1">
                Moves stock up from liquidation and donation toward outlet and cross-banner transfer. {fmtMoney(b.term)} of terminal stock in scope; <b>{fmtMoney(r3.moved)}</b> shifted at this setting.
              </div>
            </div>

            {/* Trade-off boxes */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-[#E9F7E7] border border-[#C6E6C0] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#22702F] uppercase">▲ Recovery uplift</div>
                <div className="text-base font-extrabold text-[#1B2418] my-0.5">{fmtMoney(r3.g)}</div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">Cross-banner (s8.3(2)) recovers near full margin and costs freight rather than price.</div>
              </div>
              <div className="bg-[#FCE7E5] border border-[#F4C9C5] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#9B1C16] uppercase">▼ Handling + saturation</div>
                <div className="text-base font-extrabold text-[#1B2418] my-0.5">{fmtMoney(r3.c)}</div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">Channel saturation bites sharply &mdash; outlet and cross-banner can only absorb so much.</div>
              </div>
              <div className="bg-[#EEF7EA] border border-[#DCEFD4] p-2.5 rounded-lg text-xs">
                <div className="text-[10px] font-bold text-[#2C5A1E] uppercase">= Net</div>
                <div className={`text-base font-extrabold my-0.5 ${n3 >= 0 ? 'text-[#22702F]' : 'text-[#9B1C16]'}`}>
                  {n3 >= 0 ? '+' : ''}{fmtMoney(n3)}
                </div>
                <div className="text-[10.5px] text-[#4A5545] leading-snug">at {mix}% channel shift</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gray-50/70 p-3 rounded-lg border border-[#E3EADF] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#2C5A1E] uppercase tracking-wide">
                Net position across the range
              </div>
              <div className="text-[10.5px] text-[#6B7A66] mb-1">
                Past the peak the better channels are saturated.
              </div>
              {renderCurve(o3, mix, 'mix')}
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
          Math.abs(mix - o3.bx) <= 3
            ? 'bg-[#E9F7E7] border-[#C6E6C0] text-[#22702F]'
            : mix > o3.bx
            ? 'bg-[#FCE7E5] border-[#F4C9C5] text-[#9B1C16]'
            : 'bg-[#FDF6E4] border-[#F3E2BC] text-[#8A6208]'
        }`}>
          {Math.abs(mix - o3.bx) <= 3 ? (
            <div>
              <b>You are at the optimum.</b> {mix}% returns {fmtMoney(n3)} net &mdash; the best available on this lever.
            </div>
          ) : (
            <div>
              <b>{mix > o3.bx ? 'You have pushed past the optimum.' : 'You are short of the optimum.'}</b> At {mix}%, net is {fmtMoney(n3)}; the peak is <b>{Math.round(o3.bx)}%</b> at {fmtMoney(o3.best)}.
              {' '}
              <button
                onClick={() => handleJump(setMix, o3.bx, 'Channel mix')}
                className="underline font-bold cursor-pointer ml-1"
              >
                Move to {Math.round(o3.bx)}% &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
