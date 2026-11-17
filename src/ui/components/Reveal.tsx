import { abilityInfo } from '../../data/abilities';
import { speciesById } from '../../game/catalog';
import { needsText } from '../../game/ecology';
import { roomInfo } from '../../data/rooms';
import { popReveal } from '../../game/game';
import { rarityInfo, rarityOf, rarityRank, RL_TEXT } from '../../game/rarity';
import { update, useGame } from '../../store/store';
import { SpeciesCard, TYPE_NAMES } from './common';


/** Discovery overlay, shown for each queued reveal. Rarer = more spectacle. */
export function Reveal() {
  const state = useGame();
  const r = state.revealQueue[0];
  if (!r) return null;
  const sp = speciesById(state, r.speciesId);
  const rarity = rarityOf(sp);
  const info = rarityInfo(rarity);
  const find = state.finds.find((f) => f.id === r.findId);
  const particles = r.isNew ? Math.max(0, rarityRank(rarity) * 6) : 0;
  const ability = sp.abilities[0] ? abilityInfo(sp.abilities[0]) : null;
  const next = () => update(popReveal);
  return (
    <div className={`reveal r-${rarity} ${r.isNew ? '' : 'repeat'}`} role="dialog" aria-modal="true" aria-label="Entdeckung">
      {r.isNew && <div className="rays" />}
      {Array.from({ length: particles }, (_, i) => (
        <span key={i} className="particle" style={{ left: `${(i * 37) % 100}%`, bottom: `${(i * 13) % 30}%`, animationDelay: `${(i % 9) * 0.35}s` }} />
      ))}
      <div className="headline">
        <small>{r.isNew ? (rarityRank(rarity) >= 3 ? `${info.name}er Fund!` : 'Neue Art entdeckt') : 'Wiederfund'}</small>
        <h1>{sp.de}</h1>
      </div>
      <SpeciesCard species={sp} photoId={find?.photoId} shine={r.isNew && rarityRank(rarity) >= 2} />
      {r.isNew && (
        <div className="facts-box stack small">
          <div className="row">
            <span className="tag">{TYPE_NAMES[sp.type]}</span>
            <span className="tag">Rote Liste: {RL_TEXT[sp.rl]}</span>
            {sp.endemic && <span className="tag good">Nur in Deutschland</span>}
          </div>
          <p>{sp.description}</p>
          <p className="muted">
            Mag: {needsText(sp.eco)}
          </p>
          {ability && (
            <p>
              <b>Besonderheit: {ability.name}</b> – {ability.description}
            </p>
          )}
        </div>
      )}
      <div className="rewards">
        {r.newRooms?.map((id) => (
          <span key={id} className="tag good">{roomInfo(id).kennarten ? '✨ Geheimraum entdeckt' : '🏠 Neuer Raum'}: {roomInfo(id).icon} {roomInfo(id).name}</span>
        ))}
        {r.seedGained && <span className="tag good">🌱 1 Samen für dein Gewächshaus</span>}
        {r.items.duenger ? <span className="tag">🧪 +{r.items.duenger} Dünger</span> : null}
        {r.items.heilmittel ? <span className="tag">💊 +{r.items.heilmittel} Heilmittel</span> : null}
        {r.xpToPlants > 0 && <span className="tag good">✨ +{r.xpToPlants} Erfahrung für deine {sp.de}</span>}
        {find && !find.verified && <span className="tag warn">{find.score == null ? 'Selbst bestimmt' : 'Unsichere Erkennung'}</span>}
      </div>
      <button className="btn primary" onClick={next}>
        {state.revealQueue.length > 1 ? 'Nächster Fund' : 'Weiter'}
      </button>
    </div>
  );
}
