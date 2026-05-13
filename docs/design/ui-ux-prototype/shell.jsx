// shell.jsx — App shell, nav, search, audit drawer

const { useState, useEffect, useRef, useMemo } = React;

const MODULE_ICON = {
  records:'archive', clerk:'calendar', code:'book', notices:'megaphone', permits:'badge',
  boards:'users', procurement:'cart', contracts:'pen', budget:'chart', planning:'map',
  hr:'people', utilities:'drop', portal:'globe', admin:'shield',
};

function ShellTopbar({ surface, setSurface, role, setRole, onSearchOpen, onAuditToggle, auditOn, density, page, install, setInstall }) {
  const r = window.CIVIC.ROLES[role];
  return (
    <div className="topbar">
      <div className="search" onClick={onSearchOpen}>
        <Icon name="search" size={14} />
        <span>Search city work…</span>
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar-spacer" />
      <div className="surface-switch" title="Switch surface">
        {['staff','resident','admin'].map(k => (
          <button key={k} className={surface===k?'on':''} onClick={() => setSurface(k)}>
            {k === 'staff' ? 'Staff' : k === 'resident' ? 'Resident' : 'IT/Admin'}
          </button>
        ))}
      </div>
      <button className="iconbtn" title="Audit drawer" onClick={onAuditToggle} style={auditOn ? { background: 'var(--paper-2)', borderColor: 'var(--rule)' } : null}>
        <Icon name="history" size={16} />
      </button>
      <button className="iconbtn" title="Notifications">
        <Icon name="bell" size={16} />
        <span className="dot" />
      </button>
      <button className="iconbtn" title="Help">
        <Icon name="help" size={16} />
      </button>
      <div style={{ width: 1, height: 24, background: 'var(--rule)', margin: '0 4px' }} />
      <div className="user-chip" title={`${r.name} · ${r.role}`}>
        <div className="avatar">{r.initials}</div>
        <div>
          <div className="nm">{r.name.split(' ')[0]} {r.name.split(' ')[1]?.[0]}.</div>
          <div className="role">{r.role}</div>
        </div>
      </div>
    </div>
  );
}

function ShellBrand() {
  return (
    <div className="brand">
      <div className="seal">B</div>
      <div>
        <div className="brand-name">CivicSuite</div>
        <div className="brand-sub">City of Brookfield</div>
      </div>
    </div>
  );
}

function ShellNav({ install, page, setPage, role }) {
  const tasksByModule = window.CIVIC.TASKS_BY_ROLE[role].reduce((a,t) => { a[t.module] = (a[t.module]||0)+1; return a; }, {});
  const installedModules = window.CIVIC.ALL_MODULES.filter(m => install === 'full' || window.CIVIC.PARTIAL_MODULES.includes(m.id));
  const work = installedModules.filter(m => m.id !== 'admin' && m.id !== 'portal');
  const sys = installedModules.filter(m => m.id === 'admin' || m.id === 'portal');

  return (
    <div className="nav">
      <div className="nav-section">Workspace</div>
      <div className={'nav-item' + (page==='dashboard'?' active':'')} onClick={() => setPage('dashboard')}>
        <span className="ic"><Icon name="home" size={15} /></span> Dashboard
      </div>
      <div className={'nav-item' + (page==='tasks'?' active':'')} onClick={() => setPage('tasks')}>
        <span className="ic"><Icon name="inbox" size={15} /></span> My tasks
        <span className="count">{window.CIVIC.TASKS_BY_ROLE[role].length}</span>
      </div>

      <div className="nav-section">Modules</div>
      {work.map(m => (
        <div key={m.id}
             className={'nav-item' + (page===m.id || page===m.id+'-detail' ? ' active':'')}
             onClick={() => setPage(m.id)}>
          <span className="ic"><Icon name={MODULE_ICON[m.id]||'doc'} size={15} /></span>
          {m.name}
          {tasksByModule[m.id] ? <span className="count">{tasksByModule[m.id]}</span> : null}
        </div>
      ))}

      <div className="nav-section">System</div>
      {sys.map(m => (
        <div key={m.id}
             className={'nav-item' + (page===m.id ? ' active':'')}
             onClick={() => setPage(m.id)}>
          <span className="ic"><Icon name={MODULE_ICON[m.id]||'gear'} size={15} /></span>
          {m.name}
          {tasksByModule[m.id] ? <span className="count">{tasksByModule[m.id]}</span> : null}
        </div>
      ))}

      <div className="nav-recent">
        <div className="lbl">Recently viewed</div>
        <a href="#" onClick={e => { e.preventDefault(); setPage('clerk-detail'); }}>Council · May 5, 2026</a>
        <a href="#" onClick={e => { e.preventDefault(); setPage('records-detail'); }}>REQ-1184 · Recordings 2024</a>
        <a href="#" onClick={e => { e.preventDefault(); setPage('clerk'); }}>Council · Apr 21, 2026</a>
      </div>
    </div>
  );
}

// Search overlay
function SearchOverlay({ open, onClose, install, setPage }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQ('');
  }, [open]);

  if (!open) return null;
  const corpus = window.CIVIC.SEARCH_CORPUS.filter(c => install === 'full' || window.CIVIC.PARTIAL_MODULES.includes(c.mod));
  const hits = q.trim().length === 0 ? corpus.slice(0, 6) : corpus.filter(c => {
    const s = (c.ttl + ' ' + c.q + ' ' + c.kind + ' ' + c.meta).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(t => s.includes(t));
  });

  const grouped = hits.reduce((a, h) => { (a[h.kind] = a[h.kind] || []).push(h); return a; }, {});
  const onPick = (h) => {
    onClose();
    if (h.id === 'M-2026-053') setPage('clerk-detail');
    else if (h.id === 'REQ-1184') setPage('records-detail');
    else if (h.mod === 'clerk') setPage('clerk-detail');
    else if (h.mod === 'records') setPage('records-detail');
    else setPage(h.mod);
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="input-wrap">
          <Icon name="search" size={16} style={{ color: 'var(--ink-3)' }} />
          <input ref={inputRef} placeholder="Search meetings, records, code, agenda items…"
                 value={q} onChange={e => setQ(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && hits[0]) onPick(hits[0]); }} />
          <span className="scope">{install === 'partial' ? '3 modules' : 'all modules'}</span>
        </div>
        <div className="results">
          {Object.entries(grouped).length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No results — searching {install === 'partial' ? 'Records, Clerk, and Code' : 'all installed modules'}.
            </div>
          )}
          {Object.entries(grouped).map(([kind, items]) => (
            <div key={kind} className="search-group">
              <div className="lbl">{kind}{items.length > 1 ? 's' : ''}</div>
              {items.map((h, i) => (
                <div key={h.id} className={'search-result' + (i===0 && kind===Object.keys(grouped)[0] ? ' active' : '')} onClick={() => onPick(h)}>
                  <div className="ic"><Icon name={h.kind==='Meeting'?'calendar':h.kind==='Records Request'?'archive':h.kind==='Code Section'?'book':h.kind==='Notice'?'megaphone':h.kind==='Permit'?'badge':'doc'} size={13} /></div>
                  <div>
                    <div className="ttl">{h.ttl}</div>
                    <div className="meta">{h.meta}</div>
                  </div>
                  <div className="right">{h.id}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--rule)', padding: '10px 16px', display: 'flex', gap: 14, fontSize: 11, color: 'var(--ink-3)' }}>
          <span><span className="kbd">↵</span> Open</span>
          <span><span className="kbd">↑↓</span> Navigate</span>
          <span><span className="kbd">esc</span> Close</span>
          <span style={{ marginLeft: 'auto' }}>Searches only installed modules</span>
        </div>
      </div>
    </div>
  );
}

// Audit drawer (right side, per-object)
function AuditDrawer({ open, onClose, object }) {
  const [tab, setTab] = useState('history');
  if (!object) return null;
  return (
    <div className={'audit-drawer' + (open?' open':'')}>
      <div className="audit-h">
        <Icon name="history" size={18} style={{ color: 'var(--gold-2)' }} />
        <div style={{ flex: 1 }}>
          <div className="ttl">Audit & Evidence</div>
          <div className="sub">{object.kind || 'Object'} · <span className="mono">{object.id}</span></div>
        </div>
        <button className="iconbtn" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div className="audit-tabs">
        <button className={tab==='history'?'on':''} onClick={() => setTab('history')}>History</button>
        <button className={tab==='evidence'?'on':''} onClick={() => setTab('evidence')}>Evidence</button>
        <button className={tab==='exports'?'on':''} onClick={() => setTab('exports')}>Exports</button>
      </div>
      <div className="audit-b">
        {tab === 'history' && (object.events || []).map((e, i) => (
          <div key={i} className={'audit-event' + (e.kind === 'publish' ? ' publish' : e.kind === 'error' ? ' error' : '')}>
            <div className="marker" />
            <div>
              <div className="ev-h">{e.ev}</div>
              <div className="ev-meta">{e.ts} · {e.who} <span className="muted">({e.role})</span></div>
              <div className="ev-body">{e.detail}</div>
              {e.hash && <span className="ev-hash">{e.hash}</span>}
            </div>
          </div>
        ))}
        {tab === 'evidence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="evidence">
              <Icon name="pin" size={14} className="pin" />
              <div>
                <b>Source documents preserved</b>
                <div style={{ marginTop: 4, color: 'var(--ink-3)' }}>6 attachments at intake · all checksummed (SHA-256).</div>
                <div className="src" style={{ marginTop: 6 }}>sha256:af20…b934</div>
              </div>
            </div>
            <div className="evidence">
              <Icon name="lock" size={14} className="pin" />
              <div>
                <b>Access events</b>
                <div style={{ marginTop: 4, color: 'var(--ink-3)' }}>14 reads · 4 writes · 1 export, last 7 days.</div>
              </div>
            </div>
            <div className="evidence">
              <Icon name="check" size={14} className="pin" />
              <div>
                <b>Validation</b>
                <div style={{ marginTop: 4, color: 'var(--ink-3)' }}>Required fields complete · 1 warning on Item 6 attachment size.</div>
              </div>
            </div>
          </div>
        )}
        {tab === 'exports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Generate a release package or audit export. Each export is recorded in History.</div>
            <button className="btn"><Icon name="download" size={14} /> Audit log (CSV)</button>
            <button className="btn"><Icon name="download" size={14} /> Audit log + evidence (ZIP)</button>
            <button className="btn primary"><Icon name="pkg" size={14} /> Release package</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.MODULE_ICON = MODULE_ICON;
window.ShellTopbar = ShellTopbar;
window.ShellBrand = ShellBrand;
window.ShellNav = ShellNav;
window.SearchOverlay = SearchOverlay;
window.AuditDrawer = AuditDrawer;
