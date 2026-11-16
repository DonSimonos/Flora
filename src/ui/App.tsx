import { useCallback, useEffect, useState } from 'react';
import { tickAll } from '../game/game';
import { processQueue } from '../services/queue';
import { getState, loadSource, update, useGame } from '../store/store';
import { toast } from '../store/toast';
import { Toasts } from './components/common';
import { IconBook, IconCamera, IconGreenhouse, IconHome, IconMap } from './components/icons';
import { Reveal } from './components/Reveal';
import { Discover } from './screens/Discover';
import { Greenhouse, reportEvents } from './screens/Greenhouse';
import { Herbarium } from './screens/Herbarium';
import { Home } from './screens/Home';
import { MapScreen } from './screens/MapScreen';

export type Tab = 'start' | 'entdecken' | 'herbarium' | 'gewaechshaus' | 'karte';
const TABS: { id: Tab; name: string; Icon: () => JSX.Element }[] = [
  { id: 'start', name: 'Start', Icon: IconHome },
  { id: 'entdecken', name: 'Entdecken', Icon: IconCamera },
  { id: 'herbarium', name: 'Herbarium', Icon: IconBook },
  { id: 'gewaechshaus', name: 'Gewächshaus', Icon: IconGreenhouse },
  { id: 'karte', name: 'Karte', Icon: IconMap },
];

function tabFromHash(): Tab {
  const h = location.hash.slice(1) as Tab;
  return TABS.some((t) => t.id === h) ? h : 'start';
}

/** Runs the greenhouse clock and reports level-ups that happened while away. */
function useGreenhouseClock() {
  useEffect(() => {
    const run = () => {
      const r = tickAll(getState(), Date.now());
      if (r.state !== getState()) update(() => r.state);
      const byPlant = new Map<string, typeof r.events>();
      r.events.forEach((e) => byPlant.set(e.plantId, [...(byPlant.get(e.plantId) ?? []), e]));
      byPlant.forEach((evs, id) => {
        const levelUps = evs.filter((e) => e.event.kind === 'levelUp');
        const rest = evs.filter((e) => e.event.kind !== 'levelUp').map((e) => e.event);
        reportEvents(r.state, id, [...(levelUps.length ? [levelUps[levelUps.length - 1].event] : []), ...rest]);
      });
    };
    run();
    const t = window.setInterval(run, 30_000);
    const onVis = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
}

function useIdentificationQueue() {
  useEffect(() => {
    void processQueue();
    const onOnline = () => void processQueue();
    window.addEventListener('online', onOnline);
    const t = window.setInterval(() => void processQueue(), 60_000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(t);
    };
  }, []);
}

export function App() {
  const state = useGame();
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [herbFocus, setHerbFocus] = useState<string | null>(null);

  useGreenhouseClock();
  useIdentificationQueue();

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    if (loadSource === 'backup') toast('Der Spielstand wurde aus der Sicherung wiederhergestellt.', 'warn', 5000);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((t: Tab) => {
    location.hash = t;
    setTab(t);
    window.scrollTo(0, 0);
  }, []);

  const openSpecies = useCallback((id: string) => {
    setHerbFocus(id);
    go('herbarium');
  }, [go]);

  const openFinds = state.finds.filter((f) => f.status === 'ready' || f.status === 'failed').length;
  const plantAlerts = state.plants.filter((p) => p.disease).length + (state.seeds.length && state.plants.length < 12 ? 1 : 0);

  return (
    <div className="app">
      <main>
        {tab === 'start' && <Home go={go} />}
        {tab === 'entdecken' && <Discover />}
        {tab === 'herbarium' && <Herbarium key={herbFocus ?? 'h'} focus={herbFocus} onFocusDone={() => setHerbFocus(null)} />}
        {tab === 'gewaechshaus' && <Greenhouse />}
        {tab === 'karte' && <MapScreen openSpecies={openSpecies} />}
      </main>
      <nav className="nav" aria-label="Hauptmenü">
        <div className="nav-inner">
          {TABS.map(({ id, name, Icon }) => (
            <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
              <Icon />
              {name}
              {id === 'entdecken' && openFinds > 0 && <span className="badge">{openFinds}</span>}
              {id === 'gewaechshaus' && plantAlerts > 0 && <span className="badge">{plantAlerts}</span>}
            </button>
          ))}
        </div>
      </nav>
      <Reveal />
      <Toasts />
    </div>
  );
}
