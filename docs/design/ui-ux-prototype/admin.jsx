// admin.jsx — IT/Admin console: module health

const { useState: useStateA } = React;

const STATE_COLORS = {
  ready: { lbl: 'Ready', cls: '' },
  warn: { lbl: 'Degraded', cls: 'warn' },
  degraded: { lbl: 'Degraded', cls: 'warn' },
  misconfig: { lbl: 'Misconfigured', cls: 'err' },
  'not-installed': { lbl: 'Not installed', cls: 'off' },
  offline: { lbl: 'Offline', cls: 'err' },
};

function AdminConsole({ install, setInstall, setPage }) {
  const [tab, setTab] = useStateA('health');
  const installed = window.CIVIC.ALL_MODULES.filter(m => install === 'full' || window.CIVIC.PARTIAL_MODULES.includes(m.id));
  const allModules = window.CIVIC.ALL_MODULES;

  return (
    <>
      <div className="page-head">
        <div className="crumbs">System <span className="sep">›</span> Admin console</div>
        <div className="page-head-row">
          <div>
            <h1 className="page-title">IT / System administration</h1>
            <p className="page-sub">{installed.length} of {allModules.length} modules installed · 1 update available · 1 connector misconfigured</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn"><Icon name="download" size={13} /> Audit export</button>
            <button className="btn primary"><Icon name="gear" size={13} /> Configure</button>
          </div>
        </div>
        <div className="page-tabs">
          <button className={tab==='health'?'on':''} onClick={() => setTab('health')}>Module health<span className="pill">{installed.length}</span></button>
          <button className={tab==='modules'?'on':''} onClick={() => setTab('modules')}>Available modules</button>
          <button className={tab==='identity'?'on':''} onClick={() => setTab('identity')}>Identity & SSO</button>
          <button className={tab==='backups'?'on':''} onClick={() => setTab('backups')}>Backups</button>
          <button className={tab==='updates'?'on':''} onClick={() => setTab('updates')}>Updates<span className="pill">1</span></button>
        </div>
      </div>

      <div className="body">
        {tab === 'health' && (
          <>
            <div className="grid-4" style={{ marginBottom: 16 }}>
              <div className="stat"><div className="lbl">Services ready</div><div className="val" style={{ color: 'var(--ok)' }}>7</div><div className="delta">of 10 active</div></div>
              <div className="stat"><div className="lbl">Degraded</div><div className="val" style={{ color: 'var(--warn)' }}>2</div><div className="delta">backups, recordings</div></div>
              <div className="stat"><div className="lbl">Misconfigured</div><div className="val" style={{ color: 'var(--err)' }}>1</div><div className="delta">Vimeo connector</div></div>
              <div className="stat"><div className="lbl">Updates available</div><div className="val">1</div><div className="delta">CivicClerk 4.2.1</div></div>
            </div>

            <div className="alert err" style={{ marginBottom: 16 }}>
              <Icon name="flag" size={14} className="ic" />
              <div className="body">
                <b>Vimeo livestream connector — credentials rejected since 2:14 AM</b>
                Council livestream will fall back to recording-only if not resolved before May 5. Test the connection with a redacted token.
                <div className="actions">
                  <button className="btn sm primary">Re-enter credentials</button>
                  <button className="btn sm">Run connection test</button>
                  <button className="btn sm ghost">View error log</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
              <div className="card">
                <div className="card-h">
                  <div className="ttl">Service health <small>10 services · live</small></div>
                  <div className="right"><button className="btn sm ghost"><Icon name="filter" size={12} /></button></div>
                </div>
                <div className="card-b flush">
                  <div className="svc-row" style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--rule)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>
                    <div></div>
                    <div>Service</div>
                    <div>Version</div>
                    <div>State</div>
                    <div>Action</div>
                  </div>
                  {window.CIVIC.SERVICES.map((s, i) => {
                    const st = STATE_COLORS[s.state];
                    return (
                      <div key={i} className="svc-row">
                        <div className={'light ' + st.cls + (s.state === 'not-installed' ? ' off' : '')} />
                        <div>
                          <div className="nm">{s.nm}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.note}</div>
                        </div>
                        <div className="ver">{s.ver}</div>
                        <div><span className={'badge ' + (s.state === 'ready' ? 'ok' : s.state === 'warn' || s.state === 'degraded' ? 'warn' : s.state === 'misconfig' ? 'err' : '') + ' dot'}>{st.lbl}</span></div>
                        <div>
                          {s.state === 'misconfig' ? <button className="btn sm primary">Fix</button> :
                           s.state === 'warn' || s.state === 'degraded' ? <button className="btn sm">Inspect</button> :
                           s.state === 'not-installed' ? <span className="muted" style={{ fontSize: 11 }}>—</span> :
                           <button className="btn sm ghost">View</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="col">
                <div className="card">
                  <div className="card-h"><div className="ttl">Identity & secrets</div></div>
                  <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>SAML SSO · Okta + Microsoft Entra · 142 active sessions</div>
                    <div className="field"><label>SAML signing certificate</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="input mono" value="••••••••••  expires Jan 14, 2027" readOnly style={{ flex: 1, fontSize: 11.5 }} />
                        <button className="btn sm">Test</button>
                      </div>
                      <span className="hint">Secrets are write-only. Use Test to verify; rotate to replace.</span>
                    </div>
                    <div className="field"><label>Vimeo API token</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="input mono" value="••••••••••  rejected" readOnly style={{ flex: 1, fontSize: 11.5, color: 'var(--err)', borderColor: 'rgba(138,42,42,0.3)' }} />
                        <button className="btn sm primary">Replace</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h"><div className="ttl">Backups</div></div>
                  <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Last successful</span><span className="mono">14h ago</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Last verification</span><span className="mono" style={{ color: 'var(--warn)' }}>overdue</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Retention</span><span>30 days · cold + 7y archive</span></div>
                    <button className="btn sm primary" style={{ marginTop: 4 }}>Run verification now</button>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h"><div className="ttl">System info</div></div>
                  <div className="card-b" style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>
                    <div>CivicSuite · 4.2.0</div>
                    <div>Tenant · brookfield-prod</div>
                    <div>Region · us-west-2</div>
                    <div>Uptime · 99.98% / 30d</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'modules' && (
          <div className="card">
            <div className="card-h">
              <div className="ttl">Available modules <small>{installed.length} of {allModules.length} installed</small></div>
              <div className="right">
                <span className="muted" style={{ fontSize: 11, marginRight: 8 }}>Install state:</span>
                <div className="surface-switch">
                  <button className={install === 'partial' ? 'on' : ''} onClick={() => setInstall('partial')}>Partial</button>
                  <button className={install === 'full' ? 'on' : ''} onClick={() => setInstall('full')}>Full</button>
                </div>
              </div>
            </div>
            <div className="card-b flush">
              {allModules.map(m => {
                const isInstalled = installed.find(x => x.id === m.id);
                return (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 120px 110px', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'center', opacity: isInstalled ? 1 : 0.65 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: isInstalled ? 'var(--navy-soft)' : 'var(--paper-2)', color: isInstalled ? 'var(--navy)' : 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
                      <Icon name={window.MODULE_ICON[m.id] || 'doc'} size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{m.desc}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{isInstalled ? 'v4.' + (Math.floor(Math.random()*3)) + '.' + Math.floor(Math.random()*5) : '—'}</div>
                    <div>
                      {isInstalled ? <span className="badge ok dot">Installed</span> : <span className="badge dot" style={{ background: 'var(--paper-3)', color: 'var(--ink-3)' }}>Not installed</span>}
                    </div>
                    <div>
                      {isInstalled ? <button className="btn sm">Configure</button> : <button className="btn sm primary">Install</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'updates' && (
          <div className="card">
            <div className="card-h"><div className="ttl">Updates</div></div>
            <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ border: '1px solid var(--gold)', background: 'var(--gold-soft)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Icon name="archive" size={16} style={{ color: 'var(--gold-2)' }} />
                  <div style={{ fontWeight: 600 }}>CivicClerk · 4.2.1</div>
                  <span className="badge gold dot">Update available</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold-2)' }}>+2 fixes · +1 security</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>Fixes minutes-export PDF rendering for accented characters. Patches a redaction edge-case for closed-session content. Currently on 4.2.0.</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <button className="btn sm primary">Schedule update</button>
                  <button className="btn sm">Review release notes</button>
                  <button className="btn sm ghost">Update now</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>All other modules are on the current release.</div>
            </div>
          </div>
        )}

        {tab === 'identity' && (
          <div className="empty card" style={{ padding: 60 }}><div className="ic"><Icon name="lock" size={28} /></div><div className="ttl">Identity configuration</div><div className="body">SAML SSO with Okta + Microsoft Entra. Detail view available on full prototype.</div></div>
        )}
        {tab === 'backups' && (
          <div className="empty card" style={{ padding: 60 }}><div className="ic"><Icon name="archive" size={28} /></div><div className="ttl">Backups & restore</div><div className="body">Schedule, verify, and restore. Detail view available on full prototype.</div></div>
        )}
      </div>
    </>
  );
}

window.AdminConsole = AdminConsole;
