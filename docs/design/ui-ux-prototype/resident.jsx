// resident.jsx — Resident-facing public portal

const { useState: useStateRP } = React;

function ResidentPortal({ install, setPage }) {
  const [tab, setTab] = useStateRP('home');
  const [q, setQ] = useStateRP('');
  const partial = install === 'partial';
  const showCode = !partial || window.CIVIC.PARTIAL_MODULES.includes('code');

  return (
    <div className="resident-shell">
      <div className="resident-topbar">
        <div className="seal">B</div>
        <div>
          <div className="ttl">City of Brookfield</div>
          <div className="sub">Official government website</div>
        </div>
        <div className="nav-links">
          {[
            { id: 'home', lbl: 'Home' },
            { id: 'meetings', lbl: 'Meetings' },
            { id: 'records', lbl: 'Records' },
            ...(showCode ? [{ id: 'code', lbl: 'Municipal code' }] : []),
            { id: 'notices', lbl: 'Notices' },
          ].map(l => <a key={l.id} href="#" onClick={e => { e.preventDefault(); setTab(l.id); }} className={tab === l.id ? 'on' : ''}>{l.lbl}</a>)}
        </div>
      </div>

      {tab === 'home' && (
        <>
          <div className="resident-hero">
            <div className="crumb">City of Brookfield</div>
            <h1>City records, meetings, and notices — in one place.</h1>
            <p>Search published city information, follow upcoming meetings, and submit a public records request.</p>
            <div className="resident-search">
              <input placeholder="Search meetings, records, notices…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setTab('search'); }} />
              <button onClick={() => setTab('search')}>Search</button>
            </div>
          </div>

          <div className="resident-section">
            <h2 className="resident-h">Browse city information</h2>
            <p className="resident-sub">Everything published here is public-record information. Restricted material is never shown.</p>
            <div className="grid-3" style={{ gap: 12 }}>
              <a href="#" className="tile" onClick={e => { e.preventDefault(); setTab('meetings'); }}>
                <div className="ic"><Icon name="calendar" size={18} /></div>
                <div className="ttl">Meetings & agendas</div>
                <div className="body">Upcoming and past meetings of the City Council, Planning Commission, and other boards. Agendas, packets, and minutes.</div>
                <div className="upd">Last updated · today</div>
              </a>
              <a href="#" className="tile" onClick={e => { e.preventDefault(); setTab('records'); }}>
                <div className="ic"><Icon name="archive" size={18} /></div>
                <div className="ttl">Public records requests</div>
                <div className="body">Submit a new request, check the status of an existing one, or browse previously released records.</div>
                <div className="upd">Average response · 7 days</div>
              </a>
              {showCode && (
                <a href="#" className="tile" onClick={e => { e.preventDefault(); setTab('code'); }}>
                  <div className="ic"><Icon name="book" size={18} /></div>
                  <div className="ttl">Municipal code</div>
                  <div className="body">The full text of the Brookfield Municipal Code. Browse by title, search by keyword, view amendment history.</div>
                  <div className="upd">Adopted through · Apr 21, 2026</div>
                </a>
              )}
              <a href="#" className="tile" onClick={e => { e.preventDefault(); setTab('notices'); }}>
                <div className="ic"><Icon name="megaphone" size={18} /></div>
                <div className="ttl">Public notices</div>
                <div className="body">Required public notices including hearings, bid openings, and emergency notifications.</div>
                <div className="upd">3 active notices</div>
              </a>
            </div>
          </div>

          <div className="resident-section">
            <h2 className="resident-h">Upcoming meetings</h2>
            <p className="resident-sub">Click a meeting to view the agenda, packet, and watch information.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {window.CIVIC.RESIDENT_MEETINGS.filter(m => m.status.includes('Upcoming')).map(m => (
                <div key={m.id} style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, textAlign: 'center', borderRight: '1px solid var(--rule)', paddingRight: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{m.date.split(' ')[0]}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>{m.date.split(' ')[1].replace(',','')}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{m.body}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.ttl} · {m.status}</div>
                  </div>
                  <button className="btn">View agenda</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'search' && <ResidentSearch q={q} install={install} />}
      {tab === 'meetings' && <ResidentMeetings />}
      {tab === 'records' && <ResidentRecords />}
      {tab === 'notices' && <ResidentNotices />}
      {tab === 'code' && showCode && <ResidentCode />}

      <div style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--rule)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 32 }}>
        City of Brookfield · 100 Civic Center Plaza · brookfield.gov · This is the official website of the City of Brookfield.
      </div>
    </div>
  );
}

function ResidentSearch({ q, install }) {
  const corpus = window.CIVIC.SEARCH_CORPUS.filter(c => (install === 'full' || window.CIVIC.PARTIAL_MODULES.includes(c.mod)) && c.mod !== 'admin');
  const hits = q ? corpus.filter(c => (c.ttl + ' ' + c.q).toLowerCase().includes(q.toLowerCase())) : corpus;
  return (
    <div className="resident-section">
      <h2 className="resident-h">Search results {q && <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 14 }}>for "{q}"</span>}</h2>
      <p className="resident-sub">{hits.length} public results across published city information.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hits.map(h => (
          <a key={h.id} href="#" style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 8, padding: '14px 16px', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{h.kind}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>{h.ttl}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{h.meta}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ResidentMeetings() {
  return (
    <div className="resident-section">
      <h2 className="resident-h">Public meetings</h2>
      <p className="resident-sub">Meetings of the City Council, Planning Commission, and other public bodies.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {window.CIVIC.RESIDENT_MEETINGS.map(m => (
            <div key={m.id} style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{m.date}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, marginTop: 2 }}>{m.body} · {m.ttl}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{m.status}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <button className="btn sm">Agenda (PDF)</button>
                {m.status.includes('Minutes') && <button className="btn sm">Minutes (PDF)</button>}
                {m.status.includes('Upcoming') && <button className="btn sm">Watch live</button>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, marginBottom: 6 }}>About these meetings</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            All meetings comply with the state Open Meetings Act. Notices post at least 72 hours in advance.
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentRecords() {
  return (
    <div className="resident-section">
      <h2 className="resident-h">Public records requests</h2>
      <p className="resident-sub">Submit a new request or check the status of an existing one.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 8, padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 8px' }}>Submit a request</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 16px' }}>Most requests are answered within 10 business days.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field"><label>What records are you requesting? <span className="req">*</span></label><textarea className="textarea" placeholder="Describe the records, including dates and topics, as specifically as you can."></textarea></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Your name <span className="req">*</span></label><input className="input" /></div>
              <div className="field"><label>Email <span className="req">*</span></label><input className="input" type="email" /></div>
            </div>
            <div className="alert info" style={{ fontSize: 12 }}>
              <Icon name="check" size={14} className="ic" />
              <div className="body">You'll receive a confirmation email and a request number you can use to track status.</div>
            </div>
            <button className="btn primary lg"><Icon name="send" size={14} /> Submit request</button>
          </div>
        </div>
        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 8px' }}>Check status</h3>
          <input className="input" placeholder="Request number (e.g. REQ-1184)" style={{ marginBottom: 8 }} />
          <button className="btn">Look up status</button>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)' }}>
            Recently released:
            <ul style={{ paddingLeft: 18, marginTop: 6 }}>
              <li>FY24 budget worksheets <span className="muted">· Apr 28</span></li>
              <li>Personnel records — city manager <span className="muted">· Apr 26</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentNotices() {
  return (
    <div className="resident-section">
      <h2 className="resident-h">Public notices</h2>
      <p className="resident-sub">Required public notices, including hearings and bid openings.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {window.CIVIC.RESIDENT_NOTICES.map(n => (
          <div key={n.id} style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderLeft: '3px solid var(--gold)', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{n.ttl}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Posted {n.posted} · <span className="mono">{n.id}</span></div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResidentCode() {
  return (
    <div className="resident-section">
      <h2 className="resident-h">Brookfield Municipal Code</h2>
      <p className="resident-sub">Adopted through April 21, 2026.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
        {[
          { num: 'Title 1',  ttl: 'General provisions' },
          { num: 'Title 2',  ttl: 'Administration & personnel' },
          { num: 'Title 5',  ttl: 'Business taxes, licenses, regulations' },
          { num: 'Title 8',  ttl: 'Health & safety' },
          { num: 'Title 12', ttl: 'Streets, sidewalks, public places' },
          { num: 'Title 17', ttl: 'Land use & zoning' },
        ].map((t, i) => (
          <a key={i} href="#" style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 8, padding: '12px 16px', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold-2)', minWidth: 60 }}>{t.num}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>{t.ttl}</span>
            <Icon name="chev-r" size={14} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
          </a>
        ))}
      </div>
    </div>
  );
}

window.ResidentPortal = ResidentPortal;
