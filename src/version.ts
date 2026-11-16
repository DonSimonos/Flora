declare const __BUILD_TIME__: string;

/** When this version was built, e.g. "16.11.2026, 20:15". */
export const BUILD_TEXT = new Date(__BUILD_TIME__).toLocaleString('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
