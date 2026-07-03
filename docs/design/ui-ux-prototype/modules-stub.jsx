// modules-stub.jsx — placeholders for installed-but-not-built modules + Code module + IA/system pages

const { useState: useStateMS } = React;

function CodeModule({ setPage }) {
  const sections = [
    { num: '§17.04', ttl: 'Definitions', meta: 'Last amended Mar 2025', body: 'Terms used in this title shall have the meanings given in this section…' },
    { num: '§17.08', ttl: 'Zoning districts established', meta: 'Last amended Sep 2024', body: 'The City is divided into zoning districts as shown on the Zoning Map…' },
    { num: '§17.12', ttl: 'Use regulations', meta: 'Last amended Sep 2024', body: 'Permitted, conditional, and prohibited uses by district…' },
    { num: '§17.16', ttl: 'Development standards', meta: 'Last amended Jan 2026', body: 'Setbacks, height, lot coverage, and parking standards…' },
    { num: '§17.20', ttl: 'Zoning amendments and rezoning procedure', meta: 'Pending — Ord. 2026-08', body: 'Process for amending the Zoning Map or text of this title.', warn: true },
    { num: '§17.24', ttl: 'Variances', meta: 'Last amended 2019', body: 'Procedure and findings required for granting a variance…' },
  ];
  return (
    <>
      <div className="page-head">
        <div className="crumbs"><a href="#">Workspace</a> <span className="sep">›</span> Code</div>
        <div className="page-head-row">
          <div>
            <h1 className="page-title">Municipal Code · Title 17 (Land Use & Zoning)</h1>
            <p className="page-sub">26 sections · adopted through April 21, 2026 · 1 amendment pending</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn"><Icon name="history" size={13} /> Amendment history</button>
            <button className="btn primary"><Icon name="plus" size={13} /> Draft amendment</button>
          </div>
        </div>
      </div>
      <div className="body">
        <div className="card">
          <div className="card-h"><div className="ttl">Sections</div><div className="right"><button className="btn sm ghost"><Icon name="search" size={12} /> Search title</button></div></div>
          <div className="card-b flush">
            {sections.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 180px auto', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'center' }}>
                <div className="mono" style={{ color: 'var(--gold-2)', fontWeight: 600, fontSize: 12 }}>{s.num}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 14 }}>{s.ttl}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.body}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.meta}</div>
                <div>{s.warn ? <span className="badge gold dot">Pending</span> : <span className="badge ok dot">Adopted</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ModuleNotInstalled({ moduleId, setInstall }) {
  const m = window.CIVIC.ALL_MODULES.find(x => x.id === moduleId);
  return (
    <div className="body" style={{ paddingTop: 80 }}>
      <div className="empty card" style={{ padding: 60, maxWidth: 560, margin: '0 auto' }}>
        <div className="ic"><Icon name="puzzle" size={28} /></div>
        <div className="ttl">{m?.name} is not installed</div>
        <div className="body">An admin can install this module from the Available Modules console. Existing work continues unaffected.</div>
        <button className="btn primary" onClick={() => setInstall('full')}>Switch to full install (preview)</button>
      </div>
    </div>
  );
}

function ModulePlaceholder({ moduleId }) {
  const m = window.CIVIC.ALL_MODULES.find(x => x.id === moduleId);
  return (
    <>
      <div className="page-head">
        <div className="crumbs"><a href="#">Workspace</a> <span className="sep">›</span> {m?.name}</div>
        <h1 className="page-title">{m?.name}</h1>
        <p className="page-sub">{m?.desc} · this module follows the shared module pattern (Dashboard / Queue / Detail / Create / Audit / Settings).</p>
      </div>
      <div className="body">
        <div className="alert info"><Icon name="check" size={14} className="ic" /><div className="body"><b>Shared shell — module-specific workspace</b>This module reuses the same dashboard, queue, detail, audit drawer, and create flow patterns as Records and Clerk. Detail screens not built in this exploration.</div></div>
        <div className="grid-3" style={{ marginTop: 16 }}>
          {['Dashboard','Queue / list','Detail workspace','Create flow','Audit / history','Settings'].map(p => (
            <div key={p} className="card"><div className="card-b" style={{ padding: 16 }}><div style={{ fontWeight: 500, marginBottom: 4 }}>{p}</div><div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Follows shared module pattern.</div></div></div>
          ))}
        </div>
      </div>
    </>
  );
}

// Design system page (compact reference)
function DesignSystemPage() {
  return (
    <>
      <div className="page-head">
        <div className="crumbs">CivicSuite design system</div>
        <h1 className="page-title">Design system</h1>
        <p className="page-sub">Tokens, typography, components, and copy model used across CivicSuite.</p>
      </div>
      <div className="body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <div className="section-h"><h3>Color tokens</h3><span className="sub">Civic, trustworthy, calm. Light surface; navy primary; warm gold accent.</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {[
              ['paper','#faf8f3','Page'],['paper-2','#f3efe5','Alt'],['card','#fff','Surface'],['rule','#e3dccb','Rule'],['ink','#1a2330','Ink'],['ink-3','#6b7280','Muted'],
              ['navy','#1a3a52','Primary'],['gold','#b08a2e','Accent'],['seal','#6b3a1f','Seal'],['ok','#2f6b3a','OK'],['warn','#8a5a14','Warn'],['err','#8a2a2a','Err'],
            ].map(([k, hex, lbl]) => (
              <div key={k} style={{ background: hex, height: 72, borderRadius: 8, border: '1px solid var(--rule)', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: ['paper','paper-2','card','rule'].includes(k) ? 'var(--ink)' : ['ok-soft','warn-soft','err-soft','gold-soft','navy-soft'].includes(k) ? 'var(--ink)' : '#fff' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.85 }}>--{k}</div>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="section-h"><h3>Typography</h3><span className="sub">Source Serif 4 for letterhead & titles · Inter for UI · JetBrains Mono for IDs/evidence.</span></div>
          <div className="card"><div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><div className="kicker">H1 · Serif 26</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>City Council · Regular Meeting</div></div>
            <div><div className="kicker">H3 · Serif 16</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>Notice of Public Hearing</div></div>
            <div><div className="kicker">Body · Inter 13</div><div style={{ fontSize: 13 }}>The agenda and supporting documents are available on the City's website.</div></div>
            <div><div className="kicker">Mono · ID 11</div><div className="mono" style={{ fontSize: 11 }}>REQ-1184 · sha256:af20…b934</div></div>
          </div></div>
        </section>

        <section>
          <div className="section-h"><h3>Buttons & badges</h3></div>
          <div className="card"><div className="card-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <button className="btn primary"><Icon name="check" size={13} /> Primary</button>
            <button className="btn">Default</button>
            <button className="btn ghost">Ghost</button>
            <button className="btn danger">Danger</button>
            <span style={{ width: 16 }} />
            <span className="badge ok dot">Approved</span>
            <span className="badge gold dot">Needs review</span>
            <span className="badge warn dot">Notice due</span>
            <span className="badge err dot">Misconfig</span>
            <span className="vis public">Public</span>
            <span className="vis restricted">Closed</span>
            <span className="vis draft">Draft</span>
          </div></div>
        </section>

        <section>
          <div className="section-h"><h3>States & alerts</h3></div>
          <div className="grid-2">
            <div className="alert"><Icon name="check" size={14} className="ic" /><div className="body"><b>Default</b>Neutral status — informational only.</div></div>
            <div className="alert ok"><Icon name="check" size={14} className="ic" /><div className="body"><b>Success</b>Notice posted to portal at 6:30 PM.</div></div>
            <div className="alert warn"><Icon name="flag" size={14} className="ic" /><div className="body"><b>Warning</b>Posting deadline in 5h 12m.</div></div>
            <div className="alert err"><Icon name="flag" size={14} className="ic" /><div className="body"><b>Error</b>Connector credentials rejected.</div></div>
          </div>
        </section>

        <section>
          <div className="section-h"><h3>Copy model — partial</h3></div>
          <div className="card"><table className="tbl"><thead><tr><th style={{ width: 120 }}>State</th><th>Pattern</th><th>Example</th></tr></thead><tbody>
            <tr><td><span className="badge dot">Empty</span></td><td>What to create / import / configure first</td><td>"No motions or votes yet — these appear when the meeting is held."</td></tr>
            <tr><td><span className="badge gold dot">Partial</span></td><td>What succeeded, what failed, what to retry</td><td>"5 of 7 checklist items complete. 2 still required to post."</td></tr>
            <tr><td><span className="badge err dot">Error</span></td><td>What failed, why, how to fix</td><td>"Vimeo credentials rejected since 2:14 AM. Re-enter token to restore livestream."</td></tr>
            <tr><td><span className="badge ok dot">Success</span></td><td>What happened, next safe step</td><td>"Notice posted. 1,247 subscribers were notified. View posting proof."</td></tr>
            <tr><td><span className="vis restricted">Restricted</span></td><td>Why it isn't public, who can access</td><td>"Closed-session content. Visible to clerks and assigned attorneys only."</td></tr>
          </tbody></table></div>
        </section>
      </div>
    </>
  );
}

// IA page — navigation maps + journeys
function IAPage({ install }) {
  const partial = install === 'partial';
  return (
    <>
      <div className="page-head">
        <div className="crumbs">Information architecture</div>
        <h1 className="page-title">Information architecture</h1>
        <p className="page-sub">Navigation maps for staff, resident, and admin surfaces · partial vs full install · cross-module key journeys.</p>
      </div>
      <div className="body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <div className="section-h"><h3>Three surfaces, one shell</h3></div>
          <div className="grid-3">
            {[
              { ttl: 'Staff workspace', sub: 'Clerks, records, dept users, attorneys, admins, managers', items: ['Global dashboard','My tasks','Global search','Module nav (installed only)','Recently viewed','Notifications','User menu','Help','Admin (if authorized)'] },
              { ttl: 'Resident portal', sub: 'Public — radically simpler', items: ['Search city records','Public meetings','Agendas / packets / minutes','Records request status','Submit records request','Public notices','Municipal code (if installed)','Subscribe (later)'] },
              { ttl: 'IT/Admin console', sub: 'Operational truth', items: ['Installed modules','Module enable/disable','Service health','Version & compatibility','Identity / SSO','Backups','Connectors','Suggestions service','Updates','Logs / audit exports','Public portal config'] },
            ].map(s => (
              <div key={s.ttl} className="card"><div className="card-h"><div className="ttl">{s.ttl}<small>{s.sub}</small></div></div><div className="card-b" style={{ padding: 8 }}>
                {s.items.map((it, i) => <div key={i} style={{ padding: '6px 10px', fontSize: 12.5, borderBottom: i < s.items.length-1 ? '1px solid var(--rule)' : '0', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="chev-r" size={11} style={{ color: 'var(--ink-4)' }} />{it}</div>)}
              </div></div>
            ))}
          </div>
        </section>

        <section>
          <div className="section-h"><h3>Module navigation — full vs partial install</h3><span className="sub">Modules only appear in nav if installed. Cross-module links resolve to a configuration notice (admin) when the target is missing.</span></div>
          <div className="grid-2">
            <div className="card">
              <div className="card-h"><div className="ttl">Full install</div><span className="badge ok dot" style={{ marginLeft: 'auto' }}>14 modules</span></div>
              <div className="card-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 4 }}>
                {window.CIVIC.ALL_MODULES.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 12, borderRadius: 6, background: 'var(--paper-2)' }}>
                    <Icon name={window.MODULE_ICON[m.id]} size={13} style={{ color: 'var(--navy)' }} />{m.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-h"><div className="ttl">Partial install</div><span className="badge gold dot" style={{ marginLeft: 'auto' }}>4 modules</span></div>
              <div className="card-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 4 }}>
                {window.CIVIC.ALL_MODULES.map(m => {
                  const ok = window.CIVIC.PARTIAL_MODULES.includes(m.id);
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', fontSize: 12, borderRadius: 6, background: ok ? 'var(--paper-2)' : 'transparent', opacity: ok ? 1 : 0.4 }}>
                      <Icon name={window.MODULE_ICON[m.id]} size={13} style={{ color: ok ? 'var(--navy)' : 'var(--ink-4)' }} />{m.name} {!ok && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-4)' }}>hidden</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-h"><h3>Key cross-module journeys</h3></div>
          <div className="col">
            {[
              { ttl: '1 · Start of day', steps: ['Sign in','Land on dashboard','See today / soon / later queues','Open most-urgent queue item','Take action / send back / approve'] },
              { ttl: '2 · Search across city work', steps: ['⌘K from anywhere','Type query','See grouped results across installed modules','Open result','Land in module detail'] },
              { ttl: '3 · Queue → decision', steps: ['Open queue (e.g. Records)','Open request detail','Review source + suggested redactions','Decide each segment','Build release package · audit recorded'] },
              { ttl: '4 · Publish / export', steps: ['Open detail','Compile or build package','Preview public-safe view','Confirm visibility','Post — proof captured · audit recorded'] },
              { ttl: '5 · Audit trail', steps: ['Open object','Click "Audit & Evidence"','Right-side drawer slides in','Inspect history, evidence, exports','Export audit log if needed'] },
            ].map(j => (
              <div key={j.ttl} className="card"><div className="card-h"><div className="ttl">{j.ttl}</div></div><div className="card-b">
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
                  {j.steps.map((s, i) => (
                    <React.Fragment key={i}>
                      <div style={{ background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}>{s}</div>
                      {i < j.steps.length - 1 && <Icon name="chev-r" size={14} style={{ color: 'var(--ink-4)', margin: '0 6px' }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div></div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

window.CodeModule = CodeModule;
window.ModuleNotInstalled = ModuleNotInstalled;
window.ModulePlaceholder = ModulePlaceholder;
window.DesignSystemPage = DesignSystemPage;
window.IAPage = IAPage;
