# FLORA – Die Hüter der vergessenen Pflanzen

Abgestimmte Anforderungen (Stand 2026-11-15). Grundlage für die Umsetzung.

## Idee
Handy-App (im Browser, PWA) für Jugendliche und Erwachsene in ganz Deutschland.
Man findet draußen echte wildwachsende Pflanzen, fotografiert sie und sammelt sie wie in einem
Sammelspiel. Aus jedem Fund wächst im Gewächshaus eine Spielpflanze, die man pflegt und trainiert.
Eigenständige Spielwelt und eigenes Design (kein Nachbau eines bestehenden Spiels).

## Version 1 (MVP): Entdecken draußen
- Foto + GPS-Standort; Art wird automatisch über Pl@ntNet erkannt.
- Ohne Internet: Foto und Standort werden gespeichert, Erkennung folgt automatisch, sobald Netz da ist.
- Solange kein Pl@ntNet-Schlüssel vorhanden ist: Art zum Testen selbst auswählen.
- Bei jeder neuen Art: Entdeckungs-Animation mit Name, Seltenheit, Typ, Eigenschaften, Beschreibung.
- Das eigene Foto wird zur Sammelkarte mit Rahmen in der Farbe der Seltenheit.
- Jede erkannte Art zählt (alle wildwachsenden Arten Deutschlands, ca. 4.000).
- Ca. 30 besondere Arten bekommen zusätzlich: gezeichnete Figur (zuerst von Claude als SVG,
  später austauschbar gegen Profi-Zeichnungen), eigene Fähigkeiten, Entwicklungsformen, Geschichte.
- Herbarium mit allen Arten; nicht gefundene als Silhouette; Filter nach Seltenheit;
  Fortschritt je Lebensraum und gesamt.
- Lebensräume (statt Fantasie-Biome): z. B. Wald, Moor, Heide, Küste, Alpen, Magerrasen,
  Gewässer, Stadt.

### Seltenheit (aus Roter Liste Deutschland + aktueller Bestandssituation)
| Stufe | Bedeutung |
|---|---|
| Gewöhnlich | weit verbreitet, ungefährdet |
| Ungewöhnlich | zerstreut, ungefährdet |
| Selten | Vorwarnliste (V) |
| Episch | RL 3 (gefährdet), G (Gefährdung unbekannten Ausmaßes) |
| Legendär | RL 2 (stark gefährdet), R (extrem selten) |
| Mythisch | RL 1 (vom Aussterben bedroht), RL 0 (ausgestorben/verschollen, Wiederfund) |
| (D, Daten unzureichend) | nach Verbreitung: Gewöhnlich bis Selten |

## Version 1 (MVP): Gewächshaus
- Jeder echte Fund gibt einen virtuellen Samen; daraus wächst eine Spielpflanze.
- Pflege: Gießen, Düngen, Licht regulieren, Boden verbessern, Beschneiden, Krankheiten behandeln.
- Training: Wachstum, Wurzeln, Licht, Resistenz, Anpassung.
- Werte: Wachstum, Vitalität, Widerstandsfähigkeit, Anpassungsfähigkeit, Energie, Seltenheitspotenzial.
- Level 1–50, Fähigkeiten (z. B. Tiefenwurzler, Nachtblüte, Frostschutz), Entwicklungsformen
  abhängig von Pflege, Training und Bedingungen.
- Individuelle Bedürfnisse je Art bzw. Lebensraum.
- Zeit: echte Zeit, sanft – wer ein paar Tage nicht spielt, verliert nichts; die Pflanze wartet.
- Besondere Bedingungen (Nacht, Regen, Höhe …) gibt es nur im Gewächshaus, nicht bei Funden draußen.

## Später (nicht in Version 1)
- Wettbewerbe: Werte-Wettbewerbe gegen den Computer + Natur-Challenges draußen.
- Spielerlevel, Erfahrungspunkte, Tagesaufgaben, Missionen, Erfolge/Abzeichen, Profil.
- Mitspieler (Anmeldung, Server, Rangliste). Dann sehen alle die Fundorte, aber geschützt
  (siehe „Daten und Fundortschutz“).

## Technik
- React + TypeScript + Vite, PWA. Spielmechanik, Daten und Oberfläche getrennt.
- Spielstand auf dem Gerät gespeichert (Fotos in IndexedDB, Spielstand robust mit Versionierung).
- Zentrale Konfiguration für Balance und Wahrscheinlichkeiten, reproduzierbarer Zufall.
- Erweiterbar: neue Arten, Lebensräume, Fähigkeiten ohne Umbau.
- Eigenes Repository `flora` (getrennt von der PflanzenKarte), Veröffentlichung über GitHub Pages.

## Daten und Fundortschutz
- Rote Liste: Metzing et al. (2018), Rote-Liste-Zentrum. Lizenz CC BY-ND 4.0 (Namensnennung –
  keine Bearbeitung), Nutzung für FLORA bestätigt per Mail vom 16.11.2026. Werte unverändert
  übernehmen, Quelle in der App sichtbar nennen (Herbarium, „Quellen & Lizenzen“).
- Die ganze Gesamtartenliste (4.382 Arten und Artengruppen) ist in der App: Auswahl im Testmodus
  und automatische Seltenheit für jede erkannte Art.
- Fundorte für andere (ab der Stufe mit Mitspielern), auf Empfehlung des Rote-Liste-Zentrums:
  Kategorie 1 und 0 sowie Bestand „extrem selten“ nur als TK25-Rasterfeld (ca. 11 × 11 km);
  Kategorien 2, 3, G, R auf etwa 300 m vergröbert; sonst genau. Eigene Funde sieht man immer genau.

## Artendatenbank und Zeigerwerte (seit 16.11.2026)
- Nur offene Datenquellen. Zeigerwerte aus EIVE 1.0 (Dengler et al. 2023, CC BY 4.0): Feuchte,
  Nährstoffe, Bodenreaktion, Licht, Temperatur (0–10) mit Nischenbreite, für 3.506 der 4.382 Arten der
  Roten Liste. Die originalen Ellenberg-Werte Deutschlands (aus EIVE Suppl. 2) werden im Steckbrief gezeigt.
  Die originale Ellenberg-Ausgabe (Buch/CD) ist nicht offen lizenziert und wird nicht verwendet.
- Gewächshaus nutzt die Zeigerwerte: Wasser-, Nährstoff- und Bodenreaktionsbereich je Art, beste
  Lichtstufe (weiter 3 Stufen), Temperatur (Frost, Höhenkammer). Neue Pflege: „Kalk streuen“ und
  „Laubhumus geben“; der Boden kehrt langsam zu neutral zurück.

## Lebensraum-Räume im Gewächshaus (seit 17.11.2026)
- Grob angelehnt an die Hauptgruppen des Biotoptypenschlüssels NRW (LANUV), ergänzt um Alpen und Küste.
- Anzuchthaus (12 Beete, alles selbst einstellen) plus 14 Räume: Waldboden, Hecke & Waldsaum,
  Moorbecken, Heidebeet, Kalkmagerrasen, Wiese & Weide, Feucht- & Nasswiese, Teich & Ufer,
  Fließgewässer, Felsgarten, Alpen (ersetzt die Höhenkammer), Acker & Wegrand, Mauer & Schotter,
  Salzwiese & Düne.
- 9 Geheimräume mit Kennarten: Galmeiflur, Hofsäume, Blänken, Feuchte Wegränder, Heideweiher,
  Quellflur, Kalkscherbenacker, Schlucht & Brunnenschacht, Schlagflur.
- Zuordnung einer Art automatisch über die Zeigerwerte (Raumprofile in `src/data/rooms.ts`);
  Salzpflanzen über eine Artenliste, Geheimräume über ihre Kennarten.
- Wirkung: Ein Raum hält seine Bedingungen (Wasser, Nährstoffe, Bodenreaktion, Licht, Temperatur)
  von selbst – kein zusätzlicher Wachstumsbonus. Unpassende Arten fühlen sich dort schlecht.
- Freischalten durch Entdeckungen: 3 passende Arten; Geheimraum: 2 Kennarten oder eine gefährdete
  Kennart (Rote Liste 0, 1, 2, 3, G, R). Beete: Start 2, je 3 weitere passende Arten +1, höchstens 8.
- Jeder Raum hat ein eigenes gezeichnetes Bild.

## Erkennung
- Pl@ntNet ist eingerichtet (seit 16.11.2026): Schlüssel als GitHub-Secret `PLANTNET_KEY`,
  bei Pl@ntNet freigegeben für `https://donsimonos.github.io`. Kostenlos bis 500 Erkennungen pro Tag.

## Offene Punkte
- Weiterer Ausbau des Gewächshauses: Bestäuber, Wettbewerbe (Vorschläge vom 16.11.2026) – offen.
