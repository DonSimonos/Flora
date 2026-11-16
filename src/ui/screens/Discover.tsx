import { useEffect, useMemo, useRef, useState } from 'react';
import { PlantArt } from '../../art/PlantArt';
import { SPECIES } from '../../data/species';
import { BALANCE } from '../../game/config';
import { addFind, confirmFind, deleteFind, uid } from '../../game/game';
import { matchSpecies } from '../../game/catalog';
import { rarityFrom, rarityOf } from '../../game/rarity';
import { searchRedList } from '../../game/redlist';
import type { Candidate, Find } from '../../game/types';
import { currentFix, exifGps, onGps, startGps, type Fix } from '../../services/geo';
import { preparePhoto } from '../../services/image';
import { deletePhoto, savePhoto } from '../../services/photos';
import { plantnetConfigured } from '../../services/plantnet';
import { identifyFind } from '../../services/queue';
import { getState, update, useGame } from '../../store/store';
import { toast } from '../../store/toast';
import { IconShutter } from '../components/icons';
import { dateText, Photo, RarityBadge, Sheet } from '../components/common';

export function Discover() {
  const state = useGame();
  const [fix, setFix] = useState<Fix | null>(null);
  const [gpsErr, setGpsErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openFind, setOpenFind] = useState<string | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startGps();
    return onGps((f, e) => {
      setFix(f);
      setGpsErr(e);
    });
  }, []);

  async function handleFile(file: File, fromGallery: boolean) {
    setBusy(true);
    try {
      const prepared = await preparePhoto(file);
      let lat: number | null = null;
      let lng: number | null = null;
      let accuracy: number | null = null;
      let locSource: Find['locSource'] = 'none';
      if (fromGallery) {
        const g = await exifGps(file);
        if (g) { lat = g.lat; lng = g.lng; locSource = 'exif'; }
      } else {
        const f = await currentFix();
        if (f) { lat = f.lat; lng = f.lng; accuracy = f.accuracy; locSource = 'gps'; }
      }
      const photoId = uid();
      await savePhoto(photoId, prepared);
      const find: Find = {
        id: uid(), createdAt: new Date().toISOString(), lat, lng, accuracy, locSource, photoId,
        status: 'pending', candidates: [], speciesId: null, verified: false, score: null, error: null, attempts: 0,
      };
      update((s) => addFind(s, find));
      if (locSource === 'none') toast(fromGallery ? 'Im Foto steht kein Standort.' : 'Kein GPS-Standort – der Fund wird ohne Ort gespeichert.', 'warn', 4500);
      setOpenFind(find.id);
      if (navigator.onLine || !plantnetConfigured) void identifyFind(find.id);
    } catch {
      toast('Das Foto konnte nicht gelesen werden.', 'warn');
    } finally {
      setBusy(false);
    }
  }

  const open = state.finds.filter((f) => f.status !== 'confirmed');
  const gpsClass = fix ? 'ok' : gpsErr ? '' : 'wait';
  const gpsText = fix ? `GPS bereit · ± ${Math.round(fix.accuracy)} m` : gpsErr ?? 'Suche GPS-Signal …';

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Entdecken</h1>
          <div className="sub">Fotografiere eine wilde Pflanze</div>
        </div>
      </div>

      <section className="panel capture">
        <button className="shutter" onClick={() => camRef.current?.click()} disabled={busy} aria-label="Pflanze fotografieren">
          {busy ? <div className="spinner" /> : <IconShutter />}
        </button>
        <b style={{ fontSize: 18 }}>Pflanze fotografieren</b>
        <span className={`gps ${gpsClass}`}><i />{gpsText}</span>
        <button className="btn ghost" onClick={() => galRef.current?.click()} disabled={busy}>Foto aus Galerie wählen</button>
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void handleFile(f, false); }} />
        <input ref={galRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void handleFile(f, true); }} />
      </section>

      {!plantnetConfigured && (
        <p className="notice">
          <b>Testmodus:</b> Die automatische Erkennung ist noch nicht eingerichtet. Du wählst die Art selbst aus – solche Funde sind als „selbst bestimmt“ markiert.
        </p>
      )}

      {open.length > 0 && (
        <section className="panel">
          <h2>Offene Funde</h2>
          {open.map((f) => (
            <div key={f.id} className="find-row">
              <Photo id={f.photoId} className="thumb" />
              <div className="grow">
                <b>{statusText(f)}</b>
                <div className="muted small">{dateText(f.createdAt)}{f.lat == null ? ' · ohne Standort' : ''}</div>
              </div>
              <button className="btn" onClick={() => setOpenFind(f.id)}>Öffnen</button>
            </div>
          ))}
        </section>
      )}

      <section className="panel stack small">
        <h2>So gelingt die Erkennung</h2>
        <p>🌸 Blüte oder Blatt groß und scharf ins Bild – ein Organ pro Foto.</p>
        <p>🚶 Nur fotografieren, nichts pflücken. In Schutzgebieten auf den Wegen bleiben.</p>
        <p>📶 Kein Netz im Wald? Kein Problem: Der Fund wird gespeichert und später erkannt.</p>
      </section>

      {openFind && <IdentifySheet findId={openFind} onClose={() => setOpenFind(null)} />}
    </div>
  );
}

function statusText(f: Find): string {
  if (f.status === 'pending') return f.error ? `Wartet: ${f.error}` : 'Wird erkannt …';
  if (f.status === 'failed') return 'Bitte Art selbst wählen';
  if (f.candidates.length) return `${f.candidates.length} Vorschläge – bitte wählen`;
  return 'Bitte Art wählen';
}

function IdentifySheet({ findId, onClose }: { findId: string; onClose: () => void }) {
  const state = useGame();
  const find = state.finds.find((f) => f.id === findId);
  const [picked, setPicked] = useState<number>(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (find?.status === 'confirmed') onClose();
  }, [find?.status, onClose]);

  if (!find) return null;

  function choose(c: Candidate) {
    const verified = c.score >= BALANCE.verifiedScore;
    update((s) => confirmFind(s, findId, c.speciesId ? { speciesId: c.speciesId, score: c.score, verified } : { sci: c.sci, de: c.de, family: c.family, score: c.score, verified }));
  }

  function chooseManual(speciesId: string) {
    update((s) => confirmFind(s, findId, { speciesId, score: null, verified: false }));
  }

  function chooseOwn(de: string, sci: string) {
    update((s) => confirmFind(s, findId, { sci, de, family: null, score: null, verified: false }));
  }

  async function discard() {
    const f = getState().finds.find((x) => x.id === findId);
    update((s) => deleteFind(s, findId));
    if (f) await deletePhoto(f.photoId);
    onClose();
  }

  const showManual = manual || !plantnetConfigured;
  return (
    <Sheet title="Fund bestimmen" onClose={onClose}>
      <div className="stack">
        <Photo id={find.photoId} kind="full" className="photo-big" />
        {find.status === 'pending' && !showManual && (
          <div className="row">
            {navigator.onLine && !find.error ? <div className="spinner" /> : <span style={{ fontSize: 28 }}>📶</span>}
            <div className="grow">
              {navigator.onLine && !find.error ? (
                <b>Pl@ntNet erkennt deine Pflanze …</b>
              ) : (
                <>
                  <b>Gespeichert.</b>
                  <div className="muted small">{find.error ?? 'Die Erkennung startet, sobald du wieder Internet hast.'}</div>
                </>
              )}
            </div>
          </div>
        )}
        {!showManual && find.status !== 'pending' && (
          <>
            {find.error && <p className="notice">{find.error}</p>}
            {find.candidates.length > 0 && (
              <>
                <p className="muted small">Welche Art ist es? Vorschläge von Pl@ntNet:</p>
                {find.candidates.map((c, i) => {
                  const sp = c.speciesId ? SPECIES.find((s) => s.id === c.speciesId) : matchSpecies(c.sci);
                  return (
                    <button key={c.sci} className="cand" aria-pressed={picked === i} onClick={() => setPicked(i)}>
                      {sp ? <PlantArt species={sp} className="mini-art" /> : <div className="mini-art" />}
                      <div className="grow">
                        <b>{c.de ?? c.sci}</b>
                        <div className="muted small"><i>{c.sci}</i></div>
                        {sp && <div style={{ marginTop: 4 }}><RarityBadge rarity={rarityOf(sp)} /></div>}
                      </div>
                      <span className="pct">{Math.round(c.score * 100)}%</span>
                    </button>
                  );
                })}
                <button className="btn primary block" onClick={() => choose(find.candidates[picked])}>Diese Art ist es</button>
              </>
            )}
          </>
        )}
        {showManual ? (
          <SpeciesPicker onPick={chooseManual} onOwn={chooseOwn} />
        ) : (
          <button className="btn ghost" onClick={() => setManual(true)}>Keine passt – Art selbst wählen</button>
        )}
        <button className="btn ghost danger" onClick={discard}>Fund verwerfen</button>
      </div>
    </Sheet>
  );
}

function SpeciesPicker({ onPick, onOwn }: { onPick: (id: string) => void; onOwn: (de: string, sci: string) => void }) {
  const [q, setQ] = useState('');
  const [own, setOwn] = useState(false);
  const [de, setDe] = useState('');
  const [sci, setSci] = useState('');
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return SPECIES.filter((s) => !n || s.de.toLowerCase().includes(n) || s.sci.toLowerCase().includes(n)).slice(0, 40);
  }, [q]);
  // all other species of Germany from the Rote Liste
  const more = useMemo(() => {
    const builtIn = new Set(list.map((s) => s.id));
    return searchRedList(q, 30).filter((e) => {
      const m = matchSpecies(e.name);
      return !m || !builtIn.has(m.id);
    });
  }, [q, list]);
  return (
    <div className="stack">
      <input className="search" placeholder="Art suchen, z. B. Sonnentau oder Utricularia" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.map((s) => (
        <button key={s.id} className="cand" onClick={() => onPick(s.id)}>
          <PlantArt species={s} className="mini-art" />
          <div className="grow">
            <b>{s.de}</b>
            <div className="muted small"><i>{s.sci}</i></div>
          </div>
          <RarityBadge rarity={rarityOf(s)} />
        </button>
      ))}
      {more.length > 0 && (
        <>
          <p className="muted small">Weitere Arten Deutschlands (Rote Liste):</p>
          {more.map((e) => (
            <button key={e.name} className="cand" onClick={() => onOwn(e.de, e.name)}>
              <div className="grow">
                <b>{e.de || e.name}</b>
                <div className="muted small"><i>{e.name}</i></div>
              </div>
              <RarityBadge rarity={rarityFrom(e.rl, e.bestand)} />
            </button>
          ))}
        </>
      )}
      {list.length === 0 && more.length === 0 && <p className="muted">Keine Art gefunden.</p>}
      {!own ? (
        <button className="btn ghost" onClick={() => { setOwn(true); setDe(q.trim()); }}>
          Nicht gefunden? Selbst eintragen
        </button>
      ) : (
        <div className="panel stack">
          <b>Eigene Art eintragen</b>
          <input className="search" placeholder="Deutscher Name, z. B. Kleiner Wasserschlauch" value={de} onChange={(e) => setDe(e.target.value)} />
          <input className="search" placeholder="Wissenschaftlicher Name (freiwillig)" value={sci} onChange={(e) => setSci(e.target.value)} autoCapitalize="sentences" />
          <p className="muted tiny">Die Art kommt unter „Weitere entdeckte Arten“ ins Herbarium. Steht der wissenschaftliche Name in der Roten Liste, bekommt sie automatisch die passende Seltenheit.</p>
          <button className="btn primary" disabled={!de.trim() && !sci.trim()} onClick={() => onOwn(de.trim(), sci.trim())}>Eintragen</button>
        </div>
      )}
    </div>
  );
}
