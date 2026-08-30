import { useApp } from '../context/AppContext';
import { Seg, Toggle } from '../components/common';

export function SystemSettingsPage() {
  const app = useApp();
  return (
    <section>
      <div className="vhead">
        <div><h2>System Settings</h2><p>Organization-wide configuration · applies to all sites</p></div>
        <div className="toolbar"><button className="btn primary" onClick={() => app.notify('System settings saved')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg>Save changes</button></div>
      </div>
      <div className="grid-2">
        <div className="cardp">
          <h3>General</h3>
          <p className="sub">Identity &amp; locale</p>
          <div className="field"><label>Organization name</label><input type="text" defaultValue="Meridian Facilities Group" /></div>
          <div className="field row2"><div><label>Timezone</label><input type="text" defaultValue="UTC−05:00 · Eastern" /></div><div><label>Date format</label><input type="text" defaultValue="YYYY-MM-DD 24h" /></div></div>
          <div className="field"><label>Default landing view</label><Seg options={['Live wall', 'Site map', 'Alarms']} /></div>
        </div>

        <div className="cardp">
          <h3>Appearance</h3>
          <p className="sub">Interface theme &amp; density</p>
          <div className="field"><label>Theme</label>
            <div className="seg-sm">
              <button className={app.theme === 'dark' ? 'on' : ''} onClick={() => app.setTheme('dark')}>Dark</button>
              <button className={app.theme === 'light' ? 'on' : ''} onClick={() => app.setTheme('light')}>Light</button>
            </div>
          </div>
          <div className="field"><label>Accent</label>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: '#35c9d8', border: '2px solid var(--accent)' }} />
              <span style={{ width: 26, height: 26, borderRadius: 7, background: '#a371f7' }} />
              <span style={{ width: 26, height: 26, borderRadius: 7, background: '#3fb950' }} />
              <span style={{ width: 26, height: 26, borderRadius: 7, background: '#d9a441' }} />
            </div>
          </div>
          <div className="setting"><div className="st"><div className="t">Compact density</div><div className="d">Tighter tables &amp; lists</div></div><Toggle /></div>
          <div className="setting"><div className="st"><div className="t">Reduce motion</div><div className="d">Fewer animations</div></div><Toggle /></div>
        </div>

        <div className="cardp">
          <h3>Recording Defaults</h3>
          <p className="sub">Applied to newly added cameras</p>
          <div className="setting"><div className="st"><div className="t">Continuous 24/7</div><div className="d">Fallback to motion if storage low</div></div><Toggle on /></div>
          <div className="setting"><div className="st"><div className="t">Pre-record buffer</div><div className="d">Seconds captured before an event</div></div><span className="mono" style={{ color: 'var(--accent)' }}>8s</span></div>
          <div className="setting"><div className="st"><div className="t">Default codec</div><div className="d">Balance quality &amp; size</div></div><span className="mono" style={{ color: 'var(--muted)' }}>H.265</span></div>
          <div className="setting"><div className="st"><div className="t">Default retention</div><div className="d">Before automatic purge</div></div><span className="mono" style={{ color: 'var(--accent)' }}>30 days</span></div>
        </div>

        <div className="cardp">
          <h3>Network &amp; Integrations</h3>
          <p className="sub">Connectivity &amp; external systems</p>
          <div className="kv"><span className="k">NVR address</span><span className="v">10.20.0.4</span></div>
          <div className="kv"><span className="k">NTP sync</span><span className="v" style={{ color: 'var(--online)' }}>Locked · 2ms</span></div>
          <div className="kv"><span className="k">Bandwidth cap</span><span className="v">40 Mbps up</span></div>
          <div className="setting" style={{ marginTop: 6 }}><div className="st"><div className="t">Access-control webhook</div><div className="d">Door &amp; turnstile control</div></div><Toggle on /></div>
          <div className="setting"><div className="st"><div className="t">SIEM / syslog export</div><div className="d">Forward audit events</div></div><Toggle on /></div>
          <div className="setting"><div className="st"><div className="t">API access</div><div className="d">REST + WebSocket · token auth</div></div><Toggle /></div>
        </div>
      </div>
    </section>
  );
}
