// records.jsx — CivicRecords AI module: list + request workspace

const { useState: useStateR } = React;

const REQ_STATUS_BADGE = {
  intake:  { lbl: 'Intake',           cls: 'info' },
  review:  { lbl: 'Exemption review', cls: 'gold' },
  release: { lbl: 'Ready to release', cls: 'ok' },
  wait:    { lbl: 'Awaiting requestor', cls: 'warn' },
  released:{ lbl: 'Released',         cls: '' },
};

function RecordsList({ setPage }) {
  const reqs = window.CIVIC.RECORDS_REQUESTS;
  const open = reqs.filter(r => r.status !== 'released');
  const [q, setQ] = useStateR('');
  const filtered = open.filter(r => !q || (r.ttl + ' ' + r.requestor + ' ' + r.id).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="page-head">
        <div className="crumbs"><a href="#">Workspace</a> <span className="sep">›</span> <a href="#">Records</a> <span className="sep">›</span> Open requests</div>
        <div className="page-head-row">
          <div>
            <h1 className="page-title">CivicRecords · Public records requests</h1>
            <p className="page-sub">{open.length} open · 2 due this week · 1 overdue</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn"><Icon name="download" size={13} /> Export</button>
            <button className="btn primary"><Icon name="plus" size={13} /> Log new request</button>
          </div>
        </div>
        <div className="page-tabs">
          <button className="on">Open<span className="pill">{open.length}</span></button>
          <button>Released<span className="pill">2</span></button>
          <button>Public portal queue</button>
          <button>Data sources</button>
        </div>
      </div>

      <div className="body">
        <div className="grid-4" style={{ marginBottom: 16 }}>
          <div className="stat"><div className="lbl">Open</div><div className="val">{open.length}</div><div className="delta">avg age 5.2 days</div></div>
          <div className="stat"><div className="lbl">Due this week</div><div className="val">2</div><div className="delta">REQ-1180, REQ-1184</div></div>
          <div className="stat"><div className="lbl">Awaiting requestor</div><div className="val">1</div><div className="delta">fee acknowledgment</div></div>
          <div className="stat"><div className="lbl">Released this month</div><div className="val">8</div><div className="delta up">↑ 2 from prev. month</div></div>
        </div>

        <div className="card">
          <div className="card-h">
            <div className="ttl">Request queue</div>
            <div className="right" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div className="search" style={{ height: 28, fontSize: 12, padding: '0 8px', minWidth: 220 }}>
                <Icon name="search" size={12} />
                <input style={{ border: 0, outline: 0, background: 'transparent', flex: 1, font: 'inherit' }} placeholder="Search requests…" value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <button className="btn sm ghost"><Icon name="filter" size={12} /></button>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Request</th>
                <th style={{ width: 140 }}>Requestor</th>
                <th style={{ width: 100 }}>Received</th>
                <th style={{ width: 110 }}>Due</th>
                <th style={{ width: 130 }}>Status</th>
                <th style={{ width: 90 }}>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={r.id === 'REQ-1184' ? 'selected' : ''}
                    onClick={() => r.id === 'REQ-1184' ? setPage('records-detail') : null}
                    style={{ cursor: r.id === 'REQ-1184' ? 'default' : 'default' }}>
                  <td>
                    <div className="ttl">{r.ttl}</div>
                    <div className="meta"><span className="id">{r.id}</span> · assigned to {r.assignee}</div>
                  </td>
                  <td>{r.requestor}</td>
                  <td className="meta">{r.received}</td>
                  <td>
                    {r.dueIn < 0 ? <span className="badge err dot">{Math.abs(r.dueIn)}d overdue</span> :
                     r.dueIn <= 3 ? <span className="badge warn dot">{r.dueIn}d left</span> :
                     <span className="meta">{r.dueIn}d</span>}
                  </td>
                  <td><span className={'badge ' + REQ_STATUS_BADGE[r.status].cls + ' dot'}>{REQ_STATUS_BADGE[r.status].lbl}</span></td>
                  <td><span className={'vis ' + r.vis}>{r.vis === 'public' ? 'Public' : 'Restricted'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function RecordsDetail({ setPage, openAudit }) {
  const r = window.CIVIC.FOCUSED_REQUEST;
  const [tab, setTab] = useStateR('review');
  const auditEvents = [
    { ts: 'Apr 30, 2026 · 10:18 AM', who: 'D. Chen',     role: 'Records', ev: 'Started exemption review',   detail: '3,940 of 4,127 documents auto-screened. 12 marked exempt under §6254(c).' },
    { ts: 'Apr 29, 2026 · 3:02 PM',  who: 'CivicSuite',  role: 'system',  ev: 'Suggested redactions',       detail: '187 candidates flagged for review (PII, closed-session content).', kind: 'system' },
    { ts: 'Apr 28, 2026 · 9:14 AM',  who: 'D. Chen',     role: 'Records', ev: 'Pulled 4,127 source docs',   detail: 'From: Meeting Recordings, Granicus archive (read-only).', hash: 'sha256:c19f…2dd1' },
    { ts: 'Apr 26, 2026 · 1:30 PM',  who: 'K. Whitford', role: 'Public',  ev: 'Acknowledged $24 fee',       detail: 'Payment recorded. Clock continues.' },
    { ts: 'Apr 23, 2026 · 11:05 AM', who: 'CivicSuite',  role: 'system',  ev: 'Request received via portal', detail: 'Auto-acknowledged. Day 1 of 10.', kind: 'system' },
  ];

  return (
    <>
      <div className="letterhead">
        <div className="seal-row">City of Brookfield · Office of Public Records</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="crumbs" style={{ marginBottom: 8 }}>
              <a href="#" onClick={e => { e.preventDefault(); setPage('records'); }}>Records</a> <span className="sep">›</span>
              <a href="#" onClick={e => { e.preventDefault(); setPage('records'); }}>Open requests</a> <span className="sep">›</span>
              {r.id}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600, margin: '0 0 4px' }}>{r.ttl}</h1>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              Requestor: {r.requestor} · <span className="mono">{r.id}</span> · received {r.received} · due {r.due}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge gold dot">Exemption review</span>
              <span className="vis restricted">Contains restricted content</span>
              <span className="badge warn dot">3 days left</span>
              <span className="badge"><Icon name="check" size={10} /> Fee acknowledged</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" onClick={() => openAudit({ kind: 'Records request', id: r.id, events: auditEvents })}>
              <Icon name="history" size={13} /> Audit & Evidence
            </button>
            <button className="btn"><Icon name="send" size={13} /> Message requestor</button>
            <button className="btn primary"><Icon name="pkg" size={13} /> Build release package</button>
          </div>
        </div>

        {/* Day-of-deadline bar */}
        <div style={{ marginTop: 16, background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon name="history" size={16} style={{ color: 'var(--gold-2)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Day {r.dayOf} of {r.dayTotal} · {r.due}</div>
            <div style={{ height: 4, background: 'var(--paper-3)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(r.dayOf/r.dayTotal)*100}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }} />
            </div>
          </div>
          <span className="badge warn">3 days remaining</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '0 32px', borderBottom: '1px solid var(--rule)', background: 'var(--card)' }}>
        {[
          { id: 'review',   lbl: 'Exemption review', count: r.flagged },
          { id: 'sources',  lbl: 'Sources', count: 4 },
          { id: 'corresp',  lbl: 'Correspondence', count: 6 },
          { id: 'release',  lbl: 'Release package' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn ghost"
                  style={{ borderRadius: 0, borderBottom: tab === t.id ? '2px solid var(--navy)' : '2px solid transparent', color: tab === t.id ? 'var(--navy)' : 'var(--ink-3)', fontWeight: tab === t.id ? 500 : 400, padding: '10px 12px' }}>
            {t.lbl}{t.count != null && <span className="pill" style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', padding: '1px 6px', borderRadius: 8, fontSize: 10, marginLeft: 4 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'review' && <ReviewWorkspace />}
      {tab === 'sources' && <SourcesView />}
      {tab === 'corresp' && <CorrespondenceView />}
      {tab === 'release' && <ReleasePackageView />}
    </>
  );
}

function ReviewWorkspace() {
  const r = window.CIVIC.FOCUSED_REQUEST;
  const flags = [
    { id: 'F-1', src: 'M-2024-094 · 12:14 → 12:31', kind: 'PII',           text: 'Speaker stated personal address during open comment.', exempt: 'redact' },
    { id: 'F-2', src: 'M-2024-094 · 1:47 → 1:52',   kind: 'Closed session',text: 'Audio overlap with following closed session start. Trim recommended.', exempt: 'exempt' },
    { id: 'F-3', src: 'M-2024-082 · 0:38 → 0:39',   kind: 'Personnel',     text: 'Reference to a named employee in pending HR matter.', exempt: 'exempt' },
    { id: 'F-4', src: 'M-2024-076 · 2:01 → 2:04',   kind: 'PII',           text: 'Phone number read aloud during call-in comment.',  exempt: 'redact' },
    { id: 'F-5', src: 'M-2024-061 · 0:12 → 0:14',   kind: 'Other',         text: 'Audio cut-out — unrelated to exemption.',          exempt: 'release' },
  ];
  const [decisions, setDecisions] = useStateR(flags.reduce((a, f) => (a[f.id] = f.exempt, a), {}));

  return (
    <div className="body">
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="lbl">Source documents</div><div className="val">{r.collected.toLocaleString()}</div><div className="delta">4 sources</div></div>
        <div className="stat"><div className="lbl">Reviewed</div><div className="val">{r.reviewed.toLocaleString()}</div><div className="delta up">95% complete</div></div>
        <div className="stat"><div className="lbl">Flagged for review</div><div className="val">{r.flagged}</div><div className="delta">PII, closed-session</div></div>
        <div className="stat"><div className="lbl">Marked exempt</div><div className="val">{r.exempt}</div><div className="delta">§6254(c), §6254(k)</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div className="card">
          <div className="card-h">
            <div className="ttl">Flagged segments <small>{flags.length} of {r.flagged} shown · suggested by review service</small></div>
            <div className="right">
              <button className="btn sm ghost"><Icon name="filter" size={12} /></button>
              <button className="btn sm primary"><Icon name="check" size={12} /> Approve all decisions</button>
            </div>
          </div>
          <div className="card-b flush">
            {flags.map(f => (
              <div key={f.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className="badge gold dot">{f.kind}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{f.src}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}>{f.id}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{f.text}</div>
                    <div className="evidence" style={{ marginTop: 8, fontSize: 11.5 }}>
                      <Icon name="pin" size={12} className="pin" />
                      <div>
                        <b>Suggested by review service</b>
                        <div className="src" style={{ marginTop: 2 }}>Auto-flagged · clerk decides · all decisions are auditable</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {[
                    { id: 'release', lbl: 'Release as-is', cls: 'ok' },
                    { id: 'redact',  lbl: 'Redact',        cls: 'gold' },
                    { id: 'exempt',  lbl: 'Exempt entirely',cls: 'err' },
                  ].map(opt => (
                    <button key={opt.id}
                            className={'btn sm' + (decisions[f.id] === opt.id ? ' primary' : '')}
                            style={decisions[f.id] === opt.id ? null : { fontSize: 11.5 }}
                            onClick={() => setDecisions(prev => ({ ...prev, [f.id]: opt.id }))}>
                      {decisions[f.id] === opt.id && <Icon name="check" size={11} />} {opt.lbl}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <button className="btn ghost sm"><Icon name="play" size={11} /> Listen</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-h"><div className="ttl">What gets released</div></div>
            <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { lbl: 'Released as-is',  n: Object.values(decisions).filter(d => d === 'release').length, cls: 'ok' },
                { lbl: 'Redacted',        n: Object.values(decisions).filter(d => d === 'redact').length,  cls: 'gold' },
                { lbl: 'Exempt entirely', n: Object.values(decisions).filter(d => d === 'exempt').length,  cls: 'err' },
              ].map(s => (
                <div key={s.lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--paper-2)', borderRadius: 7 }}>
                  <span className={'badge ' + s.cls + ' dot'} style={{ minWidth: 90 }}>{s.lbl}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.n}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>of {flags.length}</span>
                </div>
              ))}
              <div className="alert info">
                <Icon name="check" size={14} className="ic" />
                <div className="body">
                  <b>Public-safe to publish: 3 of 5 segments</b>
                  Redactions and exemptions will be applied to a release copy. Originals are preserved in evidence.
                </div>
              </div>
              <button className="btn primary"><Icon name="pkg" size={13} /> Build release package</button>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><div className="ttl">Statutory citations</div></div>
            <div className="card-b" style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}><b>§6254(c)</b> — personnel files, the disclosure of which would constitute an unwarranted invasion of personal privacy.</div>
              <div><b>§6254(k)</b> — records exempt or prohibited from disclosure pursuant to federal or state law.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesView() {
  const sources = [
    { nm: 'Meeting Recordings — Granicus archive', kind: 'Connector · read-only', docs: 3204, last: '2h ago', state: 'ok' },
    { nm: 'Clerk minutes (CivicClerk)',            kind: 'Internal',              docs: 612,  last: 'live',   state: 'ok' },
    { nm: 'Calendar exports (Outlook)',            kind: 'Connector',             docs: 124,  last: '15m ago',state: 'ok' },
    { nm: 'Closed-session transcripts',            kind: 'Restricted access',     docs: 187,  last: '1d ago', state: 'restricted' },
  ];
  return (
    <div className="body">
      <div className="card">
        <div className="card-h"><div className="ttl">Sources for this request <small>4 sources · 4,127 documents pulled</small></div></div>
        <div className="card-b flush">
          {sources.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px 120px', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{s.nm}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.kind}</div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.docs.toLocaleString()} docs</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.last}</div>
              <div>{s.state === 'restricted' ? <span className="vis restricted">Restricted</span> : <span className="vis public">OK</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CorrespondenceView() {
  const msgs = [
    { from: 'K. Whitford', dir: 'in',  ts: 'Apr 26, 1:30 PM', body: 'Acknowledging the $24 search-fee estimate. Please proceed.' },
    { from: 'D. Chen',     dir: 'out', ts: 'Apr 24, 9:00 AM', body: 'Estimated time-and-fees notice sent — 4-hour pull, $24 reproduction.' },
    { from: 'K. Whitford', dir: 'in',  ts: 'Apr 23, 11:00 AM',body: 'Initial request submitted via portal.' },
  ];
  return (
    <div className="body">
      <div className="card">
        <div className="card-h"><div className="ttl">Correspondence</div><div className="right"><button className="btn sm primary"><Icon name="send" size={12} /> Compose</button></div></div>
        <div className="card-b flush">
          {msgs.map((m, i) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>
                <b style={{ color: 'var(--ink-2)' }}>{m.from}</b> · {m.dir === 'in' ? 'received' : 'sent'} · {m.ts}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReleasePackageView() {
  return (
    <div className="body">
      <div className="card">
        <div className="card-h"><div className="ttl">Release package — preview</div></div>
        <div className="card-b">
          <div className="empty">
            <div className="ic"><Icon name="pkg" size={28} /></div>
            <div className="ttl">Package not built yet</div>
            <div className="body">Approve all exemption decisions, then build the release package. The package is checksummed and posts to the requestor's portal page.</div>
            <button className="btn primary"><Icon name="pkg" size={13} /> Build release package</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RecordsList = RecordsList;
window.RecordsDetail = RecordsDetail;
