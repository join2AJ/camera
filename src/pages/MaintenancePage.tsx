import { Scene } from '../components/common';
import { useApp } from '../context/AppContext';

const sig = (v: number) => (v > 80 ? 'var(--online)' : v > 60 ? 'var(--motion)' : 'var(--alert)');

/** Deterministic pseudo-metric so a given camera always shows the same health. */
function h(seed: number, min: number, span: number) {
  const r = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return Math.round(min + r * span);
}

export function MaintenancePage() {
  const { cameras } = useApp();

  const rows = cameras.map((c, i) => {
    const signal = h(i + 1, 62, 38);
    const temp = h(i + 3, 34, 18);
    const days = h(i + 7, 3, 60);
    return { name: c.n, id: c.id, index: i, fw: 'v4.3.0', uptime: `${days}d ${h(i + 2, 0, 23)}h`, signal, temp };
  });

  const LOGS: [string, 'ok' | 'info' | 'warn' | 'err', string][] = [
    ['14:32:07', 'ok', `Snapshot relay healthy · ${cameras[0]?.id ?? 'CAM'}`],
    ['14:18:44', 'info', `Stream reconnected · ${cameras[1]?.id ?? 'CAM'}`],
    ['13:47:02', 'info', 'Proxy cache flushed · webcams.nyctmc.org'],
    ['12:55:10', 'ok', `Health check passed · ${cameras.length} cameras`],
    ['11:40:31', 'warn', `Elevated latency · ${cameras[cameras.length - 1]?.id ?? 'CAM'}`],
    ['10:02:18', 'ok', 'Encryption key rotation completed'],
    ['06:00:00', 'ok', 'Nightly integrity check passed · 0 errors'],
  ];

  return (
    <section>
      <div className="vhead">
        <div><h2>Maintenance &amp; Health</h2><p>Device fleet · firmware · diagnostics · access</p></div>
        <div className="toolbar">
          <button className="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5" /></svg>Run diagnostics</button>
          <button className="btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Update all firmware</button>
        </div>
      </div>

      <div className="col-2-a">
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="health-table">
            <thead><tr><th>Camera</th><th>Status</th><th>Firmware</th><th>Uptime</th><th>Signal</th><th>Temp</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><div className="cam-cell"><div className="th"><Scene index={r.index} /></div><div><div style={{ fontWeight: 500 }}>{r.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{r.id}</div></div></div></td>
                  <td><span className="chip online"><span className="d" />Online</span></td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.fw}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.uptime}</td>
                  <td><span className="bar-inline"><i style={{ width: `${r.signal}%`, background: sig(r.signal) }} /></span> <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.signal}%</span></td>
                  <td className="mono" style={{ fontSize: 12, color: r.temp > 48 ? 'var(--motion)' : 'var(--muted)' }}>{r.temp}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="cardp" style={{ marginBottom: 16 }}>
            <h3>Firmware</h3>
            <p className="sub">Fleet up to date</p>
            <div className="fw-card"><div className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg></div><div className="fm"><div className="t">All cameras</div><div className="s">v4.3.0 · current</div></div><span className="chip online"><span className="d" />Current</span></div>
            <div className="fw-card"><div className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg></div><div className="fm"><div className="t">Edge / relay</div><div className="s">Netlify function · healthy</div></div><span className="chip online"><span className="d" />Current</span></div>
          </div>
          <div className="cardp">
            <h3>System Log</h3>
            <p className="sub">Live · last 24h</p>
            <div className="log">
              {LOGS.map((l, i) => (
                <div key={i} className="ln"><span className="tm">{l[0]}</span><span className={`lv ${l[1]}`}>{l[1].toUpperCase()}</span><span className="msg">{l[2]}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
