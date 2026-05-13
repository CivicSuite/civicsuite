// data.jsx — CivicSuite mock data
// City of Brookfield demo dataset

const ALL_MODULES = [
  { id: 'records',    name: 'Records',         shortName: 'Records',     icon: 'archive',     color: 'var(--navy)', desc: 'Public records requests' },
  { id: 'clerk',      name: 'Clerk / Meetings',shortName: 'Clerk',       icon: 'calendar',    color: 'var(--navy)', desc: 'Meetings, agendas, minutes' },
  { id: 'code',       name: 'Code',            shortName: 'Code',        icon: 'book',        color: 'var(--navy)', desc: 'Municipal code' },
  { id: 'notices',    name: 'Notices',         shortName: 'Notices',     icon: 'megaphone',   color: 'var(--navy)', desc: 'Public notices & postings' },
  { id: 'permits',    name: 'Permits',         shortName: 'Permits',     icon: 'badge',       color: 'var(--navy)', desc: 'Permit applications' },
  { id: 'boards',     name: 'Boards',          shortName: 'Boards',      icon: 'users',       color: 'var(--navy)', desc: 'Boards & commissions' },
  { id: 'procurement',name: 'Procurement',     shortName: 'Procure',     icon: 'cart',        color: 'var(--navy)', desc: 'RFPs, bids, vendors' },
  { id: 'contracts',  name: 'Contracts',       shortName: 'Contracts',   icon: 'pen',         color: 'var(--navy)', desc: 'Contract lifecycle' },
  { id: 'budget',     name: 'Budget',          shortName: 'Budget',      icon: 'chart',       color: 'var(--navy)', desc: 'Budget & finance' },
  { id: 'planning',   name: 'Planning',        shortName: 'Planning',    icon: 'map',         color: 'var(--navy)', desc: 'Planning & zoning' },
  { id: 'hr',         name: 'HR',              shortName: 'HR',          icon: 'people',      color: 'var(--navy)', desc: 'Human resources' },
  { id: 'utilities',  name: 'Utilities',       shortName: 'Utilities',   icon: 'drop',        color: 'var(--navy)', desc: 'Utility billing' },
  { id: 'portal',     name: 'Public Portal Admin', shortName: 'Portal',  icon: 'globe',       color: 'var(--navy)', desc: 'Resident portal' },
  { id: 'admin',      name: 'System Admin',    shortName: 'Admin',       icon: 'shield',      color: 'var(--gold)', desc: 'IT & system' },
];

const PARTIAL_MODULES = ['records', 'clerk', 'code', 'admin'];

const ROLES = {
  clerk:   { name: 'Margaret Vasquez',  role: 'City Clerk',          initials: 'MV' },
  records: { name: 'David Chen',        role: 'Records Officer',     initials: 'DC' },
  admin:   { name: 'Priya Iyer',        role: 'IT Administrator',    initials: 'PI' },
  manager: { name: 'Howard Bell',       role: 'Department Manager',  initials: 'HB' },
};

const TODAY = 'Apr 30, 2026';

// Tasks by role (start of day)
const TASKS_BY_ROLE = {
  clerk: [
    { id: 'CLK-241', module: 'clerk',  ttl: 'Review packet for City Council — May 5', meta: '4 agenda items pending review · due today 4:00 PM', urgency: 'today', kind: 'review' },
    { id: 'CLK-238', module: 'clerk',  ttl: 'Post 72-hour notice for Planning Commission', meta: 'Notice draft ready · posting window opens at 6:00 PM', urgency: 'today', kind: 'publish' },
    { id: 'REQ-1184',module: 'records',ttl: 'Public records request — meeting recordings 2024', meta: 'Requestor: K. Whitford · day 7 of 10', urgency: 'soon', kind: 'review' },
    { id: 'CLK-235', module: 'clerk',  ttl: 'Draft minutes — Council April 21 special session', meta: 'Recording transcribed · 14 motions', urgency: 'soon', kind: 'draft' },
    { id: 'CLK-232', module: 'clerk',  ttl: 'Adopt minutes — Council April 7 regular meeting', meta: 'On agenda for May 5', urgency: 'later', kind: 'approve' },
  ],
  records: [
    { id: 'REQ-1187',module: 'records',ttl: 'New request — police body-cam footage Mar 12', meta: 'Requestor: J. Allen · acknowledge by today', urgency: 'today', kind: 'intake' },
    { id: 'REQ-1184',module: 'records',ttl: 'Exemption review — meeting recordings 2024', meta: 'Suggested redactions: 12 · day 7 of 10', urgency: 'today', kind: 'review' },
    { id: 'REQ-1180',module: 'records',ttl: 'Release package — vendor contracts FY24', meta: 'Approved · ready to publish', urgency: 'soon', kind: 'publish' },
    { id: 'REQ-1175',module: 'records',ttl: 'Awaiting fee acknowledgment from requestor', meta: 'Requestor: M. Diaz · day 4', urgency: 'soon', kind: 'wait' },
    { id: 'REQ-1168',module: 'records',ttl: 'Records request — building permits Maple St', meta: 'Department response received from Permits', urgency: 'later', kind: 'review' },
  ],
  admin: [
    { id: 'SYS-014', module: 'admin', ttl: 'Update available — CivicClerk 4.2.1', meta: 'Security & minutes-export fixes · review release notes', urgency: 'today', kind: 'review' },
    { id: 'SYS-011', module: 'admin', ttl: 'Backup verification due', meta: 'Last successful: 14h ago · run scheduled verification', urgency: 'soon', kind: 'review' },
    { id: 'SYS-009', module: 'admin', ttl: 'Connector misconfigured — agenda livestream', meta: 'Vimeo API token rejected · re-enter credentials', urgency: 'today', kind: 'error' },
    { id: 'SYS-007', module: 'admin', ttl: 'New staff onboarding — 2 accounts pending', meta: 'Department: Planning · review role assignments', urgency: 'later', kind: 'review' },
  ],
  manager: [
    { id: 'CLK-240', module: 'clerk',  ttl: 'Approve agenda submission — Public Works update', meta: 'Submitted by D. Reyes · for May 5 council', urgency: 'today', kind: 'approve' },
    { id: 'REQ-1182',module: 'records',ttl: 'Department response requested — bid records', meta: 'Records officer needs documents from your dept', urgency: 'today', kind: 'review' },
    { id: 'CLK-237', module: 'clerk',  ttl: 'Vote outcomes recorded for April 21', meta: '3 action items assigned to Public Works', urgency: 'soon', kind: 'review' },
  ],
};

// Meeting bodies
const MEETING_BODIES = [
  { id: 'council',   name: 'City Council',           color: 'var(--navy)' },
  { id: 'planning',  name: 'Planning Commission',    color: 'var(--gold-2)' },
  { id: 'parks',     name: 'Parks & Recreation Bd.', color: 'var(--ok)' },
  { id: 'finance',   name: 'Finance Committee',      color: 'var(--info)' },
  { id: 'historic',  name: 'Historic Preservation',  color: 'var(--seal)' },
];

// Lifecycle stages
const LIFECYCLE = [
  { id: 'scheduled',  name: 'Scheduled' },
  { id: 'agenda',     name: 'Agenda Building' },
  { id: 'packet',     name: 'Packet Review' },
  { id: 'notice',     name: 'Notice Posted' },
  { id: 'held',       name: 'Meeting Held' },
  { id: 'drafted',    name: 'Minutes Drafted' },
  { id: 'adopted',    name: 'Minutes Adopted' },
  { id: 'archived',   name: 'Archived' },
];

// Calendar meetings (May 2026)
const MEETINGS = [
  { id: 'M-2026-053', day: 5,  body: 'council',  ttl: 'City Council · Regular Meeting',         time: '6:30 PM', stage: 'packet',    location: 'Council Chambers' },
  { id: 'M-2026-051', day: 7,  body: 'planning', ttl: 'Planning Commission',                    time: '5:00 PM', stage: 'agenda',    location: 'Council Chambers' },
  { id: 'M-2026-049', day: 11, body: 'parks',    ttl: 'Parks & Recreation Board',               time: '6:00 PM', stage: 'scheduled', location: 'Recreation Center' },
  { id: 'M-2026-054', day: 12, body: 'finance',  ttl: 'Finance Committee',                      time: '5:30 PM', stage: 'scheduled', location: 'Conference Rm B' },
  { id: 'M-2026-055', day: 19, body: 'council',  ttl: 'City Council · Work Session',            time: '6:30 PM', stage: 'scheduled', location: 'Council Chambers' },
  { id: 'M-2026-056', day: 21, body: 'planning', ttl: 'Planning Commission',                    time: '5:00 PM', stage: 'scheduled', location: 'Council Chambers' },
  { id: 'M-2026-057', day: 26, body: 'historic', ttl: 'Historic Preservation Cmsn.',            time: '6:00 PM', stage: 'scheduled', location: 'Conference Rm A' },
  { id: 'M-2026-058', day: 28, body: 'council',  ttl: 'City Council · Special Budget Session',  time: '6:00 PM', stage: 'scheduled', location: 'Council Chambers' },
  // Past
  { id: 'M-2026-048', day: 21, body: 'council',  ttl: 'City Council · Regular Meeting',         time: '6:30 PM', stage: 'drafted',   location: 'Council Chambers', past: true },
  { id: 'M-2026-046', day: 23, body: 'planning', ttl: 'Planning Commission',                    time: '5:00 PM', stage: 'adopted',   location: 'Council Chambers', past: true },
];

// The "open" meeting we'll show in detail
const FOCUSED_MEETING = {
  id: 'M-2026-053',
  body: 'City Council',
  ttl: 'Regular Meeting',
  date: 'Tuesday, May 5, 2026',
  time: '6:30 PM',
  location: 'Council Chambers · 100 Civic Center Plaza',
  stage: 'packet',
  stageIdx: 2,
  noticeDeadline: 'Sat May 2, 6:30 PM',
  noticeStatus: 'pending',
  agenda: [
    { num: '1.',   ttl: 'Call to Order',                                              type: 'procedural', dept: 'Clerk',         status: 'approved', vis: 'public' },
    { num: '2.',   ttl: 'Roll Call',                                                  type: 'procedural', dept: 'Clerk',         status: 'approved', vis: 'public' },
    { num: '3.',   ttl: 'Pledge of Allegiance',                                       type: 'procedural', dept: 'Clerk',         status: 'approved', vis: 'public' },
    { num: '4.',   ttl: 'Approval of Minutes — April 21, 2026',                      type: 'consent',    dept: 'Clerk',         status: 'approved', vis: 'public' },
    { num: '5.',   ttl: 'Public Comment',                                             type: 'procedural', dept: 'Clerk',         status: 'approved', vis: 'public' },
    { num: '6.',   ttl: 'Resolution 2026-14: Authorizing FY27 Bond Issuance',         type: 'resolution', dept: 'Finance',       status: 'review',   vis: 'public', warn: 'Attached fiscal note exceeds 50 pages — review for redactions' },
    { num: '7.',   ttl: 'Ordinance 2026-08: Amending Title 17 (Zoning)',              type: 'ordinance',  dept: 'Planning',      status: 'review',   vis: 'public' },
    { num: '8.',   ttl: 'Public Works contract — Maple Ave resurfacing',              type: 'contract',   dept: 'Public Works',  status: 'submitted',vis: 'public' },
    { num: '9.',   ttl: 'Personnel matter (Closed Session)',                          type: 'closed',     dept: 'HR',            status: 'review',   vis: 'restricted' },
    { num: '10.',  ttl: 'Reconvene to Open Session',                                  type: 'procedural', dept: 'Clerk',         status: 'approved', vis: 'public' },
    { num: '11.',  ttl: 'Adjourn',                                                    type: 'procedural', dept: 'Clerk',         status: 'approved', vis: 'public' },
  ],
  documents: [
    { kind: 'PDF', nm: 'Agenda — Council May 5, 2026.pdf',          meta: '11 items · 2 pages',      vis: 'draft' },
    { kind: 'PDF', nm: 'Packet — Council May 5, 2026.pdf',          meta: '142 pages · compiled',    vis: 'draft' },
    { kind: 'PDF', nm: 'Resolution 2026-14 (Bond Issuance).pdf',    meta: '4 pages',                 vis: 'public' },
    { kind: 'XLS', nm: 'Fiscal Note — Bond Issuance.xlsx',          meta: '52 pages · attachment',   vis: 'public', warn: true },
    { kind: 'PDF', nm: 'Ordinance 2026-08 (Zoning amendment).pdf',  meta: '18 pages',                vis: 'public' },
    { kind: 'PDF', nm: 'Maple Ave contract & exhibits.pdf',         meta: '34 pages',                vis: 'public' },
  ],
  audit: [
    { ts: 'Apr 30, 2026 · 9:42 AM',  who: 'Margaret Vasquez',  role: 'Clerk',     ev: 'Opened packet review',   detail: 'Items 6, 7, 8 marked for review.' },
    { ts: 'Apr 30, 2026 · 9:14 AM',  who: 'D. Reyes',          role: 'Public Works', ev: 'Submitted agenda item', detail: 'Item 8 — Maple Ave resurfacing contract.', hash: 'sha256:af20…b934' },
    { ts: 'Apr 29, 2026 · 4:51 PM',  who: 'L. Petrillo',       role: 'Planning',  ev: 'Submitted agenda item',   detail: 'Item 7 — Ordinance 2026-08.', hash: 'sha256:1f9c…7b21' },
    { ts: 'Apr 29, 2026 · 2:08 PM',  who: 'F. Atherton',       role: 'Finance',   ev: 'Submitted agenda item',   detail: 'Item 6 — Bond issuance with fiscal note.', hash: 'sha256:c7ab…2e90' },
    { ts: 'Apr 28, 2026 · 8:00 AM',  who: 'CivicSuite',        role: 'system',    ev: 'Meeting created from cycle template', detail: '8 default procedural items inserted.', kind: 'system' },
    { ts: 'Apr 28, 2026 · 8:00 AM',  who: 'M. Vasquez',        role: 'Clerk',     ev: 'Scheduled meeting',       detail: 'Council May 5, 6:30 PM.' },
  ],
};

// Records requests
const RECORDS_REQUESTS = [
  { id: 'REQ-1184', ttl: 'Council meeting recordings (Q1–Q4 2024)', requestor: 'K. Whitford', received: 'Apr 23', dueIn: 3,  status: 'review',   assignee: 'D. Chen', vis: 'restricted' },
  { id: 'REQ-1187', ttl: 'Police body-cam footage — incident Mar 12', requestor: 'J. Allen',     received: 'Apr 30', dueIn: 10, status: 'intake',   assignee: 'D. Chen', vis: 'restricted' },
  { id: 'REQ-1180', ttl: 'Vendor contracts FY2024',                  requestor: 'M. Patel',    received: 'Apr 18', dueIn: 1,  status: 'release',  assignee: 'D. Chen', vis: 'public' },
  { id: 'REQ-1175', ttl: 'Building permits — 1400 block of Maple St',requestor: 'M. Diaz',     received: 'Apr 14', dueIn: 4,  status: 'wait',     assignee: 'D. Chen', vis: 'public' },
  { id: 'REQ-1168', ttl: 'Email correspondence — re: zoning hearing',requestor: 'L. Brooks',   received: 'Apr 11', dueIn: 6,  status: 'review',   assignee: 'D. Chen', vis: 'restricted' },
  { id: 'REQ-1165', ttl: 'FY24 budget worksheets (departments)',     requestor: 'Brookfield Times', received: 'Apr 09', dueIn: -1, status: 'released', assignee: 'D. Chen', vis: 'public' },
  { id: 'REQ-1162', ttl: 'Personnel records — appointment of city manager', requestor: 'Anonymous', received: 'Apr 06', dueIn: -3, status: 'released', assignee: 'D. Chen', vis: 'restricted' },
];

const FOCUSED_REQUEST = {
  id: 'REQ-1184',
  ttl: 'Council meeting recordings (Q1–Q4 2024)',
  requestor: 'K. Whitford',
  email: 'kwhitford@example.com',
  received: 'April 23, 2026',
  due: 'May 3, 2026',
  dayOf: 7,
  dayTotal: 10,
  status: 'Exemption review',
  scope: 'All audio/video recordings of City Council meetings held between January 1, 2024 and December 31, 2024, including any closed sessions where they exist as published.',
  fee: '$24.00',
  feeStatus: 'Acknowledged',
  collected: 4127,
  reviewed: 3940,
  flagged: 187,
  released: 0,
  exempt: 12,
};

// IT/Admin services
const SERVICES = [
  { nm: 'Identity / SSO',          ver: '2.1.4', state: 'ready',         note: 'SAML · 4 IdPs · 142 active sessions' },
  { nm: 'Records Index',           ver: '4.0.7', state: 'ready',         note: 'Last rebuild 6h ago · 1.2M docs' },
  { nm: 'Meeting Recordings',      ver: '1.8.2', state: 'degraded',      note: '1 of 3 transcoders unavailable' },
  { nm: 'Public Portal',           ver: '2.0.1', state: 'ready',         note: 'CDN healthy · uptime 99.98% / 30d' },
  { nm: 'Notice Posting Service',  ver: '1.4.0', state: 'ready',         note: 'Last posting 2h ago' },
  { nm: 'Backups',                 ver: '1.2.0', state: 'warn',          note: 'Verification overdue — last 14h ago' },
  { nm: 'Suggestions Service',     ver: '0.6.3', state: 'ready',         note: 'Draft & redaction suggestions · cap 200/h' },
  { nm: 'Connector — Vimeo',       ver: '—',     state: 'misconfig',     note: 'API token rejected since 2:14 AM' },
  { nm: 'Connector — Granicus',    ver: 'n/a',   state: 'not-installed', note: 'Module not enabled' },
  { nm: 'Connector — Laserfiche',  ver: '3.1',   state: 'ready',         note: 'Sync every 15 min' },
];

// Search corpus
const SEARCH_CORPUS = [
  { id: 'M-2026-053', mod: 'clerk', kind: 'Meeting',  ttl: 'City Council · Regular Meeting — May 5, 2026', meta: 'Packet review · 11 items', q: 'maple bond zoning' },
  { id: 'M-2026-048', mod: 'clerk', kind: 'Meeting',  ttl: 'City Council · Regular Meeting — Apr 21, 2026',meta: 'Minutes drafted · 14 motions', q: 'minutes april' },
  { id: 'AGD-241',    mod: 'clerk', kind: 'Agenda Item', ttl: 'Resolution 2026-14: Authorizing FY27 Bond Issuance', meta: 'Council · May 5 · Finance', q: 'bond fy27 finance' },
  { id: 'AGD-242',    mod: 'clerk', kind: 'Agenda Item', ttl: 'Public Works contract — Maple Ave resurfacing', meta: 'Council · May 5 · Public Works', q: 'maple ave contract' },
  { id: 'REQ-1184',   mod: 'records', kind: 'Records Request', ttl: 'Council meeting recordings (Q1–Q4 2024)', meta: 'K. Whitford · day 7 of 10', q: 'recordings whitford 2024' },
  { id: 'REQ-1180',   mod: 'records', kind: 'Records Request', ttl: 'Vendor contracts FY2024', meta: 'M. Patel · ready to release', q: 'vendor contracts patel' },
  { id: 'CODE-17.20', mod: 'code',  kind: 'Code Section', ttl: '§17.20 — Zoning amendments and rezoning procedure', meta: 'Title 17 · Land Use', q: 'zoning rezoning amendment' },
  { id: 'CODE-17.04', mod: 'code',  kind: 'Code Section', ttl: '§17.04 — Definitions', meta: 'Title 17 · Land Use', q: 'definitions zoning' },
  { id: 'NOT-882',    mod: 'notices', kind: 'Notice', ttl: 'Notice of Public Hearing — Ord. 2026-08', meta: 'Posting window: Apr 28 – May 5', q: 'notice ordinance hearing' },
  { id: 'DOC-9912',   mod: 'records', kind: 'Document', ttl: 'Maple Ave contract & exhibits.pdf', meta: 'Attached to AGD-242 · 34 pages', q: 'maple ave contract pdf' },
  { id: 'PER-3340',   mod: 'permits', kind: 'Permit', ttl: 'Building permit — 1418 Maple St', meta: 'Issued · Apr 12, 2026', q: 'permit maple building' },
];

// Resident portal items
const RESIDENT_MEETINGS = [
  { id: 'M-2026-048', body: 'City Council', ttl: 'Regular Meeting', date: 'Apr 21, 2026', status: 'Minutes drafted' },
  { id: 'M-2026-046', body: 'Planning Commission', ttl: 'Regular Meeting', date: 'Apr 23, 2026', status: 'Minutes adopted' },
  { id: 'M-2026-053', body: 'City Council', ttl: 'Regular Meeting', date: 'May 5, 2026', status: 'Upcoming · agenda available' },
  { id: 'M-2026-051', body: 'Planning Commission', ttl: 'Regular Meeting', date: 'May 7, 2026', status: 'Upcoming · agenda pending' },
];

const RESIDENT_NOTICES = [
  { id: 'NOT-882', ttl: 'Notice of Public Hearing — Ordinance 2026-08 (Zoning Amendment)', posted: 'Apr 28, 2026', body: 'Public hearing on zoning amendment to Title 17, May 5 at 6:30 PM.' },
  { id: 'NOT-881', ttl: 'Notice of Bid Opening — Maple Ave Resurfacing', posted: 'Apr 24, 2026', body: 'Bids opened April 30, 2026.' },
  { id: 'NOT-879', ttl: 'Notice of Closure — Veterans Park (May 9–10)', posted: 'Apr 22, 2026', body: 'Park closed for resurfacing weekend of May 9.' },
];

window.CIVIC = {
  ALL_MODULES, PARTIAL_MODULES, ROLES, TODAY,
  TASKS_BY_ROLE, MEETING_BODIES, LIFECYCLE, MEETINGS, FOCUSED_MEETING,
  RECORDS_REQUESTS, FOCUSED_REQUEST, SERVICES, SEARCH_CORPUS,
  RESIDENT_MEETINGS, RESIDENT_NOTICES,
};
