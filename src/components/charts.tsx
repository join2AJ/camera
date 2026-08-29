/** Hand-drawn SVG charts following simple dataviz principles: area fill, faint grid, emphasized endpoint. */

const ENTRIES = [8, 12, 45, 120, 180, 160, 140, 170, 210, 240, 190, 150, 130, 145, 175, 220, 260, 230, 180, 120, 80, 50, 30, 18];
const EXITS = [4, 6, 20, 70, 110, 130, 150, 120, 90, 110, 140, 160, 150, 140, 120, 100, 130, 180, 210, 160, 120, 90, 60, 35];

export function FootTrafficChart() {
  const W = 560, H = 210, pad = 26, max = 280;
  const pts = (arr: number[]) => arr.map((v, i) => [pad + (i / (arr.length - 1)) * (W - pad * 2), H - pad - (v / max) * (H - pad * 2)] as const);
  const path = (p: readonly (readonly [number, number])[]) => p.map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
  const pe = pts(ENTRIES);
  const px = pts(EXITS);
  const area = `${path(pe)} L${W - pad} ${H - pad} L${pad} ${H - pad} Z`;
  const last = pe[pe.length - 1];
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="af" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((g) => {
          const y = pad + (g / 4) * (H - pad * 2);
          return (
            <g key={g}>
              <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="var(--border-soft)" strokeWidth={1} />
              <text x={4} y={y + 3} fill="var(--faint)" fontSize={9} fontFamily="monospace">{Math.round(max - (g / 4) * max)}</text>
            </g>
          );
        })}
        <path d={area} fill="url(#af)" />
        <path d={path(px)} fill="none" stroke="var(--motion)" strokeWidth={2} strokeLinejoin="round" opacity={0.85} />
        <path d={path(pe)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r={4} fill="var(--accent)" stroke="var(--ground)" strokeWidth={2} />
      </svg>
      <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 11.5, color: 'var(--muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 14, height: 3, background: 'var(--accent)', display: 'inline-block', borderRadius: 2 }} />Entries</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 14, height: 3, background: 'var(--motion)', display: 'inline-block', borderRadius: 2 }} />Exits</span>
      </div>
    </>
  );
}

export function OccupancyGauge({ pct = 36, current = 143, max = 400 }: { pct?: number; current?: number; max?: number }) {
  const r = 52, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <circle cx={65} cy={65} r={r} fill="none" stroke="var(--raised-2)" strokeWidth={12} />
      <circle cx={65} cy={65} r={r} fill="none" stroke="var(--accent)" strokeWidth={12} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 65 65)" />
      <text x={65} y={62} textAnchor="middle" fill="var(--text)" fontSize={26} fontFamily="Chakra Petch,sans-serif" fontWeight={600}>{pct}%</text>
      <text x={65} y={80} textAnchor="middle" fill="var(--muted)" fontSize={10}>{current} / {max}</text>
    </svg>
  );
}
