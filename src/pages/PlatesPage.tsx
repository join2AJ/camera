import { useApp } from '../context/AppContext';
import { downloadCsv } from '../lib/csv';

const PLATES: [string, string, 'allow' | 'deny' | 'unknown', string, string, string][] = [
  ['7XY·B420', 'Silver sedan', 'allow', 'Opened', '14:41', '#3a4a5e'],
  ['9ZQ·3388', 'Black SUV', 'deny', 'Held', '13:12', '#2a2f38'],
  ['4KL·9921', 'Delivery van', 'allow', 'Opened', '12:58', '#3a4652'],
  ['8RT·5510', 'White pickup', 'unknown', 'Manual', '12:30', '#42484f'],
  ['2AB·1177', 'Blue coupe', 'allow', 'Opened', '11:47', '#3a524a'],
  ['6MN·7203', 'Grey hatchback', 'unknown', 'Manual', '10:22', '#42484f'],
];

function status(s: 'allow' | 'deny' | 'unknown') {
  if (s === 'allow') return <span className="chip online"><span className="d" />Allow</span>;
  if (s === 'deny') return <span className="chip rec"><span className="d" />Deny</span>;
  return <span className="chip off"><span className="d" />Unknown</span>;
}

export function PlatesPage() {
  const { notify } = useApp();
  const exportLog = () => {
    downloadCsv('anpr-log.csv', ['Plate', 'Vehicle', 'Status', 'Gate', 'Time'], PLATES.map((p) => [p[0], p[1], p[2], p[3], p[4]]));
    notify('ANPR log exported');
  };
  return (
    <section>
      <div className="vhead">
        <div><h2>License Plate Recognition</h2><p>Garage Gate &amp; Perimeter · reads matched against allow / deny lists</p></div>
        <div className="toolbar">
          <button className="btn" onClick={() => notify('Add-to-list needs the ANPR backend')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>Add to list</button>
          <button className="btn primary" onClick={exportLog}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Export log</button>
        </div>
      </div>
      <div className="kpi-row">
        <div className="kpi"><div className="lab">Reads Today</div><div className="num">418</div><div className="delta up">▲ 22 vs avg</div></div>
        <div className="kpi"><div className="lab">Allow-list Hits</div><div className="num" style={{ color: 'var(--online)' }}>312</div><div className="delta up">gate auto-opened</div></div>
        <div className="kpi"><div className="lab">Deny-list Hits</div><div className="num" style={{ color: 'var(--alert)' }}>2</div><div className="delta down">alert dispatched</div></div>
        <div className="kpi"><div className="lab">Read Accuracy</div><div className="num">99.1<small>%</small></div><div className="delta up">LPR model v3</div></div>
      </div>
      <div className="col-2-a">
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="lpr-table">
            <thead><tr><th>Capture</th><th>Plate</th><th>Vehicle</th><th>Status</th><th>Gate</th><th>Time</th></tr></thead>
            <tbody>
              {PLATES.map((p) => (
                <tr key={p[0]}>
                  <td><div className="lp-shot"><div className="scene" style={{ background: `radial-gradient(120% 90% at 50% 30%,${p[5]},#0a0f14)` }} /><span className="plate-mini">{p[0]}</span></div></td>
                  <td><span className="plate">{p[0]}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{p[1]}</td>
                  <td>{status(p[2])}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{p[3]}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{p[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="cardp" style={{ marginBottom: 16 }}>
            <h3>Allow List <span className="chip online" style={{ marginLeft: 4 }}><span className="d" />312</span></h3>
            <p className="sub">Auto-opens the gate on match</p>
            <div className="kv"><span className="k mono">7XY·B420</span><span className="v" style={{ color: 'var(--muted)' }}>Staff · M. Reyes</span></div>
            <div className="kv"><span className="k mono">4KL·9921</span><span className="v" style={{ color: 'var(--muted)' }}>Delivery · UPS</span></div>
            <div className="kv"><span className="k mono">2AB·1177</span><span className="v" style={{ color: 'var(--muted)' }}>Exec · Fleet 3</span></div>
          </div>
          <div className="cardp">
            <h3>Deny List <span className="chip rec" style={{ marginLeft: 4 }}><span className="d" />2</span></h3>
            <p className="sub">Triggers alarm &amp; holds gate</p>
            <div className="kv"><span className="k mono">9ZQ·3388</span><span className="v" style={{ color: 'var(--alert)' }}>Trespass · flagged</span></div>
            <div className="kv"><span className="k mono">1HH·0042</span><span className="v" style={{ color: 'var(--alert)' }}>Stolen · BOLO</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
