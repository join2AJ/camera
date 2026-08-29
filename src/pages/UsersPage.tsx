type Role = 'admin' | 'op' | 'view';
const USERS: [string, string, Role, string, string, string][] = [
  ['Ada Kessler', 'a.kessler@site.io', 'admin', '2 min ago', 'All (12)', '#4a3a52'],
  ['Marcus Reyes', 'm.reyes@site.io', 'op', '18 min ago', 'Perimeter (5)', '#3a4a5e'],
  ['Jin Park', 'j.park@site.io', 'op', '1 hr ago', 'Interior (7)', '#3a524a'],
  ['Sara Volkov', 's.volkov@site.io', 'view', 'Yesterday', 'Lobby (2)', '#523a3a'],
  ['Night Desk', 'desk@site.io', 'view', 'Active now', 'All (12)', '#3a4652'],
];
const PERMS: [string, boolean, boolean, boolean][] = [
  ['View live feeds', true, true, true], ['Review playback', true, true, true], ['Export & download clips', true, true, false],
  ['Manage AI rules & zones', true, true, false], ['Configure storage & keys', true, false, false], ['Firmware & maintenance', true, false, false],
  ['Manage users & roles', true, false, false], ['View audit trail', true, false, false],
];
const AUDIT: [string, string, string][] = [
  ['14:41:02', 'a.kessler', 'opened Storage & Encryption settings'],
  ['14:32:18', 'm.reyes', 'exported clip · CAM-01 · 14:20–14:33'],
  ['14:05:44', 'j.park', 'viewed live · Interior group (7 cameras)'],
  ['13:47:10', 'system', 'auto-dispatched alarm · fence breach Zone A'],
  ['12:58:31', 'desk', 'acknowledged alarm · unknown face · CAM-09'],
  ['11:20:09', 'a.kessler', 'added plate 2AB·1177 to allow list'],
  ['09:14:55', 's.volkov', 'viewed playback · Lobby · 08:30–09:00'],
];

const roleBadge = (r: Role) => r === 'admin'
  ? <span className="role-badge admin">Admin</span>
  : r === 'op' ? <span className="role-badge op">Operator</span> : <span className="role-badge view">Viewer</span>;
const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const yes = <span className="yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5" /></svg></span>;
const no = <span className="no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12" /></svg></span>;

export function UsersPage() {
  return (
    <section>
      <div className="vhead">
        <div><h2>Users, Roles &amp; Audit</h2><p>Access control · every view &amp; export is logged</p></div>
        <div className="toolbar">
          <button className="btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M19 8v6M22 11h-6" /></svg>Invite user</button>
        </div>
      </div>
      <div className="col-2-a">
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="lpr-table">
            <thead><tr><th>User</th><th>Role</th><th>Last active</th><th>Cameras</th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u[1]}>
                  <td><div className="user-cell"><div className="ua" style={{ background: `radial-gradient(120% 90% at 40% 20%,${u[5]},#0e161e)` }}>{initials(u[0])}</div><div><div className="un">{u[0]}</div><div className="ue">{u[1]}</div></div></div></td>
                  <td>{roleBadge(u[2])}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{u[3]}</td>
                  <td style={{ color: 'var(--muted)' }}>{u[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cardp">
          <h3>Permissions Matrix</h3>
          <p className="sub">What each role can do</p>
          <table className="perm-table">
            <thead><tr><th>Capability</th><th className="rc">Admin</th><th className="rc">Operator</th><th className="rc">Viewer</th></tr></thead>
            <tbody>
              {PERMS.map((p) => (
                <tr key={p[0] as string}>
                  <td>{p[0]}</td>
                  <td className="rc">{p[1] ? yes : no}</td>
                  <td className="rc">{p[2] ? yes : no}</td>
                  <td className="rc">{p[3] ? yes : no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="cardp" style={{ marginTop: 16 }}>
        <h3>Audit Trail <span className="chip ai" style={{ marginLeft: 4 }}><span className="d" style={{ background: 'var(--ai)' }} />tamper-evident</span></h3>
        <p className="sub">Who accessed what · immutable, exportable for compliance</p>
        <div className="audit">
          {AUDIT.map((a, i) => (
            <div key={i} className="arow"><span className="at">{a[0]}</span><span className="au">{a[1]}</span><span className="aa">{a[2]}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
