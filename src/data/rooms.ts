// Lebensraum-Räume des Gewächshauses, grob angelehnt an die Hauptgruppen des Biotoptypenschlüssels
// Nordrhein-Westfalen (LANUV, Biotoptypen-Definitionen Stand 2014), ergänzt um Alpen und Küste.
// profile = typische Bedingungen auf der EIVE-Skala (0–10): M Feuchte, N Nährstoffe, R Bodenreaktion,
// L Licht, T Temperatur. Danach werden Arten automatisch dem passendsten Raum zugeordnet, und der Raum
// hält diese Bedingungen von selbst.

export type RoomId =
  | 'anzucht' | 'wald' | 'saum' | 'moor' | 'heide' | 'kalkrasen' | 'wiese' | 'feuchtwiese'
  | 'teich' | 'fluss' | 'fels' | 'alpen' | 'acker' | 'mauer' | 'salz'
  | 'galmei' | 'hofsaum' | 'blaenke' | 'wegrand' | 'heideweiher' | 'quellflur' | 'kalkacker' | 'schlucht' | 'schlagflur';

export interface RoomProfile { M: number; N: number; R: number; L: number; T: number }

export interface Room {
  id: RoomId;
  name: string;
  icon: string;
  /** Bezug zum NRW-Biotoptypenschlüssel bzw. Herkunft. */
  code: string;
  description: string;
  profile: RoomProfile;
  /** Colours for the drawn scene: sky top, sky bottom, ground. */
  colors: [string, string, string];
  /** Geheimraum: öffnet sich nur durch seine Kennarten (scientific names, lower case, Art oder Gattung). */
  kennarten?: string[];
}

export const ROOMS: Room[] = [
  { id: 'anzucht', name: 'Anzuchthaus', icon: '🏡', code: 'Allgemein', description: 'Für alle Arten. Hier stellst du Wasser, Boden und Licht selbst ein.', profile: { M: 5, N: 5, R: 5.5, L: 5.5, T: 5 }, colors: ['#3d6b52', '#22402f', '#5b4330'] },
  { id: 'wald', name: 'Waldboden', icon: '🌳', code: 'A Wälder', description: 'Schattig, frisch und humos – wie unter Buchen und Eichen.', profile: { M: 5, N: 6, R: 6, L: 2.5, T: 4.5 }, colors: ['#2f5d43', '#183326', '#3b2a1c'] },
  { id: 'saum', name: 'Hecke & Waldsaum', icon: '🌿', code: 'B Gehölze, AV Waldränder', description: 'Halbschattig und frisch – am Rand von Hecken und Wäldern.', profile: { M: 5, N: 6.5, R: 6, L: 5.5, T: 4.5 }, colors: ['#6f9e7a', '#2f5a3a', '#4a3a24'] },
  { id: 'moor', name: 'Moorbecken', icon: '💧', code: 'C Moore, Sümpfe', description: 'Nass, sehr sauer und nährstoffarm – Torfmoos und Wollgras.', profile: { M: 8.5, N: 1.5, R: 1.5, L: 7.5, T: 3.5 }, colors: ['#7d8c7a', '#3a4a3a', '#4a3b26'] },
  { id: 'heide', name: 'Heidebeet', icon: '🟣', code: 'D Heiden, Borstgrasrasen', description: 'Sauer und nährstoffarm, sonnig – Zwergsträucher auf Sand.', profile: { M: 4, N: 1.5, R: 2.5, L: 8, T: 4.5 }, colors: ['#c9a7c7', '#e8d2c0', '#6b4f3a'] },
  { id: 'kalkrasen', name: 'Kalkmagerrasen', icon: '🌸', code: 'DD Kalkhalbtrockenrasen', description: 'Trocken, kalkhaltig und sonnig – Paradies für Orchideen.', profile: { M: 3, N: 2, R: 8, L: 8, T: 5.5 }, colors: ['#a8d4ee', '#eef3d6', '#c8c0a0'] },
  { id: 'wiese', name: 'Wiese & Weide', icon: '🌼', code: 'E Grünland (Wiesen, Weiden)', description: 'Frisch und mäßig nährstoffreich – gemäht oder beweidet.', profile: { M: 4.5, N: 5, R: 6, L: 7.5, T: 4.2 }, colors: ['#9fd3e8', '#d9efc4', '#5d8a3a'] },
  { id: 'feuchtwiese', name: 'Feucht- & Nasswiese', icon: '💦', code: 'EC Nass- und Feuchtgrünland', description: 'Feucht bis nass, im Winter oft überflutet.', profile: { M: 6.5, N: 5, R: 6, L: 7, T: 4 }, colors: ['#9cc6d8', '#d4ead2', '#4f7a3a'] },
  { id: 'teich', name: 'Teich & Ufer', icon: '🪷', code: 'F Stillgewässer, CF Röhricht', description: 'Stehendes Wasser mit Ufer- und Röhrichtzone.', profile: { M: 9, N: 5.5, R: 6.3, L: 7.2, T: 4.4 }, colors: ['#7cc3d6', '#2f6f86', '#2a4f5c'] },
  { id: 'fluss', name: 'Fließgewässer', icon: '🏞️', code: 'F Bäche, Flüsse, Quellen', description: 'Strömendes Wasser und nasse Ufer – Bach, Fluss und Quelle.', profile: { M: 8, N: 7.5, R: 6.5, L: 6.7, T: 4.4 }, colors: ['#8fcbe0', '#3d7f95', '#5a5340'] },
  { id: 'fels', name: 'Felsgarten', icon: '🪨', code: 'G Fels, Schutthalden', description: 'Steinig und trocken – Felsen und Schutthalden der Mittelgebirge.', profile: { M: 2, N: 1.5, R: 7, L: 8.5, T: 4 }, colors: ['#b7c3cc', '#e3e7ea', '#8a8a86'] },
  { id: 'alpen', name: 'Alpen', icon: '🏔️', code: 'Alpen (Süddeutschland)', description: 'Kühl und hell, mit Frost und Schnee – alpine Matten und Felsen.', profile: { M: 5, N: 3, R: 5, L: 8.5, T: 1.2 }, colors: ['#a9c9ef', '#e9f1fb', '#7b7f86'] },
  { id: 'acker', name: 'Acker & Wegrand', icon: '🌾', code: 'H Äcker, Raine; L Ruderalfluren', description: 'Offen, sonnig und nährstoffreich – Ackerwildkräuter und Wegränder.', profile: { M: 4, N: 6, R: 6.5, L: 7.2, T: 5 }, colors: ['#f6d58c', '#f7ecd0', '#8a6a3c'] },
  { id: 'mauer', name: 'Mauer & Schotter', icon: '🧱', code: 'HN Mauerwerk, HD Gleisanlagen', description: 'Trocken, warm und kalkig – Mauerfugen und Bahnschotter.', profile: { M: 2, N: 3.5, R: 7.5, L: 8.5, T: 6.5 }, colors: ['#c9c4bd', '#ece8e2', '#8a7a6a'] },
  { id: 'salz', name: 'Salzwiese & Düne', icon: '🌊', code: 'EF Salzrasen, Küste', description: 'Salzig, sandig und sonnig – Wattrand, Salzwiese und Düne.', profile: { M: 5, N: 4, R: 7, L: 8.5, T: 5 }, colors: ['#8fd0f0', '#f3e7c4', '#d8c38f'] },

  // ---------- Geheimräume: öffnen sich durch Kennarten ----------
  { id: 'galmei', name: 'Galmeiflur', icon: '✨', code: 'DE Schwermetallrasen', description: 'Schwermetallhaltige Böden, auf denen nur Spezialisten wachsen.', profile: { M: 4, N: 2, R: 6.5, L: 8, T: 4.5 }, colors: ['#d6c9a8', '#efe6cf', '#7a6a50'],
    kennarten: ['viola calaminaria', 'viola guestphalica'] },
  { id: 'hofsaum', name: 'Hofsäume', icon: '🏚️', code: 'Dorf- und Hofränder', description: 'Nährstoffreiche Ränder an Höfen, Mauern und Zäunen – alte Dorfpflanzen.', profile: { M: 5, N: 8.5, R: 7, L: 7, T: 5.5 }, colors: ['#d8c8a8', '#efe4d0', '#6b5a44'],
    kennarten: ['chenopodium bonus-henricus', 'ballota nigra', 'leonurus cardiaca', 'malva neglecta', 'nepeta cataria', 'hyoscyamus niger', 'onopordum acanthium', 'hordeum murinum', 'marrubium vulgare', 'urtica urens', 'conium maculatum'] },
  { id: 'blaenke', name: 'Blänken', icon: '🫧', code: 'Flache Senken im Grünland', description: 'Flache Mulden, die im Winter überflutet sind und im Sommer trockenfallen.', profile: { M: 8, N: 6, R: 6, L: 8, T: 5 }, colors: ['#a9d3e3', '#dcefe2', '#5f7a4a'],
    kennarten: ['peplis portula', 'eleocharis acicularis', 'limosella aquatica', 'elatine', 'oenanthe fistulosa', 'ranunculus sceleratus', 'alopecurus geniculatus', 'alopecurus aequalis', 'rorippa palustris', 'myosurus minimus', 'veronica scutellata'] },
  { id: 'wegrand', name: 'Feuchte Wegränder', icon: '👣', code: 'Fahrspuren, nasse Wege', description: 'Verdichtete, nasse Fahrspuren und Wegränder mit winzigen Spezialisten.', profile: { M: 7, N: 4.5, R: 5, L: 8, T: 5 }, colors: ['#b9c9b0', '#e6eadb', '#7a6a50'],
    kennarten: ['juncus tenuis', 'gnaphalium uliginosum', 'sagina procumbens', 'radiola linoides', 'centaurium pulchellum', 'juncus bufonius', 'isolepis setacea', 'cyperus fuscus', 'hypericum humifusum', 'montia arvensis'] },
  { id: 'heideweiher', name: 'Heideweiher', icon: '🌀', code: 'FE Heideweiher, Moorblänke', description: 'Klare, nährstoffarme Heidegewässer – Heimat seltenster Wasserpflanzen.', profile: { M: 9.5, N: 2, R: 3, L: 8, T: 4.5 }, colors: ['#9cc9d8', '#e3d6e6', '#5a4a3a'],
    kennarten: ['lobelia dortmanna', 'littorella uniflora', 'pilularia globulifera', 'luronium natans', 'isoetes', 'baldellia ranunculoides', 'eleocharis multicaulis', 'helosciadium inundatum'] },
  { id: 'quellflur', name: 'Quellflur', icon: '💧', code: 'FK Quellen', description: 'Kühles, sauberes Quellwasser, das ständig aus dem Boden sickert.', profile: { M: 8.5, N: 5, R: 6, L: 4.5, T: 4 }, colors: ['#9ccfb8', '#2f5a48', '#4a4a3a'],
    kennarten: ['cardamine amara', 'chrysosplenium oppositifolium', 'chrysosplenium alternifolium', 'veronica beccabunga', 'montia fontana', 'stellaria alsine', 'pinguicula vulgaris', 'eriophorum latifolium'] },
  { id: 'kalkacker', name: 'Kalkscherbenacker', icon: '🏺', code: 'Äcker auf Kalk', description: 'Steinige Kalkäcker – Rückzugsort seltener Ackerwildkräuter.', profile: { M: 3.5, N: 5, R: 8, L: 7.5, T: 5.5 }, colors: ['#f1d8a0', '#f5eedc', '#b8a888'],
    kennarten: ['adonis aestivalis', 'adonis flammea', 'scandix pecten-veneris', 'caucalis platycarpos', 'legousia speculum-veneris', 'bupleurum rotundifolium', 'stachys annua', 'consolida regalis'] },
  { id: 'schlucht', name: 'Schlucht & Brunnenschacht', icon: '🕳️', code: 'GE Höhlen, Schluchtwälder', description: 'Schattig, kühl und feucht – Farne an Felsen und alten Brunnen.', profile: { M: 6, N: 6, R: 6.5, L: 2.5, T: 4 }, colors: ['#4a6a5a', '#1e3328', '#3a3a34'],
    kennarten: ['asplenium scolopendrium', 'asplenium trichomanes', 'polystichum aculeatum', 'lunaria rediviva', 'cystopteris fragilis', 'asplenium viride'] },
  { id: 'schlagflur', name: 'Schlagflur', icon: '🪓', code: 'AT Schlagfluren, Kalamitätenflächen', description: 'Licht im Wald nach Sturm oder Holzeinschlag – kurze Blütezeit der Pioniere.', profile: { M: 5, N: 6, R: 4.5, L: 7, T: 4 }, colors: ['#c7b8d8', '#e8e0d6', '#5a4632'],
    kennarten: ['epilobium angustifolium', 'chamaenerion angustifolium', 'atropa bella-donna', 'digitalis purpurea', 'senecio sylvaticus', 'rubus idaeus'] },
];

/** Salt plants (Halophyten) go to the Salzwiese – EIVE has no salt value. */
export const SALT_TAXA = [
  'salicornia', 'suaeda maritima', 'spergularia marina', 'spergularia media', 'puccinellia', 'tripolium pannonicum',
  'aster tripolium', 'limonium', 'glaux maritima', 'triglochin maritima', 'plantago maritima', 'cakile maritima',
  'honckenya peploides', 'eryngium maritimum', 'ammophila arenaria', 'crambe maritima', 'atriplex portulacoides',
  'artemisia maritima', 'spartina', 'leymus arenarius', 'cochlearia anglica', 'cochlearia danica',
  'bolboschoenus maritimus', 'armeria maritima',
];


export function roomInfo(id: RoomId): Room {
  return ROOMS.find((r) => r.id === id)!;
}
