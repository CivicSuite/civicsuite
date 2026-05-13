// icons.jsx — minimal stroke icon set for CivicSuite

const Icon = ({ name, size = 16, stroke = 1.5, style }) => {
  const s = { width: size, height: size, ...style };
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'archive':   return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="4" width="18" height="4" rx="1" {...p} /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" {...p} /><path d="M10 13h4" {...p} /></svg>;
    case 'calendar':  return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="5" width="18" height="16" rx="2" {...p} /><path d="M3 10h18M8 3v4M16 3v4" {...p} /></svg>;
    case 'book':      return <svg viewBox="0 0 24 24" style={s}><path d="M4 4v16M20 4v16M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z" {...p} /></svg>;
    case 'megaphone': return <svg viewBox="0 0 24 24" style={s}><path d="M3 11v2a2 2 0 0 0 2 2h2l8 5V4L7 9H5a2 2 0 0 0-2 2zM18 8a4 4 0 0 1 0 8" {...p} /></svg>;
    case 'badge':     return <svg viewBox="0 0 24 24" style={s}><path d="M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7l8-4z" {...p} /><path d="M9 12l2 2 4-4" {...p} /></svg>;
    case 'users':     return <svg viewBox="0 0 24 24" style={s}><circle cx="9" cy="8" r="3" {...p} /><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 11a3 3 0 1 0 0-6M21 20c0-2.5-2-4-4.5-4.5" {...p} /></svg>;
    case 'cart':      return <svg viewBox="0 0 24 24" style={s}><path d="M3 4h2l2 12h12l2-8H7" {...p} /><circle cx="9" cy="20" r="1.5" {...p} /><circle cx="17" cy="20" r="1.5" {...p} /></svg>;
    case 'pen':       return <svg viewBox="0 0 24 24" style={s}><path d="M3 21l3-1 11-11-2-2L4 18l-1 3z M14 7l3 3" {...p} /></svg>;
    case 'chart':     return <svg viewBox="0 0 24 24" style={s}><path d="M4 20V4M4 20h16M8 16V11M12 16V8M16 16v-3" {...p} /></svg>;
    case 'map':       return <svg viewBox="0 0 24 24" style={s}><path d="M9 5l-6 2v13l6-2 6 2 6-2V5l-6 2-6-2zM9 5v13M15 7v13" {...p} /></svg>;
    case 'people':    return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="3.5" {...p} /><path d="M5 21c0-4 3-6 7-6s7 2 7 6" {...p} /></svg>;
    case 'drop':      return <svg viewBox="0 0 24 24" style={s}><path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" {...p} /></svg>;
    case 'globe':     return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...p} /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" {...p} /></svg>;
    case 'shield':    return <svg viewBox="0 0 24 24" style={s}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" {...p} /></svg>;
    case 'home':      return <svg viewBox="0 0 24 24" style={s}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-9z" {...p} /></svg>;
    case 'inbox':     return <svg viewBox="0 0 24 24" style={s}><path d="M3 13l3-7h12l3 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zM3 13h5l1 2h6l1-2h5" {...p} /></svg>;
    case 'search':    return <svg viewBox="0 0 24 24" style={s}><circle cx="11" cy="11" r="6" {...p} /><path d="M20 20l-4-4" {...p} /></svg>;
    case 'bell':      return <svg viewBox="0 0 24 24" style={s}><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0" {...p} /></svg>;
    case 'help':      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...p} /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 1.7M12 17v.01" {...p} /></svg>;
    case 'check':     return <svg viewBox="0 0 24 24" style={s}><path d="M5 13l4 4L19 7" {...p} /></svg>;
    case 'x':         return <svg viewBox="0 0 24 24" style={s}><path d="M6 6l12 12M18 6L6 18" {...p} /></svg>;
    case 'chev-r':    return <svg viewBox="0 0 24 24" style={s}><path d="M9 6l6 6-6 6" {...p} /></svg>;
    case 'chev-d':    return <svg viewBox="0 0 24 24" style={s}><path d="M6 9l6 6 6-6" {...p} /></svg>;
    case 'chev-l':    return <svg viewBox="0 0 24 24" style={s}><path d="M15 6l-6 6 6 6" {...p} /></svg>;
    case 'chev-u':    return <svg viewBox="0 0 24 24" style={s}><path d="M6 15l6-6 6 6" {...p} /></svg>;
    case 'plus':      return <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12h14" {...p} /></svg>;
    case 'doc':       return <svg viewBox="0 0 24 24" style={s}><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v6h6" {...p} /></svg>;
    case 'paper':     return <svg viewBox="0 0 24 24" style={s}><path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" {...p} /></svg>;
    case 'gavel':     return <svg viewBox="0 0 24 24" style={s}><path d="M14 4l6 6-3 3-6-6 3-3zM10 8l-7 7 3 3 7-7M3 21h10" {...p} /></svg>;
    case 'flag':      return <svg viewBox="0 0 24 24" style={s}><path d="M5 21V4M5 4h12l-2 4 2 4H5" {...p} /></svg>;
    case 'shield-c':  return <svg viewBox="0 0 24 24" style={s}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3zM9 12l2 2 4-4" {...p} /></svg>;
    case 'lock':      return <svg viewBox="0 0 24 24" style={s}><rect x="5" y="11" width="14" height="9" rx="1" {...p} /><path d="M8 11V8a4 4 0 1 1 8 0v3" {...p} /></svg>;
    case 'eye':       return <svg viewBox="0 0 24 24" style={s}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></svg>;
    case 'history':   return <svg viewBox="0 0 24 24" style={s}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4M12 7v5l3 2" {...p} /></svg>;
    case 'download':  return <svg viewBox="0 0 24 24" style={s}><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" {...p} /></svg>;
    case 'upload':    return <svg viewBox="0 0 24 24" style={s}><path d="M12 20V8m0 0l-4 4m4-4l4 4M4 4h16" {...p} /></svg>;
    case 'send':      return <svg viewBox="0 0 24 24" style={s}><path d="M4 12l16-8-6 18-3-7-7-3z" {...p} /></svg>;
    case 'filter':    return <svg viewBox="0 0 24 24" style={s}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" {...p} /></svg>;
    case 'sort':      return <svg viewBox="0 0 24 24" style={s}><path d="M7 4v16m0-16l-3 3m3-3l3 3M17 20V4m0 16l-3-3m3 3l3-3" {...p} /></svg>;
    case 'dots':      return <svg viewBox="0 0 24 24" style={s}><circle cx="6" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="18" cy="12" r="1.2" fill="currentColor" /></svg>;
    case 'edit':      return <svg viewBox="0 0 24 24" style={s}><path d="M5 19h4l10-10-4-4L5 15v4z M14 6l4 4" {...p} /></svg>;
    case 'gear':      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" {...p} /></svg>;
    case 'pin':       return <svg viewBox="0 0 24 24" style={s}><path d="M12 2l4 4-2 2 3 5h-5v6l-2 2-1-2v-6H4l3-5-2-2 4-4h3z" {...p} /></svg>;
    case 'star':      return <svg viewBox="0 0 24 24" style={s}><path d="M12 3l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" {...p} /></svg>;
    case 'play':      return <svg viewBox="0 0 24 24" style={s}><path d="M7 4l13 8-13 8V4z" {...p} /></svg>;
    case 'puzzle':    return <svg viewBox="0 0 24 24" style={s}><path d="M5 9h3a1 1 0 0 0 1-1V6a2 2 0 1 1 4 0v2a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h.5a2 2 0 1 1 0 4H18a1 1 0 0 0-1 1v3H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h.5a2 2 0 1 0 0-4H6a1 1 0 0 1-1-1v-3z" {...p} /></svg>;
    case 'tag':       return <svg viewBox="0 0 24 24" style={s}><path d="M3 13V4h9l9 9-9 9-9-9z" {...p} /><circle cx="8" cy="8" r="1" fill="currentColor" /></svg>;
    case 'attach':    return <svg viewBox="0 0 24 24" style={s}><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" {...p} /></svg>;
    case 'spark':     return <svg viewBox="0 0 24 24" style={s}><path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" {...p} /></svg>;
    case 'pkg':       return <svg viewBox="0 0 24 24" style={s}><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" {...p} /></svg>;
    default: return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" {...p} /></svg>;
  }
};

window.Icon = Icon;
