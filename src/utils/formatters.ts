export function fmtMoney(v: number): string {
  const val = Number(v) || 0;
  const abs = Math.abs(val);
  if (abs >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return '$' + (val / 1e3).toFixed(1) + 'K';
  return '$' + val.toFixed(0);
}

export function fmtMoneyFull(v: number): string {
  return '$' + (Number(v) || 0).toLocaleString('en-NZ', { maximumFractionDigits: 0 });
}

export function fmtNum(v: number): string {
  return (Number(v) || 0).toLocaleString('en-NZ');
}

export function pct(a: number, b: number): string {
  return b ? ((a / b) * 100).toFixed(1) : '0.0';
}

export function fmtTs(s: string): string {
  return String(s || '').slice(0, 16).replace('T', ' ');
}
