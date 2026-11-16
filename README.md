# FLORA – Die Hüter der vergessenen Pflanzen

Handy-App (PWA) für Jugendliche und Erwachsene: Echte Wildpflanzen in Deutschland finden,
fotografieren und sammeln. Aus jedem Fund wächst im Gewächshaus eine Spielpflanze, die man
pflegt, trainiert und weiterentwickelt. Gesammelt wird nur per Foto – nichts pflücken.

Online: https://donsimonos.github.io/Flora/

## Was Version 1 kann

- **Entdecken:** Foto + GPS. Pl@ntNet schlägt die Art vor; ohne Internet wird der Fund gespeichert
  und später erkannt. Ohne Pl@ntNet-Schlüssel: Testmodus, Art selbst wählen.
- **Entdeckungs-Animation** und **Sammelkarte** mit Rahmen in der Farbe der Seltenheit
  (Gewöhnlich bis Mythisch, aus Roter Liste und Bestand).
- **Herbarium** mit allen Arten, Silhouetten für unentdeckte, Filter nach Lebensraum und Seltenheit.
- **Gewächshaus:** Samen einpflanzen, gießen, düngen, Licht, Boden, Schnitt, Krankheiten,
  5 Trainingsarten, Level 1–50, Fähigkeiten, je 2 Entwicklungsformen pro Art. Echte Zeit, aber sanft.
- **Karte** mit den eigenen Fundorten.

## Entwicklung

```bash
npm install
npm run dev     # http://localhost:5190
npm test        # Spielregeln
npm run build   # prüft Typen und baut nach dist/
```

Für die Erkennung lokal eine Datei `.env.local` mit `VITE_PLANTNET_KEY=...` anlegen (nie committen).

## Quellen

Die Artendatenbank (`src/game/artendb.ts`) verbindet für jede Art Deutschlands Rote Liste, Zeigerwerte
und Ellenberg-Werte. Die Datendateien in `src/data/` werden mit den Werkzeugen in `tools/` aus den
Originaldateien erzeugt und nicht von Hand geändert.

- Pflanzenbestimmung: [Pl@ntNet](https://plantnet.org)
- Karte: © OpenStreetMap-Mitwirkende
- Zeigerwerte: Dengler, J., Jansen, F., Chusova, O. et al. (2023): Ecological Indicator Values for Europe
  (EIVE) 1.0. Vegetation Classification and Survey 4: 7–29. https://doi.org/10.3897/VCS.98324 –
  Lizenz [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de)
  (`tools/import_eive.py` → `src/data/eive-1.0.json`)
- Ellenberg-Zeigerwerte Deutschland: Ellenberg et al. (2001), Scripta Geobotanica 18 – übernommen aus
  EIVE 1.0, Supplementary material 2 (CC BY 4.0)
- Rote Liste: Metzing et al. (2018): Rote Liste und Gesamtartenliste der Farn- und Blütenpflanzen
  (Trachaeophyta) Deutschlands. – In: Metzing, D.; Hofbauer, N.; Ludwig, G. & Matzke-Hajek, G. (Red.):
  Rote Liste gefährdeter Tiere, Pflanzen und Pilze Deutschlands. Band 7: Pflanzen. – Münster
  (Landwirtschaftsverlag). – Naturschutz und Biologische Vielfalt 70 (7): 13-358. –
  URL: https://www.rote-liste-zentrum.de/die-roten-listen/download-pflanzen/ –
  Lizenz [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/deed.de). Die Werte werden
  unverändert übernommen (`tools/import_rote_liste.py` → `src/data/rote-liste-2018.json`).
