export const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Text with lowercase/uppercase/punctuation symbols
    const txt = 'vehicle_repair_fingerprint_2026';
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);
    
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
};

export const generateFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    !!window.indexedDB,
    typeof (window as any).openDatabase,
    navigator.platform,
    navigator.doNotTrack,
    getCanvasFingerprint()
  ];
  
  const str = components.join('||');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

export const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('vr_visitor_id');
  if (!visitorId) {
    visitorId = 'vid_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('vr_visitor_id', visitorId);
  }
  return visitorId;
};
