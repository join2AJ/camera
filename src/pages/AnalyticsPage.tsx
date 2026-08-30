import { useState } from 'react';
import type { ReactNode } from 'react';
import { Toggle } from '../components/common';
import { FootTrafficChart, OccupancyGauge } from '../components/charts';

type Tab = 'faces' | 'fence' | 'people' | 'attend' | 'rules';

const FACES = [
  ['A. Okafor', 'Staff · #204', '#3a4a5e', 'FID-0044'], ['M. Reyes', 'VIP guest', '#4a3a52', 'FID-0061'],
  ['J. Park', 'Contractor', '#3a524a', 'FID-0088'], ['S. Volkov', 'Watchlist', '#523a3a', 'FID-9002'],
  ['L. Chen', 'Staff · #077', '#3a4652', 'FID-0112'], ['Unknown', 'Flagged 12:19', '#42484f', 'FID-—'],
];
const MATCHES: [string, string, string, string, boolean, string][] = [
  ['A. Okafor', 'West Entrance · 14:32', '98.7', '#3a4a5e', false, 'FID-0044'],
  ['M. Reyes', 'Lobby · 14:11', '95.2', '#4a3a52', false, 'FID-0061'],
  ['Unknown', 'Reception · 12:19', '71.4', '#42484f', true, 'no match'],
  ['L. Chen', 'Lobby · 11:47', '96.9', '#3a4652', false, 'FID-0112'],
];
const ATTEND: [string, string, string, string, string, string[], 'in' | 'out'][] = [
  ['A. Okafor', 'FID-0044', '06:58', '14:32', '7.6', ['Gate', 'Lobby', '2F', 'Cafeteria'], 'in'],
  ['M. Reyes', 'FID-0061', '08:12', '14:11', '6.0', ['Reception', 'Atrium', 'Lobby'], 'in'],
  ['J. Park', 'FID-0088', '09:05', '13:20', '4.3', ['Dock', 'Server Rm'], 'out'],
  ['L. Chen', 'FID-0112', '07:44', '11:47', '4.1', ['Lobby', '2F'], 'in'],
  ['D. Osei', 'FID-0130', '08:30', '12:05', '3.6', ['Gate', 'Cafeteria'], 'out'],
  ['R. Haddad', 'FID-0151', '07:20', '14:02', '6.7', ['Perimeter', 'Lobby', 'Atrium'], 'in'],
];

const TABS: { key: Tab; label: string; icon: ReactNode }[] = [
  { key: 'faces', label: 'Face Recognition', icon: <><circle cx="12" cy="9" r="4" /><path d="M5 20a7 7 0 0114 0" /></> },
  { key: 'fence', label: 'Virtual Fencing', icon: <path d="M3 21V8l4-3 5 3 5-3 4 3v13M7 5v16M17 5v16" /> },
  { key: 'people', label: 'People Counting', icon: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20a6 6 0 0112 0M14 20a5 5 0 017-4.6" /></> },
  { key: 'attend', label: 'Attendance', icon: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18M8 15l2 2 4-4" /></> },
  { key: 'rules', label: 'Alert Rules', icon: <><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></> },
];

export function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('faces');
  return (
    <section>
      <div className="vhead"><div><h2>AI Analytics</h2><p>On-device inference · models updated 2 days ago</p></div></div>

      <div className="subtabs">
        {TABS.map((t) => (
          <button key={t.key} className={`subtab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{t.icon}</svg>{t.label}
          </button>
        ))}
      </div>

      {tab === 'faces' && (
        <>
          <div className="col-2-a">
            <div className="cardp">
              <h3><span className="chip ai"><span className="d" style={{ background: 'var(--ai)' }} />Enrolled</span> Watchlist &amp; Staff</h3>
              <p className="sub">18 identities · encrypted face templates stored on-device, never raw images</p>
              <div className="faces">
                {FACES.map((f) => (
                  <div key={f[3]} className="face">
                    <div className="ph" style={{ background: `radial-gradient(120% 90% at 50% 20%,${f[2]},#0e161e)` }} />
                    <div className="nm">{f[0]}<span>{f[3]} · {f[1]}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cardp">
              <h3>Recent Matches</h3>
              <p className="sub">Last 2 hours · West Entrance, Lobby</p>
              {MATCHES.map((m, i) => (
                <div key={i} className="match">
                  <div className="av" style={{ background: `radial-gradient(120% 90% at 50% 20%,${m[3]},#0e161e)` }} />
                  <div className="info"><div className="n">{m[0]} <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)' }}>{m[5]}</span></div><div className="w">{m[1]}</div></div>
                  <div className={`conf${m[4] ? ' low' : ''}`}>{m[2]}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: 16 }}>
            <div className="cardp"><div className="kpi"><div className="lab">Match Rate</div><div className="num">96.4<small>%</small></div><div className="delta up">▲ 1.2% vs last week</div></div></div>
            <div className="cardp"><div className="kpi"><div className="lab">Avg Latency</div><div className="num">42<small>ms</small></div><div className="delta up">▼ 8ms on-device</div></div></div>
            <div className="cardp"><div className="kpi"><div className="lab">False Positives</div><div className="num">0.3<small>%</small></div><div className="delta up">threshold 0.88</div></div></div>
          </div>
        </>
      )}

      {tab === 'fence' && (
        <div className="col-2-a">
          <div className="cardp">
            <h3>Zone Editor · Cam 04 · Loading Dock</h3>
            <p className="sub">Draw intrusion zones and directional tripwires — click a shape to edit</p>
            <div className="fence-editor">
              <div className="scene" style={{ background: 'radial-gradient(120% 90% at 20% 100%,#2b2340,#0d0a16 60%)' }} />
              <div className="scanline" />
              <div className="zone" style={{ left: '8%', top: '20%', width: '34%', height: '55%' }}><span className="zl">Zone A · Restricted</span></div>
              <div className="zone a" style={{ right: '8%', top: '30%', width: '30%', height: '40%' }}><span className="zl">Zone B · Staff only</span></div>
              <div className="tripwire" style={{ left: '46%', top: '15%', width: '22%', transform: 'rotate(24deg)' }} />
              <div className="cam-bot"><span className="ts">Loading Dock · CAM-04</span><span className="chip ai" style={{ background: 'rgba(163,113,247,.2)' }}><span className="d" style={{ background: 'var(--ai)' }} />2 zones · 1 tripwire</span></div>
            </div>
          </div>
          <div className="cardp">
            <h3>Active Rules</h3>
            <p className="sub">Triggered actions per boundary</p>
            <div className="rule"><span className="rk" style={{ background: 'var(--motion)' }} /><div className="rt">Zone A intrusion<span>Any person 22:00–06:00 → alarm + push</span></div><Toggle on /></div>
            <div className="rule"><span className="rk" style={{ background: 'var(--ai)' }} /><div className="rt">Zone B unauthorized<span>Non-staff face → record + notify</span></div><Toggle on /></div>
            <div className="rule"><span className="rk" style={{ background: 'var(--alert)' }} /><div className="rt">Tripwire · outbound<span>Cross left→right → flag event</span></div><Toggle on /></div>
            <div className="rule"><span className="rk" style={{ background: 'var(--faint)' }} /><div className="rt">Loitering detection<span>Dwell &gt; 90s in Zone A</span></div><Toggle /></div>
          </div>
        </div>
      )}

      {tab === 'people' && (
        <>
          <div className="kpi-row">
            <div className="kpi"><div className="lab">Current Occupancy</div><div className="num">143<small> people</small></div><div className="delta up">▲ 12 in last 15 min</div></div>
            <div className="kpi"><div className="lab">Entries Today</div><div className="num">1,867</div><div className="delta up">▲ 6% vs avg</div></div>
            <div className="kpi"><div className="lab">Exits Today</div><div className="num">1,724</div><div className="delta down">peak 08:40</div></div>
            <div className="kpi"><div className="lab">Capacity</div><div className="num">36<small>%</small></div><div className="delta up">400 max</div></div>
          </div>
          <div className="col-2-a">
            <div className="cardp">
              <h3>Foot Traffic · Today</h3>
              <p className="sub">Entries vs exits per hour, all monitored doors</p>
              <FootTrafficChart />
            </div>
            <div className="cardp">
              <h3>Live Occupancy</h3>
              <p className="sub">Zone load right now</p>
              <div className="gauge-wrap">
                <OccupancyGauge />
                <div style={{ flex: 1 }}>
                  <div className="kv"><span className="k">Lobby</span><span className="v" style={{ color: 'var(--online)' }}>48</span></div>
                  <div className="kv"><span className="k">Atrium</span><span className="v" style={{ color: 'var(--motion)' }}>61</span></div>
                  <div className="kv"><span className="k">Cafeteria</span><span className="v" style={{ color: 'var(--online)' }}>22</span></div>
                  <div className="kv"><span className="k">Roof deck</span><span className="v" style={{ color: 'var(--faint)' }}>12</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'attend' && (
        <>
          <div className="kpi-row">
            <div className="kpi"><div className="lab">Enrolled Identities</div><div className="num">18</div><div className="delta up">each has a unique FID</div></div>
            <div className="kpi"><div className="lab">Present Now</div><div className="num" style={{ color: 'var(--online)' }}>11</div><div className="delta up">▲ 2 in last hour</div></div>
            <div className="kpi"><div className="lab">Avg Hours Today</div><div className="num">6.4<small>h</small></div><div className="delta up">on premises</div></div>
            <div className="kpi"><div className="lab">First In</div><div className="num">06:58</div><div className="delta up">A. Okafor</div></div>
          </div>
          <div className="cardp">
            <h3>Attendance &amp; Movement · Today</h3>
            <p className="sub">Derived from face detections across cameras — first/last seen, hours on site, and zone-to-zone path</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="att-table">
                <thead><tr><th>Identity</th><th>FID</th><th>First seen</th><th>Last seen</th><th>Hours</th><th>Movement path</th><th>Status</th></tr></thead>
                <tbody>
                  {ATTEND.map((a) => (
                    <tr key={a[1]}>
                      <td style={{ fontWeight: 500 }}>{a[0]}</td>
                      <td><span className="fid">{a[1]}</span></td>
                      <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{a[2]}</td>
                      <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{a[3]}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{a[4]}h</td>
                      <td><div className="movement">{a[5].map((z, i) => <span key={i}>{i > 0 && <span className="arw">→ </span>}<span className="hop">{z}</span></span>)}</div></td>
                      <td>{a[6] === 'in' ? <span className="chip online"><span className="d" />On site</span> : <span className="chip off"><span className="d" />Left</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'rules' && <AlertRules />}
    </section>
  );
}

function AlertRules() {
  return (
    <div className="col-2-a">
      <div>
        <div className="cardp" style={{ marginBottom: 16 }}>
          <h3><span className="chip ai"><span className="d" style={{ background: 'var(--ai)' }} />Face</span> Recognition Alerts</h3>
          <p className="sub">Fire a named notification when a watch-listed identity is recognized</p>
          <div className="arule vip">
            <div className="ar-ic" style={{ background: 'rgba(163,113,247,.14)', color: 'var(--ai)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 2l2.4 6.9H21l-5.3 4.1 2 6.9L12 16l-5.7 3.9 2-6.9L3 8.9h6.6z" /></svg></div>
            <div className="ar-body">
              <div className="art">VIP / High-value guest <span className="chip ai" style={{ background: 'rgba(163,113,247,.18)' }}><span className="d" style={{ background: 'var(--ai)' }} />3 faces</span></div>
              <div className="ard">On match → push “VIP arrived” to concierge + reception, open turnstile</div>
              <div className="armeta"><span>FID-0044, 0061, 0112</span><span>≥ 0.92 confidence</span><span>Lobby, Reception</span></div>
            </div>
            <Toggle on />
          </div>
          <div className="arule gov">
            <div className="ar-ic" style={{ background: 'rgba(217,164,65,.14)', color: 'var(--motion)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg></div>
            <div className="ar-body">
              <div className="art">Government representative <span className="chip motion"><span className="d" style={{ background: 'var(--motion)' }} />2 faces</span></div>
              <div className="ard">On match → notify security lead + facilities, log protocol escort</div>
              <div className="armeta"><span>FID-0007, 0019</span><span>≥ 0.94 confidence</span><span>All entrances</span></div>
            </div>
            <Toggle on />
          </div>
          <div className="arule deny">
            <div className="ar-ic" style={{ background: 'rgba(229,83,75,.14)', color: 'var(--alert)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg></div>
            <div className="ar-body">
              <div className="art">Watchlist / banned person <span className="chip rec"><span className="d" />Critical</span></div>
              <div className="ard">On match → alarm, lock nearest doors, dispatch guard</div>
              <div className="armeta"><span>FID-9001…9014</span><span>≥ 0.88 confidence</span><span>24/7 · all cameras</span></div>
            </div>
            <Toggle on />
          </div>
        </div>
        <div className="cardp">
          <h3>ANPR Plate Rules</h3>
          <p className="sub">Allow, deny, or hold vehicles by plate</p>
          <div className="arule"><div className="ar-ic" style={{ background: 'rgba(63,185,80,.14)', color: 'var(--online)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg></div><div className="ar-body"><div className="art">Allow list → auto-open gate</div><div className="ard">312 plates · staff, fleet, recurring deliveries</div></div><Toggle on /></div>
          <div className="arule deny"><div className="ar-ic" style={{ background: 'rgba(229,83,75,.14)', color: 'var(--alert)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg></div><div className="ar-body"><div className="art">Deny list → hold gate + alarm</div><div className="ard">Known trespass &amp; BOLO plates</div></div><Toggle on /></div>
          <div className="arule"><div className="ar-ic" style={{ background: 'rgba(217,164,65,.14)', color: 'var(--motion)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg></div><div className="ar-body"><div className="art">Unknown plate → manual review</div><div className="ard">Operator confirms before gate opens</div></div><Toggle on /></div>
        </div>
      </div>
      <div className="cardp">
        <h3>Notification Channels</h3>
        <p className="sub">Where a fired alert is delivered</p>
        <div className="setting"><div className="st"><div className="t">Mobile push</div><div className="d">Aperture app · on-call operators</div></div><Toggle on /></div>
        <div className="setting"><div className="st"><div className="t">Email</div><div className="d">security-team@site.io</div></div><Toggle on /></div>
        <div className="setting"><div className="st"><div className="t">SMS / call escalation</div><div className="d">Critical rules only</div></div><Toggle on /></div>
        <div className="setting"><div className="st"><div className="t">Webhook / PA system</div><div className="d">POST to access-control &amp; audio</div></div><Toggle /></div>
      </div>
    </div>
  );
}
