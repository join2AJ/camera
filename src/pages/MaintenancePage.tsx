import { Scene } from '../components/common';

type St = 'online' | 'update' | 'warn';
const HEALTH: [string, string, St, string, string, number, string][] = [
  ['West Entrance', 'CAM-01', 'online', 'v4.3.0', '41d 06h', 96, '38°C'],
  ['Parking Lot A', 'CAM-02', 'update', 'v4.2.1', '41d 06h', 88, '42°C'],
  ['Lobby', 'CAM-03', 'online', 'v4.3.0', '12d 22h', 99, '36°C'],
  ['Loading Dock', 'CAM-04', 'online', 'v4.3.0', '41d 06h', 74, '44°C'],
  ['Corridor 2F', 'CAM-05', 'update', 'v4.2.1', '41d 06h', 91, '35°C'],
  ['Perimeter N', 'CAM-11', 'warn', 'v4.3.0', '3d 01h', 52, '51°C'],
  ['Garage Gate', 'CAM-12', 'online', 'v4.3.0', '41d 05h', 84, '39°C'],
];
const CAM_INDEX: Record<string, number> = { 'CAM-01': 0, 'CAM-02': 1, 'CAM-03': 2, 'CAM-04': 3, 'CAM-05': 4, 'CAM-11': 10, 'CAM-12': 11 };

const LOGS: [string, 'ok' | 'info' | 'warn' | 'err', string][] = [
  ['14:32:07', 'ok', 'Face template matched · A. Okafor · CAM-01'],
  ['14:18:44', 'info', 'Motion recording started · CAM-03'],
  ['13:47:02', 'warn', 'Fence breach · Zone A · CAM-04 · alert dispatched'],
  ['12:55:10', 'info', 'Firmware check · 3 updates available'],
  ['11:40:31', 'err', 'CAM-11 signal degraded · 52% · investigating'],
  ['10:02:18', 'ok', 'Encryption key rotation completed'],
  ['08:40:55', 'info', 'Occupancy peak · 312 people · atrium'],
  ['06:00:00', 'ok', 'Nightly integrity check passed · 0 errors'],
];

const sig = (v: number) => (v > 80 ? 'var(--online)' : v > 60 ? 'var(--motion)' : 'var(--alert)');
function statusChip(s: St) {
  if (s === 'online') return <span className="chip online"><span className="d" />Online</span>;
  if (s === 'update') return <span className="chip motion"><span className="d" style={{ background: 'var(--motion)' }} />Update</span>;
  return <span className="chip rec"><span className="d" />Attention</span>;
}

export function MaintenancePage() {
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
              {HEALTH.map((h) => (
                <tr key={h[1]}>
                  <td><div className="cam-cell"><div className="th"><Scene index={CAM_INDEX[h[1]] ?? 0} /></div><div><div style={{ fontWeight: 500 }}>{h[0]}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{h[1]}</div></div></div></td>
                  <td>{statusChip(h[2])}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{h[3]}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{h[4]}</td>
                  <td><span className="bar-inline"><i style={{ width: `${h[5]}%`, background: sig(h[5]) }} /></span> <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{h[5]}%</span></td>
                  <td className="mono" style={{ fontSize: 12, color: parseInt(h[6]) > 48 ? 'var(--motion)' : 'var(--muted)' }}>{h[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="cardp" style={{ marginBottom: 16 }}>
            <h3>Firmware</h3>
            <p className="sub">3 updates available</p>
            <div className="fw-card"><div className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg></div><div className="fm"><div className="t">Cam 02, 05, 09</div><div className="s">v4.2.1 → v4.3.0 · security fixes</div></div><button className="btn primary" style={{ padding: '6px 12px' }}>Update</button></div>
            <div className="fw-card"><div className="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg></div><div className="fm"><div className="t">NVR Controller</div><div className="s">v11.4 · up to date</div></div><span className="chip online"><span className="d" />Current</span></div>
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
