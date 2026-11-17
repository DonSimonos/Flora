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
  Bei Pl@ntNet sind „expose my API key“ und die Domain `https://donsimonos.github.io` (mit `https://`)
  freigegeben. Fehler 401 = Schlüssel falsch, Fehler 403 = Domain nicht freigegeben.

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
- Rote Liste: offizielle Daten (Metzing et al. 2018) in `src/data/rote-liste-2018.json`, erzeugt mit
  `tools/import_rote_liste.py`. Lizenz CC BY-ND 4.0: Werte nie ändern, Quelle immer sichtbar nennen
  (`src/game/redlist.ts` hat Zitat und Lizenz). Eingebaute Arten holen sich Kategorie/Bestand von dort.
- Artendatenbank `src/game/artendb.ts`: Rote Liste + EIVE-Zeigerwerte (`src/data/eive-1.0.json`,
  erzeugt mit `tools/import_eive.py`, CC BY 4.0) + Ellenberg Deutschland. Nur offene Datenquellen
  verwenden. Gewächshaus-Bedürfnisse kommen aus `src/game/ecology.ts` (Stellschrauben in `config.ts` → `eco`).
- Lebensraum-Räume: Daten in `src/data/rooms.ts` (Profile, Kennarten der Geheimräume), Regeln in
  `src/game/rooms.ts` (Zuordnung, Freischalten, Beete, Raumbedingungen), Bilder in `src/art/RoomScene.tsx`.
- Fundorte sind in Version 1 nur für den Spieler selbst sichtbar. Für andere später nur über
  `publicLocation()` in `src/game/privacy.ts`: RL 1/0 und Bestand „es“ als TK25-Feld, RL 2/3/G/R ca. 300 m.
