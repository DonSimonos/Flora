import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './style.css';
import { App } from './ui/App';
import { requestPersistence } from './services/persist';

// The installed app keeps running in the background on phones and would never notice a new version.
// So look for one whenever the app comes back to the front, and every 30 minutes.
// A found update is installed and the app reloads itself (registerType: 'autoUpdate').
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    const check = () => {
      if (navigator.onLine) reg.update().catch(() => {});
    };
    window.setInterval(check, 30 * 60_000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },
});
void requestPersistence();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
