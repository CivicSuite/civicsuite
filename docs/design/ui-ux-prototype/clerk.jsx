// clerk.jsx — CivicClerk module: calendar + meeting detail

const { useState: useStateC } = React;

function ClerkCalendar({ setPage, openAudit }) {
  const [bodyFilter, setBodyFilter] = useStateC('all');
  const meetings = window.CIVIC.MEETINGS;
  const bodies = window.CIVIC.MEETING_BODIES;

  // May 2026 calendar; May 1 is Friday
  const startDow = 5; // Friday
  const daysInMonth = 31;
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push({ day: 30 - (startDow - 1 - i), dim: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - startDow - daysInMonth + 1, dim: true });

  return (
    <>
      <div className="page-head">
        <div className="crumbs">
          <a href="#">Workspace</a> <span className="sep">›</span>
          <a href="#">Clerk</a> <span className="sep">›</span>
          Calendar
        </div>
        <div className="page-head-row">
          <div>
            <h1 className="page-title">CivicClerk · Meeting calendar</h1>
            <p className="page-sub">5 bodies · 8 upcoming meetings · cycle dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn"><Icon name="download" size={13} /> Export</button>
            <button className="btn primary"><Icon name="plus" size={13} /> Schedule meeting</button>
          </div>
        </div>
        <div className="page-tabs">
          <button className="on">Calendar<span className="pill">8</span></button>
          <button>Review queue<span className="pill">4</span></button>
          <button>Meeting bodies</button>
          <button>Notice checklist</button>
          <button>Public archive</button>
        </div>
      </div>

      <div className="body">
        <div className="grid-cards" style={{ gridTemplateColumns: '1fr 280px' }}>
          <div className="cal">
            <div className="cal-h">
              <button className="iconbtn"><Icon name="chev-l" size={14} /></button>
              <div className="month">May 2026</div>
              <button className="iconbtn"><Icon name="chev-r" size={14} /></button>
              <button className="btn sm" style={{ marginLeft: 8 }}>Today</button>
              <div className="spacer" />
              <div className="surface-switch" style={{ background: 'var(--paper-2)' }}>
                <button className="on">Month</button>
                <button>Week</button>
                <button>List</button>
              </div>
              <select className="select" style={{ height: 28, fontSize: 12 }} value={bodyFilter} onChange={e => setBodyFilter(e.target.value)}>
                <option value="all">All bodies</option>
                {bodies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="cal-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="dow">{d}</div>)}
              {cells.map((c, i) => {
                const dayMeetings = c.dim ? [] : meetings.filter(m => m.day === c.day && (bodyFilter === 'all' || m.body === bodyFilter) && !m.past);
                const isToday = !c.dim && c.day === 30 && i < 35; // April 30 is "today" — show as a marker on the cell labelled 30 in dim row OR show today on May 1 area; use d=1 as fake "today" indicator placeholder
                const showAsToday = !c.dim && c.day === 1;
                return (
                  <div key={i} className={'cal-cell' + (c.dim ? ' dim' : '') + (showAsToday ? ' today' : '')}>
                    <div className="dn">{c.day}</div>
                    {dayMeetings.map(m => {
                      const stageColor = m.stage === 'packet' ? 'gold' : m.stage === 'agenda' ? '' : m.stage === 'notice' ? 'ok' : '';
                      return (
                        <div key={m.id} className={'cal-evt ' + stageColor} onClick={() => m.id === 'M-2026-053' ? setPage('clerk-detail') : null} title={`${m.ttl} · ${m.time} · ${m.stage}`}>
                          {m.time.replace(' PM','p').replace(' AM','a')} · {bodies.find(b=>b.id===m.body)?.name.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col">
            <div className="card">
              <div className="card-h"><div className="ttl">In review now</div></div>
              <div className="card-b" style={{ padding: 0 }}>
                {meetings.filter(m => !m.past && m.stage !== 'scheduled').slice(0, 4).map(m => {
                  const body = bodies.find(b => b.id === m.body);
                  const stageObj = window.CIVIC.LIFECYCLE.find(l => l.id === m.stage);
                  return (
                    <div key={m.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--rule)', cursor: 'default' }}
                         onClick={() => m.id === 'M-2026-053' ? setPage('clerk-detail') : null}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-3)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: body?.color }} />
                        {body?.name}
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{m.id}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{m.ttl}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>May {m.day}, {m.time}</div>
                      <div style={{ marginTop: 6 }}>
                        <span className={'badge ' + (m.stage === 'packet' ? 'gold' : m.stage === 'notice' ? 'ok' : 'info')} >
                          <Icon name={m.stage === 'packet' ? 'eye' : 'edit'} size={10} />
                          {stageObj?.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-h"><div className="ttl">Posting deadlines</div></div>
              <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="alert warn">
                  <Icon name="flag" size={14} className="ic" />
                  <div className="body">
                    <b>Council May 5 — 72-hour notice</b>
                    Posts by Sat May 2, 6:30 PM. <span className="muted">5h 12m left.</span>
                  </div>
                </div>
                <div className="alert info">
                  <Icon name="bell" size={14} className="ic" />
                  <div className="body">
                    <b>Planning May 7</b>
                    Notice window opens tomorrow.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LifecycleRibbon({ currentIdx, onClickStage }) {
  return (
    <div className="ribbon">
      {window.CIVIC.LIFECYCLE.map((s, i) => (
        <div key={s.id} className={'ribbon-step' + (i < currentIdx ? ' done' : i === currentIdx ? ' current' : '')} onClick={() => onClickStage?.(s.id, i)}>
          <span className="num">{String(i+1).padStart(2,'0')}</span>{s.name}
        </div>
      ))}
    </div>
  );
}

function MeetingDetail({ setPage, openAudit }) {
  const m = window.CIVIC.FOCUSED_MEETING;
  const [tab, setTab] = useStateC('agenda');
  const [drawerOpen, setDrawerOpen] = useStateC(false);
  const [packetState, setPacketState] = useStateC('review'); // review | building | ready
  const [selectedItem, setSelectedItem] = useStateC(null);

  const stageIdx = m.stageIdx;

  return (
    <>
      <div className="letterhead">
        <div className="seal-row">City of Brookfield · Office of the City Clerk</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="crumbs" style={{ marginBottom: 8 }}>
              <a href="#" onClick={e => { e.preventDefault(); setPage('clerk'); }}>Clerk</a> <span className="sep">›</span>
              <a href="#" onClick={e => { e.preventDefault(); setPage('clerk'); }}>Calendar</a> <span className="sep">›</span>
              May 5, 2026 · City Council
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              City Council · Regular Meeting
            </h1>
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              {m.date} · {m.time} · {m.location}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge gold dot"><Icon name="eye" size={10} />Packet review</span>
              <span className="badge"><span className="mono">{m.id}</span></span>
              <span className="vis public">Public agenda</span>
              <span className="badge warn dot"><Icon name="bell" size={10} />Notice posts in 5h 12m</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" onClick={() => openAudit({ kind: 'Meeting', id: m.id, events: m.audit })}>
              <Icon name="history" size={13} /> Audit & Evidence
            </button>
            <button className="btn"><Icon name="download" size={13} /> Export</button>
            <button className="btn primary"><Icon name="send" size={13} /> Post notice</button>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <LifecycleRibbon currentIdx={stageIdx} onClickStage={(id, i) => setDrawerOpen(true)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '0 32px', borderBottom: '1px solid var(--rule)', background: 'var(--card)' }}>
        {[
          { id: 'agenda',  lbl: 'Agenda', count: m.agenda.length },
          { id: 'packet',  lbl: 'Packet builder' },
          { id: 'notice',  lbl: 'Notice checklist' },
          { id: 'minutes', lbl: 'Minutes' },
          { id: 'votes',   lbl: 'Outcomes' },
          { id: 'public',  lbl: 'Public preview' },
        ].map(t => (
          <button key={t.id} className={'btn ghost ' + (tab === t.id ? '' : '')} onClick={() => setTab(t.id)}
                  style={{ borderRadius: 0, borderBottom: tab === t.id ? '2px solid var(--navy)' : '2px solid transparent', color: tab === t.id ? 'var(--navy)' : 'var(--ink-3)', fontWeight: tab === t.id ? 500 : 400, padding: '10px 12px' }}>
            {t.lbl}{t.count != null && <span className="pill" style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', padding: '1px 6px', borderRadius: 8, fontSize: 10, marginLeft: 4 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'agenda' && (
        <div className="body">
          <div className="alert warn" style={{ marginBottom: 16 }}>
            <Icon name="flag" size={14} className="ic" />
            <div className="body">
              <b>3 items need your review</b>
              Items 6, 7, and 9 were submitted by departments and have not been approved for the agenda. Item 6 has a validation warning.
              <div className="actions">
                <button className="btn sm primary">Review next</button>
                <button className="btn sm ghost">Approve all clean items</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <div className="card">
              <div className="card-h">
                <div className="ttl">Agenda items<small>{m.agenda.length} items · {m.agenda.filter(a=>a.status==='approved').length} approved</small></div>
                <div className="right">
                  <button className="btn sm ghost"><Icon name="filter" size={12} /></button>
                  <button className="btn sm"><Icon name="plus" size={12} /> Add item</button>
                </div>
              </div>
              <div className="card-b flush">
                {m.agenda.map((a, i) => (
                  <div key={i}
                       onClick={() => setSelectedItem(i)}
                       className={(selectedItem === i ? 'selected ' : '')}
                       style={{
                         display: 'grid',
                         gridTemplateColumns: '40px 1fr auto',
                         gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'flex-start',
                         background: selectedItem === i ? 'var(--navy-soft)' : (a.status === 'review' ? 'rgba(245,237,214,0.35)' : 'transparent'),
                         cursor: 'default',
                       }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', paddingTop: 1 }}>{a.num}</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: a.type === 'procedural' ? 400 : 500 }}>
                        {a.ttl}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4, display: 'flex', gap: 12 }}>
                        <span>{a.dept}</span>
                        <span><Icon name="tag" size={10} style={{ verticalAlign: '-1px' }} /> {a.type}</span>
                      </div>
                      {a.warn && (
                        <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--warn)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                          <Icon name="flag" size={11} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{a.warn}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <span className={'vis ' + a.vis}>{a.vis === 'public' ? 'Public' : a.vis === 'restricted' ? 'Closed' : 'Draft'}</span>
                      {a.status === 'approved' && <span className="badge ok dot" style={{ fontSize: 9.5 }}>Approved</span>}
                      {a.status === 'review' && <span className="badge gold dot" style={{ fontSize: 9.5 }}>Needs review</span>}
                      {a.status === 'submitted' && <span className="badge info dot" style={{ fontSize: 9.5 }}>Submitted</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item inspector */}
            <div className="col">
              {selectedItem !== null ? (
                <div className="card">
                  <div className="card-h">
                    <div className="ttl">Item {m.agenda[selectedItem].num.replace('.','')} review</div>
                  </div>
                  <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div className="kicker">Title</div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{m.agenda[selectedItem].ttl}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><div className="kicker">Submitted by</div><div style={{ fontSize: 12, marginTop: 4 }}>{m.agenda[selectedItem].dept}</div></div>
                      <div><div className="kicker">Type</div><div style={{ fontSize: 12, marginTop: 4 }}>{m.agenda[selectedItem].type}</div></div>
                    </div>
                    <div>
                      <div className="kicker">Visibility</div>
                      <div style={{ marginTop: 4 }}>
                        <span className={'vis ' + m.agenda[selectedItem].vis}>{m.agenda[selectedItem].vis === 'public' ? 'Public' : 'Closed session'}</span>
                      </div>
                    </div>
                    {m.agenda[selectedItem].warn && (
                      <div className="alert warn" style={{ padding: '8px 10px', fontSize: 11.5 }}>
                        <Icon name="flag" size={12} className="ic" />
                        <div className="body">{m.agenda[selectedItem].warn}</div>
                      </div>
                    )}
                    <div className="evidence">
                      <Icon name="pin" size={12} className="pin" />
                      <div>
                        <b style={{ fontSize: 11.5 }}>Source attachments</b>
                        <div className="src" style={{ marginTop: 4 }}>3 files · 1.4 MB · sha256:af20…b934</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn primary sm" style={{ flex: 1 }}><Icon name="check" size={12} /> Approve</button>
                      <button className="btn sm" style={{ flex: 1 }}>Send back</button>
                      <button className="btn ghost sm"><Icon name="dots" size={12} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-b">
                    <div className="empty">
                      <div className="ic"><Icon name="eye" size={24} /></div>
                      <div className="ttl">Pick an agenda item</div>
                      <div className="body">Select a row to review submission, attachments, and validation.</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-h"><div className="ttl">Documents <small>{m.documents.length} files</small></div></div>
                <div className="card-b" style={{ padding: 8 }}>
                  <div className="rail">
                    {m.documents.map((d, i) => (
                      <div key={i} className="doc">
                        <div className="docic">{d.kind}</div>
                        <div>
                          <div className="nm">{d.nm}</div>
                          <div className="meta">{d.meta} · <span className={'vis ' + d.vis} style={{ padding: '1px 6px', fontSize: 9.5 }}>{d.vis}</span></div>
                        </div>
                        {d.warn && <Icon name="flag" size={13} style={{ color: 'var(--warn)' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'packet' && <PacketBuilder />}
      {tab === 'notice' && <NoticeChecklist />}
      {tab === 'minutes' && <MinutesEmpty />}
      {tab === 'votes' && <OutcomesEmpty />}
      {tab === 'public' && <PublicPreview meeting={m} />}

      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,30,42,0.32)', zIndex: 60 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 52, right: 0, bottom: 0, width: 380, background: 'var(--card)', borderLeft: '1px solid var(--rule)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="audit-h">
              <Icon name="history" size={18} style={{ color: 'var(--gold-2)' }} />
              <div style={{ flex: 1 }}>
                <div className="ttl">Lifecycle timeline</div>
                <div className="sub">Council May 5, 2026 · {m.id}</div>
              </div>
              <button className="iconbtn" onClick={() => setDrawerOpen(false)}><Icon name="x" size={14} /></button>
            </div>
            <div className="audit-b">
              {window.CIVIC.LIFECYCLE.map((s, i) => {
                const state = i < stageIdx ? 'done' : i === stageIdx ? 'current' : 'future';
                const dates = ['Apr 28, 8:00 AM', 'Apr 28 → 30', 'Apr 30 → May 2', 'May 2, 6:30 PM', 'May 5, 6:30 PM', 'May 6 → 12', 'May 19', 'May 20'];
                const detail = ['M. Vasquez scheduled', 'Departments submitted 4 items', 'Clerk reviewing — 3 items pending', 'Notice posts to portal & gazette', '—', '—', 'Adopted at next meeting', 'Auto-archive'];
                return (
                  <div key={s.id} className={'audit-event ' + (state === 'done' ? '' : state === 'current' ? 'publish' : '')} style={{ opacity: state === 'future' ? 0.55 : 1 }}>
                    <div className="marker" style={{ borderColor: state === 'done' ? 'var(--ok)' : state === 'current' ? 'var(--gold)' : 'var(--ink-4)', background: state === 'done' ? 'var(--ok)' : 'var(--card)' }} />
                    <div>
                      <div className="ev-h">{String(i+1).padStart(2,'0')} · {s.name} {state==='current' && <span className="badge gold dot" style={{ marginLeft: 6, fontSize: 9.5 }}>now</span>}</div>
                      <div className="ev-meta">{dates[i]}</div>
                      <div className="ev-body">{detail[i]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PacketBuilder() {
  const [items, setItems] = useStateC([
    { id: 1, ttl: 'Cover sheet & agenda',                 inc: true, pages: 2 },
    { id: 2, ttl: 'Item 4 — Apr 21 minutes',              inc: true, pages: 8 },
    { id: 3, ttl: 'Item 6 — Resolution 2026-14',          inc: true, pages: 4 },
    { id: 4, ttl: 'Item 6 — Fiscal note (attachment)',    inc: true, pages: 52, warn: 'Large attachment — 52 pages' },
    { id: 5, ttl: 'Item 7 — Ordinance 2026-08',           inc: true, pages: 18 },
    { id: 6, ttl: 'Item 8 — Maple Ave contract',          inc: true, pages: 34 },
    { id: 7, ttl: 'Item 9 — Personnel matter (closed)',   inc: false, restricted: true, pages: 12 },
    { id: 8, ttl: 'Public comment intake (placeholder)',  inc: true, pages: 4 },
  ]);
  const totalPages = items.filter(i => i.inc).reduce((a, i) => a + i.pages, 0);

  return (
    <div className="body">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div className="card">
          <div className="card-h">
            <div className="ttl">Packet contents <small>{items.filter(i=>i.inc).length} of {items.length} included · {totalPages} pages</small></div>
            <div className="right">
              <button className="btn sm ghost"><Icon name="upload" size={12} /> Add</button>
              <button className="btn sm primary"><Icon name="pkg" size={12} /> Compile packet</button>
            </div>
          </div>
          <div className="card-b flush">
            {items.map(it => (
              <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 80px 80px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'center' }}>
                <input type="checkbox" checked={it.inc} onChange={e => setItems(prev => prev.map(x => x.id === it.id ? { ...x, inc: e.target.checked } : x))} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{it.ttl}</div>
                  {it.warn && <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 2 }}><Icon name="flag" size={10} /> {it.warn}</div>}
                  {it.restricted && <div style={{ fontSize: 11, color: 'var(--err)', marginTop: 2 }}><Icon name="lock" size={10} /> Restricted — closed-session only packet</div>}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{it.pages}p</div>
                <div><span className={'vis ' + (it.restricted ? 'restricted' : 'public')}>{it.restricted ? 'Closed' : 'Public'}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-h"><div className="ttl">Compile</div></div>
            <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field"><label>Packet name</label><input className="input" defaultValue="Packet — Council May 5, 2026" /></div>
              <div className="field"><label>Bookmarks</label>
                <select className="select"><option>By agenda item (recommended)</option><option>By document</option></select>
              </div>
              <div className="field"><label>Page numbers</label>
                <select className="select"><option>Continuous (1, 2, 3…)</option><option>Per attachment</option></select>
              </div>
              <div className="alert info">
                <Icon name="check" size={14} className="ic" />
                <div className="body">
                  <b>Output: 1 public packet + 1 closed-session addendum</b>
                  Item 9 will be split into a separate restricted PDF.
                </div>
              </div>
              <button className="btn primary lg"><Icon name="pkg" size={14} /> Compile {totalPages}-page packet</button>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><div className="ttl">What gets published</div></div>
            <div className="card-b">
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                The compiled packet posts to the resident portal at notice time. The closed-session addendum is held internally and never appears in public listings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoticeChecklist() {
  const items = [
    { id: 1, ttl: 'Agenda finalized',                                   done: true,  who: 'M. Vasquez · 4:51 PM yesterday' },
    { id: 2, ttl: 'All required attachments included in packet',        done: true,  who: 'Auto-validated' },
    { id: 3, ttl: 'Public + closed visibility correctly tagged',        done: true,  who: 'M. Vasquez · 9:42 AM today' },
    { id: 4, ttl: 'Notice text drafted (template: Open Meetings Act)',  done: true,  who: 'CivicSuite draft · reviewed by clerk' },
    { id: 5, ttl: 'Posting locations selected',                         done: false, who: '3 of 4 selected — missing: lobby kiosk' },
    { id: 6, ttl: 'Notice posted ≥ 72 hours before meeting',            done: false, who: 'Posts at 6:30 PM today (5h 12m)' },
    { id: 7, ttl: 'Posting proof captured (timestamp + screenshot)',    done: false, who: '—' },
  ];
  return (
    <div className="body">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div className="card">
          <div className="card-h">
            <div className="ttl">Notice checklist <small>4 of 7 complete</small></div>
            <div className="right"><button className="btn sm primary"><Icon name="send" size={12} /> Post notice</button></div>
          </div>
          <div className="card-b flush">
            {items.map((it, i) => (
              <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'flex-start' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid ' + (it.done ? 'var(--ok)' : 'var(--rule-strong)'), background: it.done ? 'var(--ok)' : 'transparent', display: 'grid', placeItems: 'center', color: '#fff' }}>
                  {it.done && <Icon name="check" size={11} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: it.done ? 'var(--ink-3)' : 'var(--ink)', textDecoration: it.done ? 'line-through' : 'none' }}>{it.ttl}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{it.who}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="ttl">Posting locations</div></div>
          <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { ttl: 'Resident portal',          on: true,  meta: 'brookfield.gov/meetings' },
              { ttl: 'City Hall lobby kiosk',    on: false, meta: 'Touchscreen display' },
              { ttl: 'Brookfield Times — gazette',on: true,  meta: 'Print + online · email connector' },
              { ttl: 'Email subscribers',        on: true,  meta: '1,247 subscribers to Council body' },
            ].map((p, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--rule)', borderRadius: 7 }}>
                <input type="checkbox" defaultChecked={p.on} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.ttl}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.meta}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MinutesEmpty() {
  return (
    <div className="body">
      <div className="card">
        <div className="card-b">
          <div className="empty">
            <div className="ic"><Icon name="paper" size={28} /></div>
            <div className="ttl">Minutes available after meeting is held</div>
            <div className="body">Once the meeting is held, you can draft minutes here with citations to the recording, motions, and votes recorded by the chair.</div>
            <button className="btn">View Apr 21 minutes (drafted)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutcomesEmpty() {
  return (
    <div className="body">
      <div className="card">
        <div className="card-b">
          <div className="empty">
            <div className="ic"><Icon name="gavel" size={28} /></div>
            <div className="ttl">No motions or votes yet</div>
            <div className="body">Motions, votes, and action items appear here when the meeting is held. Outcomes are linked to agenda items automatically.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicPreview({ meeting }) {
  return (
    <div className="body">
      <div style={{ maxWidth: 760, margin: '0 auto', background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 12, padding: 32, fontFamily: 'var(--font-serif)' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--gold)', paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--gold-2)', textTransform: 'uppercase', marginBottom: 8 }}>City of Brookfield</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{meeting.body}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, fontFamily: 'var(--font-sans)' }}>Notice of Regular Meeting</div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7, fontFamily: 'var(--font-sans)' }}>
          <p style={{ margin: '0 0 12px' }}>Notice is hereby given that the City Council of the City of Brookfield will hold its regular meeting on:</p>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)', margin: '16px 0' }}>{meeting.date}<br/>{meeting.time} · {meeting.location}</p>
          <p style={{ margin: '12px 0' }}>The agenda and supporting documents are available on the City's website. The meeting is open to the public and will include opportunity for public comment.</p>
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--rule)', fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
          Posted by Margaret Vasquez, City Clerk — preview · this notice has not yet been posted publicly.
        </div>
      </div>
    </div>
  );
}

window.ClerkCalendar = ClerkCalendar;
window.MeetingDetail = MeetingDetail;
