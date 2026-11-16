# FLORA

Pflanzen-Entdecker-Spiel als PWA. Die abgestimmten Anforderungen stehen in `ANFORDERUNGEN.md`;
dort Änderungen am Konzept festhalten (alten Text ersetzen, nicht stapeln).

## Arbeitsweise
- Der Besitzer (DonSimonos) ist kein Programmierer: auf Deutsch, in einfachen Worten erklären,
  vor größeren Entscheidungen fragen.
- `main` geht bei jedem Push automatisch online (`.github/workflows/pages.yml`).
  Deshalb nicht direkt auf `main` arbeiten: Änderungen auf einem Zweig `feature/<thema>` mit
  Pull Request; DonSimonos sieht ihn sich an und bestätigt das Zusammenführen.
  Vorher müssen `npm test` und `npm run build` fehlerfrei laufen.
- Pl@ntNet-Schlüssel nur als GitHub-Secret `PLANTNET_KEY` bzw. lokal in `.env.local`, nie im Code.

## Aufbau
- `src/game/` Spielregeln als reine Funktionen (keine React-Abhängigkeit), Tests in `game.test.ts`.
  - `config.ts` zentrale Balance (Erfahrung, Zeiten, Wahrscheinlichkeiten) – hier drehen, nicht im Code verteilt.
  - `rng.ts` reproduzierbarer Zufall: Ergebnisse hängen von Fund-/Pflanzen-IDs ab, nie von `Math.random`.
  - `rarity.ts` Seltenheit aus Roter Liste + Bestand (Mythisch = RL 1/0, Legendär = RL 2/R,
    Episch = RL 3/G, Selten = V, sonst nach Bestand).
  - `greenhouse.ts` Pflege, Training, Level, Fähigkeiten, Entwicklung. `game.ts` Spielstand-Operationen.
- `src/data/` Arten, Lebensräume, Fähigkeiten. Neue Art = neuer `sp({...})`-Eintrag in `species.ts`.
- `src/art/` SVG-Zeichnungen: `plants.tsx` 30 handgezeichnete Arten, sonst Zeichnung nach Pflanzentyp.
- `src/store/` Spielstand (localStorage mit Version + Sicherungskopie), `src/services/` Fotos (IndexedDB),
  GPS, Pl@ntNet, Offline-Warteschlange. `src/ui/` Oberfläche.

## Feste Entscheidungen
- Echte Arten, echtes Gelände, GPS. Ganz Deutschland. Jugendliche und Erwachsene.
- Version 1: Entdecken draußen + Gewächshaus. Später: Wettbewerbe, Spielerlevel/Missionen, Mitspieler.
- Rote-Liste-Angaben in `species.ts` sind vorläufig, bis die offiziellen Daten freigegeben sind.
- Fundorte sind in Version 1 nur für den Spieler selbst sichtbar; mit Mitspielern später alle,
  Rote-Liste-Arten mit 300 m Unschärfe.
