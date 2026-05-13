// app.jsx — Top-level router. Hosts staff workspace, resident portal, admin console.

const { useState, useEffect } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "surface": "staff",
  "install": "full",
  "role": "clerk",
  "density": "comfortable",
  "page": "dashboard",
  "showAudit": false,
  "lifecycleStage": 3
}/*EDITMODE-END*/;

function App() {
  const [tw, setTweak] = useTweaks(DEFAULTS);
  const { surface, install, role, density, page, showAudit, lifecycleStage = 3 } = tw;

  const [searchOpen, setSearchOpen] = useState(false);
  const [auditObject, setAuditObject] = useState(null);

  const setSurface = v => setTweak('surface', v);
  const setInstall = v => setTweak('install', v);
  const setRole = v => setTweak('role', v);
  const setPage = v => setTweak('page', v);
  const setLifecycleStage = v => setTweak('lifecycleStage', v);

  const openAudit = obj => { setAuditObject(obj); setTweak('showAudit', true); };
  const closeAudit = () => setTweak('showAudit', false);

  // Keyboard: ⌘K opens search
  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const installedModules = window.CIVIC.ALL_MODULES.filter(m => install === 'full' || window.CIVIC.PARTIAL_MODULES.includes(m.id));
  const isInstalled = pageId => installedModules.find(m => m.id === pageId);

  // Resident portal — completely different shell
  if (surface === 'resident') {
    return <>
      <div data-surface="resident" data-density={density}>
        <window.ResidentPortal install={install} setPage={setPage} />
      </div>
      <TweaksUI tw={tw} setTweak={setTweak} />
    </>;
  }

  // Admin console — staff shell with admin content (still uses left nav for context)
  if (surface === 'admin') {
    return <>
      <div className="app" data-surface="admin" data-density={density}>
        <window.ShellBrand />
        <window.ShellTopbar surface={surface} setSurface={setSurface} role={role} setRole={setRole}
          onSearchOpen={() => setSearchOpen(true)} onAuditToggle={null} auditOn={false}
          density={density} page="admin" install={install} setInstall={setInstall} />
        <window.ShellNav install={install} page="admin" setPage={p => { setSurface('staff'); setPage(p); }} role={role} />
        <main className="main">
          <window.AdminConsole install={install} setInstall={setInstall} setPage={setPage} />
        </main>
      </div>
      <window.SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} install={install} setPage={p => { setSearchOpen(false); setSurface('staff'); setPage(p); }} />
      <TweaksUI tw={tw} setTweak={setTweak} />
    </>;
  }

  // Staff workspace
  let content;
  if (page === 'dashboard') {
    content = <window.StaffDashboard role={role} install={install} setPage={setPage} openAudit={openAudit} />;
  } else if (page === 'design-system') {
    content = <window.DesignSystemPage />;
  } else if (page === 'ia') {
    content = <window.IAPage install={install} />;
  } else if (page === 'admin') {
    content = <window.AdminConsole install={install} setInstall={setInstall} setPage={setPage} />;
  } else if (page === 'meetings' && isInstalled('meetings')) {
    content = <window.ClerkCalendar setPage={setPage} openAudit={openAudit} />;
  } else if (page === 'meeting-detail') {
    content = <window.MeetingDetail openAudit={openAudit} setPage={setPage} lifecycleStage={lifecycleStage} setLifecycleStage={setLifecycleStage} />;
  } else if (page === 'records' && isInstalled('records')) {
    content = <window.RecordsList setPage={setPage} openAudit={openAudit} />;
  } else if (page === 'record-detail') {
    content = <window.RecordsDetail openAudit={openAudit} setPage={setPage} />;
  } else if (page === 'code' && isInstalled('code')) {
    content = <window.CodeModule setPage={setPage} />;
  } else if (!isInstalled(page)) {
    content = <window.ModuleNotInstalled moduleId={page} setInstall={setInstall} />;
  } else {
    content = <window.ModulePlaceholder moduleId={page} />;
  }

  return (
    <>
      <div className="app" data-surface={surface} data-density={density}>
        <window.ShellBrand />
        <window.ShellTopbar
          surface={surface} setSurface={setSurface}
          role={role} setRole={setRole}
          onSearchOpen={() => setSearchOpen(true)}
          onAuditToggle={() => { if (showAudit) closeAudit(); else openAudit({ kind: 'Meeting', id: 'M-2026-04-21', ttl: 'City Council · Regular Meeting · Apr 21 2026' }); }}
          auditOn={showAudit}
          density={density}
          page={page}
          install={install}
          setInstall={setInstall}
        />
        <window.ShellNav install={install} page={page} setPage={setPage} role={role} />
        <main className="main">{content}</main>
        {showAudit && <window.AuditDrawer open={showAudit} onClose={closeAudit} object={auditObject || { kind: 'Meeting', id: 'M-2026-04-21', ttl: 'City Council · Regular Meeting · Apr 21 2026' }} />}
      </div>
      <window.SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} install={install} setPage={p => { setSearchOpen(false); setPage(p); }} />
      <TweaksUI tw={tw} setTweak={setTweak} />
    </>
  );
}

function TweaksUI({ tw, setTweak }) {
  const { TweaksPanel, TweakSection, TweakRadio, TweakSelect } = window;
  if (!TweaksPanel) return null;
  return (
    <TweaksPanel title="CivicSuite tweaks" subtitle="Surface · install · role · density">
      <TweakSection title="Surface">
        <TweakRadio label="Surface" value={tw.surface} onChange={v => setTweak('surface', v)}
          options={[{ value: 'staff', label: 'Staff' }, { value: 'resident', label: 'Resident' }, { value: 'admin', label: 'Admin' }]} />
      </TweakSection>
      <TweakSection title="Install state">
        <TweakRadio label="Modules" value={tw.install} onChange={v => setTweak('install', v)}
          options={[{ value: 'partial', label: 'Partial (4)' }, { value: 'full', label: 'Full (14)' }]} />
      </TweakSection>
      <TweakSection title="Role">
        <TweakSelect label="Active role" value={tw.role} onChange={v => setTweak('role', v)}
          options={Object.entries(window.CIVIC.ROLES).map(([k,v]) => ({ value: k, label: v.lbl }))} />
      </TweakSection>
      <TweakSection title="Density">
        <TweakRadio label="UI density" value={tw.density} onChange={v => setTweak('density', v)}
          options={[{ value: 'comfortable', label: 'Comfort' }, { value: 'compact', label: 'Compact' }]} />
      </TweakSection>
      <TweakSection title="Quick jump">
        <TweakSelect label="Page" value={tw.page} onChange={v => setTweak({ surface: 'staff', page: v })}
          options={[
            { value: 'dashboard', label: 'Staff dashboard' },
            { value: 'meetings', label: 'CivicClerk · meetings' },
            { value: 'meeting-detail', label: 'CivicClerk · meeting detail' },
            { value: 'records', label: 'CivicRecords · queue' },
            { value: 'record-detail', label: 'CivicRecords · detail' },
            { value: 'code', label: 'CivicCode · Title 17' },
            { value: 'admin', label: 'IT/Admin · health' },
            { value: 'design-system', label: 'Design system' },
            { value: 'ia', label: 'Information architecture' },
          ]} />
      </TweakSection>
      {tw.page === 'meeting-detail' && tw.surface === 'staff' && (
        <TweakSection title="Meeting lifecycle">
          <TweakSelect label="Stage" value={String(tw.lifecycleStage)} onChange={v => setTweak('lifecycleStage', parseInt(v,10))}
            options={[
              { value: '0', label: '0 · Scheduled' },
              { value: '1', label: '1 · Notice posted' },
              { value: '2', label: '2 · Agenda published' },
              { value: '3', label: '3 · In session' },
              { value: '4', label: '4 · Adjourned' },
              { value: '5', label: '5 · Minutes drafted' },
              { value: '6', label: '6 · Minutes approved' },
              { value: '7', label: '7 · Closed & archived' },
            ]} />
        </TweakSection>
      )}
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
