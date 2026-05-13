// staff-dashboard.jsx — Staff "Start of Day" dashboard

const { useState: useStateD } = React;

function StaffDashboard({ install, role, setPage, openAudit }) {
  const r = window.CIVIC.ROLES[role];
  const tasks = window.CIVIC.TASKS_BY_ROLE[role];
  const installedModules = window.CIVIC.ALL_MODULES.filter(m => install === 'full' || window.CIVIC.PARTIAL_MODULES.includes(m.id));
  const today = window.CIVIC.TODAY;

  const todayCount = tasks.filter(t => t.urgency === 'today').length;
  const soonCount = tasks.filter(t => t.urgency === 'soon').length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <>
      <div className="page-head">
        <div className="crumbs">Workspace <span className="sep">›</span> Dashboard</div>
        <div className="page-head-row">
          <div>
            <h1 className="page-title">{greeting}, {r.name.split(' ')[0]}.</h1>
            <p className="page-sub">
              Today is {today}. You have <b>{todayCount} item{todayCount===1?'':'s'} due today</b> and <b>{soonCount} due soon</b>.
              {install === 'partial' && <span className="muted"> · Showing work from 3 installed modules.</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn"><Icon name="filter" size={13} /> Filter</button>
            <button className="btn primary"><Icon name="plus" size={13} /> New work item</button>
          </div>
        </div>
      </div>

      <div className="body">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 16 }}>
          <div className="stat">
            <div className="lbl">Due today</div>
            <div className="val">{todayCount}</div>
            <div className="delta">across {new Set(tasks.filter(t=>t.urgency==='today').map(t=>t.module)).size} module(s)</div>
          </div>
          <div className="stat">
            <div className="lbl">Open this week</div>
            <div className="val">{tasks.length}</div>
            <div className="delta up">↓ 3 from last week</div>
          </div>
          <div className="stat">
            <div className="lbl">Awaiting review</div>
            <div className="val">{tasks.filter(t=>t.kind==='review').length}</div>
            <div className="delta">2 with validation warnings</div>
          </div>
          <div className="stat">
            <div className="lbl">Ready to publish</div>
            <div className="val">{tasks.filter(t=>t.kind==='publish').length}</div>
            <div className="delta">requires final approval</div>
          </div>
        </div>

        <div className="grid-cards">
          {/* Attention queue */}
          <div className="card">
            <div className="card-h">
              <Icon name="inbox" size={15} style={{ color: 'var(--navy)' }} />
              <div className="ttl">My attention queue<small>{tasks.length} items</small></div>
              <div className="right">
                <button className="btn sm ghost"><Icon name="sort" size={12} /> Urgency</button>
                <button className="btn sm ghost">View all</button>
              </div>
            </div>
            <div className="card-b flush">
              {['today','soon','later'].map(group => {
                const items = tasks.filter(t => t.urgency === group);
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <div style={{ padding: '10px 16px 6px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: group==='today'?'var(--err)':group==='soon'?'var(--warn)':'var(--ink-4)', background: 'var(--paper-2)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                      {group === 'today' ? 'Due today' : group === 'soon' ? 'Due this week' : 'Later this month'}
                      <span style={{ color: 'var(--ink-4)', fontWeight: 400, marginLeft: 6 }}>· {items.length}</span>
                    </div>
                    {items.map(t => (
                      <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '24px 90px 1fr auto', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'center', cursor: 'default' }}
                           onClick={() => { if (t.module === 'records' && t.id === 'REQ-1184') setPage('records-detail'); else if (t.module === 'clerk') setPage('clerk-detail'); else setPage(t.module); }}
                           onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
                           onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <Icon name={t.kind==='review'?'eye':t.kind==='publish'?'send':t.kind==='draft'?'edit':t.kind==='approve'?'check':t.kind==='intake'?'inbox':t.kind==='error'?'flag':'doc'} size={14} style={{ color: t.kind==='error'?'var(--err)':'var(--ink-3)' }} />
                        <div>
                          <div className="badge" style={{ fontSize: 10 }}>
                            <Icon name={window.MODULE_ICON[t.module]} size={10} />
                            {window.CIVIC.ALL_MODULES.find(m => m.id === t.module)?.shortName}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{t.ttl}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.meta}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{t.id}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side column */}
          <div className="col">
            {/* System alerts */}
            <div className="card">
              <div className="card-h">
                <Icon name="flag" size={15} style={{ color: 'var(--warn)' }} />
                <div className="ttl">System alerts<small>2 active</small></div>
              </div>
              <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="alert warn">
                  <Icon name="flag" size={14} className="ic" />
                  <div className="body">
                    <b>Notice posting deadline tonight</b>
                    Council May 5 — 72-hr notice must post by 6:30 PM (5h 12m).
                    <div className="actions"><button className="btn sm">Post now</button><button className="btn sm ghost">Review checklist</button></div>
                  </div>
                </div>
                <div className="alert info">
                  <Icon name="puzzle" size={14} className="ic" />
                  <div className="body">
                    <b>Connector — Vimeo</b>
                    Livestream credentials rejected since 2:14 AM. <a href="#" style={{ color: 'inherit' }} onClick={e => { e.preventDefault(); setPage('admin'); }}>Open Admin →</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Module shortcuts */}
            <div className="card">
              <div className="card-h">
                <Icon name="puzzle" size={15} style={{ color: 'var(--navy)' }} />
                <div className="ttl">Shortcuts</div>
              </div>
              <div className="card-b" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {installedModules.filter(m => m.id !== 'admin' && m.id !== 'portal').slice(0, 6).map(m => (
                  <a key={m.id} className="shortcut" onClick={() => setPage(m.id)} href="#">
                    <span className="ic"><Icon name={window.MODULE_ICON[m.id]} size={13} /></span>
                    <span>{m.shortName}</span>
                  </a>
                ))}
                {install === 'partial' && (
                  <div style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--ink-3)', padding: '6px 4px', borderTop: '1px solid var(--rule)', marginTop: 4 }}>
                    {window.CIVIC.PARTIAL_MODULES.length} of 14 modules installed. Switch <b>Install</b> tweak to compare.
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="card">
              <div className="card-h">
                <Icon name="history" size={15} style={{ color: 'var(--navy)' }} />
                <div className="ttl">Recent across the city</div>
              </div>
              <div className="card-b" style={{ padding: 0 }}>
                {[
                  { who: 'L. Petrillo', ev: 'submitted agenda item — Ord. 2026-08', mod: 'clerk', ts: '17m ago' },
                  { who: 'M. Patel', ev: 'acknowledged release fee — REQ-1180', mod: 'records', ts: '42m ago' },
                  { who: 'F. Atherton', ev: 'submitted fiscal note for Bond Issuance', mod: 'clerk', ts: '1h ago' },
                  { who: 'CivicSuite', ev: 'auto-archived 4 meetings older than 5 years', mod: 'clerk', ts: '6h ago' },
                ].map((a, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--rule)', fontSize: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div className="avatar" style={{ width: 22, height: 22, fontSize: 9, flexShrink: 0 }}>
                      {a.who === 'CivicSuite' ? <Icon name="gear" size={11} /> : a.who.split(' ').map(s => s[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500 }}>{a.who}</span>{' '}
                      <span style={{ color: 'var(--ink-2)' }}>{a.ev}</span>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                        <Icon name={window.MODULE_ICON[a.mod]} size={10} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                        {window.CIVIC.ALL_MODULES.find(m => m.id === a.mod)?.shortName} · {a.ts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.StaffDashboard = StaffDashboard;
