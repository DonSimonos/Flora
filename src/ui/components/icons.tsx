const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const IconHome = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></svg>
);
export const IconCamera = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="4" /></svg>
);
export const IconBook = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /><path d="M12 7c-2 1-2 4 0 6 2-2 2-5 0-6z" /></svg>
);
export const IconGreenhouse = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M3 20V10l9-6 9 6v10z" /><path d="M12 4v16M3 14h18" /><path d="M8 20v-3M16 20v-3" /></svg>
);
export const IconMap = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>
);
export const IconShutter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="4" /><path d="M12 11c-1 .5-1 2 0 3 1-1 1-2.5 0-3z" fill="currentColor" />
  </svg>
);
