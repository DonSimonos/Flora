// Eingebaute Artenliste.
// ACHTUNG: Rote-Liste-Kategorie (rl) und Bestand sind VORLÄUFIGE TESTDATEN nach bestem Wissen.
// Sie werden durch die offiziellen Daten (Metzing et al. 2018, Rote-Liste-Zentrum) ersetzt,
// sobald die Nutzung geklärt ist. Neue Arten: einfach weitere sp(...)-Einträge anhängen.
import type {
  Bestand, EvolutionForm, FormEffect, FormTrigger, HabitatId, Needs, PlantType, RedListCat, Species, StatId,
} from '../game/types';

const TYPE_STATS: Record<PlantType, Omit<Record<StatId, number>, 'potenzial'>> = {
  kraut: { wachstum: 6, vitalitaet: 5, resistenz: 4, anpassung: 5, energie: 5 },
  orchidee: { wachstum: 3, vitalitaet: 4, resistenz: 3, anpassung: 7, energie: 5 },
  farn: { wachstum: 5, vitalitaet: 6, resistenz: 6, anpassung: 4, energie: 3 },
  gras: { wachstum: 7, vitalitaet: 5, resistenz: 6, anpassung: 6, energie: 4 },
  karnivore: { wachstum: 3, vitalitaet: 4, resistenz: 4, anpassung: 8, energie: 6 },
  zwergstrauch: { wachstum: 3, vitalitaet: 6, resistenz: 8, anpassung: 5, energie: 4 },
  wasserpflanze: { wachstum: 5, vitalitaet: 6, resistenz: 4, anpassung: 5, energie: 6 },
  zwiebel: { wachstum: 5, vitalitaet: 4, resistenz: 5, anpassung: 4, energie: 7 },
  distel: { wachstum: 4, vitalitaet: 5, resistenz: 8, anpassung: 6, energie: 4 },
};

const TYPE_ABILITIES: Record<PlantType, string[]> = {
  kraut: ['pionier', 'duftlockstoff', 'regeneration'],
  orchidee: ['duftlockstoff', 'nebelkind', 'bluetenmagnet'],
  farn: ['schattenkuenstler', 'nebelkind', 'immergruen'],
  gras: ['tiefenwurzler', 'pionier', 'abwehrkraft'],
  karnivore: ['fallensteller', 'regentaenzer', 'bluetenmagnet'],
  zwergstrauch: ['immergruen', 'frostschutz', 'tiefenwurzler'],
  wasserpflanze: ['schwimmblatt', 'regentaenzer', 'photosynthese'],
  zwiebel: ['photosynthese', 'nachtbluete', 'regeneration'],
  distel: ['salztoleranz', 'tiefenwurzler', 'abwehrkraft'],
};

const HABITAT_NEEDS: Record<HabitatId, Needs> = {
  wald: { water: 2, light: 1, nutrients: 2 },
  wiese: { water: 2, light: 3, nutrients: 2 },
  moor: { water: 3, light: 2, nutrients: 1 },
  heide: { water: 1, light: 3, nutrients: 1 },
  kueste: { water: 1, light: 3, nutrients: 1 },
  gewaesser: { water: 3, light: 2, nutrients: 2 },
  gebirge: { water: 2, light: 3, nutrients: 1 },
  acker: { water: 2, light: 3, nutrients: 2 },
  stadt: { water: 1, light: 3, nutrients: 2 },
};

const cond = (id: 'nacht' | 'regen' | 'sonne' | 'nebel' | 'frost' | 'hoehe', count: number): FormTrigger => ({ kind: 'condition', id, count });
const train = (id: 'wachstum' | 'wurzel' | 'licht' | 'resistenz' | 'anpassung', count: number): FormTrigger => ({ kind: 'training', id, count });

function form(id: string, name: string, description: string, trigger: FormTrigger, effect: FormEffect, boost: EvolutionForm['boost']): EvolutionForm {
  return { id, name, description, trigger, effect, boost };
}

/** Generic forms per main habitat for species without hand-made forms. */
function genericForms(h: HabitatId): [EvolutionForm, EvolutionForm] {
  const mond = form('mondform', 'Mondform', 'Hat viele Nächte trainiert und schimmert silbern.', cond('nacht', 8), 'mond', { anpassung: 1.15, energie: 1.1 });
  const sonne = form('sonnenform', 'Sonnenform', 'Hat in der Sonne trainiert und leuchtet golden.', cond('sonne', 8), 'sonne', { energie: 1.2, wachstum: 1.1 });
  const tau = form('tauform', 'Tauform', 'Im Regen gewachsen, voller funkelnder Tropfen.', cond('regen', 8), 'tau', { vitalitaet: 1.2 });
  const nebel = form('nebelform', 'Nebelform', 'Im Nebel gereift, geheimnisvoll verschleiert.', cond('nebel', 6), 'nebel', { anpassung: 1.2 });
  const frost = form('frostform', 'Frostform', 'Hat Frost überstanden, mit Raureif überzogen.', cond('frost', 4), 'frost', { resistenz: 1.25 });
  const gipfel = form('gipfelform', 'Gipfelform', 'In der Höhenkammer abgehärtet.', cond('hoehe', 10), 'gipfel', { resistenz: 1.15, anpassung: 1.1 });
  const wurzel = form('wurzelform', 'Wurzelform', 'Durch Wurzeltraining tief verankert.', train('wurzel', 20), 'wurzel', { resistenz: 1.15, vitalitaet: 1.1 });
  const bluete = form('bluetenform', 'Blütenform', 'Durch Wachstumstraining überreich blühend.', train('wachstum', 20), 'bluete', { wachstum: 1.2 });
  const map: Record<HabitatId, [EvolutionForm, EvolutionForm]> = {
    wald: [mond, wurzel],
    wiese: [sonne, bluete],
    moor: [nebel, tau],
    heide: [sonne, frost],
    kueste: [tau, form('gischtform', 'Gischtform', 'Durch Anpassungstraining salzfest geworden.', train('anpassung', 20), 'nebel', { anpassung: 1.2 })],
    gewaesser: [tau, mond],
    gebirge: [gipfel, frost],
    acker: [sonne, wurzel],
    stadt: [form('pflasterform', 'Pflasterform', 'Durch Resistenztraining unverwüstlich.', train('resistenz', 20), 'wurzel', { resistenz: 1.2 }), sonne],
  };
  return map[h];
}

interface SpecInput {
  id: string;
  sci: string;
  de: string;
  family: string;
  habitats: HabitatId[];
  type: PlantType;
  rl: RedListCat;
  bestand: Bestand;
  color: string;
  description: string;
  needs?: Partial<Needs>;
  stats?: Partial<Record<StatId, number>>;
  abilities?: string[];
  forms?: [EvolutionForm, EvolutionForm];
  art?: boolean;
  synonyms?: string[];
}

function sp(i: SpecInput): Species {
  const base = { ...TYPE_STATS[i.type], ...i.stats };
  return {
    id: i.id,
    sci: i.sci,
    de: i.de,
    family: i.family,
    habitats: i.habitats,
    type: i.type,
    rl: i.rl,
    bestand: i.bestand,
    description: i.description,
    needs: { ...HABITAT_NEEDS[i.habitats[0]], ...i.needs },
    baseStats: { ...base, potenzial: 0 }, // potenzial is filled from rarity, see plantStats()
    abilities: i.abilities ?? TYPE_ABILITIES[i.type],
    forms: i.forms ?? genericForms(i.habitats[0]),
    color: i.color,
    art: i.art ? i.id : undefined,
    synonyms: i.synonyms,
  };
}

export const SPECIES: Species[] = [
  // ---------- Besondere Arten mit eigener Zeichnung ----------
  sp({
    id: 'loewenzahn', sci: 'Taraxacum sect. Ruderalia', de: 'Löwenzahn', family: 'Korbblütler', habitats: ['stadt', 'wiese'], type: 'kraut', rl: '*', bestand: 'sh', color: '#f5c518', art: true,
    synonyms: ['Taraxacum officinale'],
    description: 'Wächst sogar in Pflasterritzen. Aus jeder gelben Blüte wird eine Pusteblume mit bis zu 200 Flugschirmchen.',
    stats: { wachstum: 8, resistenz: 6 }, abilities: ['pionier', 'tiefenwurzler', 'bluetenmagnet'],
    forms: [
      form('pusteblume', 'Pusteblumen-Form', 'Hat sich ganz dem Wachstum verschrieben und trägt eine leuchtende Samenkugel.', train('wachstum', 20), 'bluete', { wachstum: 1.25 }),
      form('sonnenrad', 'Sonnenrad', 'Hat in der Sonne trainiert und strahlt wie eine kleine Sonne.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
    ],
  }),
  sp({
    id: 'gaensebluemchen', sci: 'Bellis perennis', de: 'Gänseblümchen', family: 'Korbblütler', habitats: ['wiese', 'stadt'], type: 'kraut', rl: '*', bestand: 'sh', color: '#ffffff', art: true,
    description: 'Blüht fast das ganze Jahr. Abends und bei Regen schließt es seine Blütenköpfe.',
    stats: { vitalitaet: 7 }, abilities: ['regeneration', 'regentaenzer', 'duftlockstoff'],
    forms: [
      form('schlafblume', 'Schlafblume', 'Hat nachts trainiert und leuchtet mit geschlossenen Blüten.', cond('nacht', 8), 'mond', { vitalitaet: 1.2 }),
      form('tausendschoen', 'Tausendschön', 'Durch Wachstumstraining mit doppelter Blütenkrone.', train('wachstum', 20), 'bluete', { wachstum: 1.2 }),
    ],
  }),
  sp({
    id: 'klatschmohn', sci: 'Papaver rhoeas', de: 'Klatschmohn', family: 'Mohngewächse', habitats: ['acker'], type: 'kraut', rl: '*', bestand: 'h', color: '#e0262b', art: true,
    description: 'Seine Samen bleiben jahrzehntelang im Boden keimfähig und warten auf frisch umgegrabene Erde.',
    stats: { energie: 7 }, abilities: ['sonnenanbeter', 'pionier', 'regeneration'],
    forms: [
      form('feuermohn', 'Feuermohn', 'Hat in der Sonne trainiert, die Blüte glüht wie Glut.', cond('sonne', 8), 'sonne', { energie: 1.25 }),
      form('samenwaechter', 'Samenwächter', 'Durch Wurzeltraining unglaublich ausdauernd.', train('wurzel', 20), 'wurzel', { resistenz: 1.2 }),
    ],
  }),
  sp({
    id: 'buschwindroeschen', sci: 'Anemone nemorosa', de: 'Buschwindröschen', family: 'Hahnenfußgewächse', habitats: ['wald'], type: 'kraut', rl: '*', bestand: 'h', color: '#f4f0ff', art: true,
    description: 'Blüht im zeitigen Frühjahr, bevor die Bäume Blätter haben, und bildet weiße Teppiche im Laubwald.',
    needs: { light: 2 }, abilities: ['schattenkuenstler', 'frostschutz', 'regeneration'],
    forms: [
      form('fruehlingsbote', 'Frühlingsbote', 'Hat Frost getrotzt und trägt Eiskristalle auf den Blüten.', cond('frost', 4), 'frost', { resistenz: 1.25 }),
      form('mondteppich', 'Mondteppich', 'Nachts trainiert, die Blüten schimmern silbern.', cond('nacht', 8), 'mond', { anpassung: 1.2 }),
    ],
  }),
  sp({
    id: 'wurmfarn', sci: 'Dryopteris filix-mas', de: 'Echter Wurmfarn', family: 'Wurmfarngewächse', habitats: ['wald'], type: 'farn', rl: '*', bestand: 'sh', color: '#4f8a3a', art: true,
    description: 'Farne gab es schon vor den Dinosauriern. Statt Samen bildet der Wurmfarn Sporen an der Blattunterseite.',
    forms: [
      form('urfarn', 'Urfarn', 'Durch Wurzeltraining so mächtig wie seine Vorfahren aus der Urzeit.', train('wurzel', 20), 'wurzel', { vitalitaet: 1.2, resistenz: 1.1 }),
      form('nebelwedel', 'Nebelwedel', 'Im Nebel gereift, die Wedel verschwimmen geheimnisvoll.', cond('nebel', 6), 'nebel', { anpassung: 1.2 }),
    ],
  }),
  sp({
    id: 'besenheide', sci: 'Calluna vulgaris', de: 'Besenheide', family: 'Heidekrautgewächse', habitats: ['heide', 'moor'], type: 'zwergstrauch', rl: '*', bestand: 'h', color: '#c25bb5', art: true,
    description: 'Färbt im Spätsommer ganze Landschaften lila. Ohne Beweidung oder Pflege wird die Heide zu Wald.',
    forms: [
      form('heidefeuer', 'Heidefeuer', 'In der Sonne trainiert, die Blüten leuchten purpurrot.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
      form('raureifheide', 'Raureifheide', 'Hat Frost überstanden und glitzert weiß.', cond('frost', 4), 'frost', { resistenz: 1.2 }),
    ],
  }),
  sp({
    id: 'fingerhut', sci: 'Digitalis purpurea', de: 'Roter Fingerhut', family: 'Wegerichgewächse', habitats: ['wald'], type: 'kraut', rl: '*', bestand: 'mh', color: '#b0428f', art: true,
    description: 'Stark giftig – und trotzdem Grundlage wichtiger Herzmedikamente. Hummeln kriechen ganz in die Blütenglocken hinein.',
    needs: { light: 2 }, abilities: ['bluetenmagnet', 'schattenkuenstler', 'abwehrkraft'],
    forms: [
      form('giftglocke', 'Giftglocke', 'Durch Resistenztraining unangreifbar geworden.', train('resistenz', 20), 'wurzel', { resistenz: 1.25 }),
      form('mondglocke', 'Mondglocke', 'Nachts trainiert, die Glocken glimmen von innen.', cond('nacht', 8), 'mond', { anpassung: 1.15 }),
    ],
  }),
  sp({
    id: 'baerlauch', sci: 'Allium ursinum', de: 'Bärlauch', family: 'Amaryllisgewächse', habitats: ['wald'], type: 'zwiebel', rl: '*', bestand: 'mh', color: '#ffffff', art: true,
    description: 'Riecht kräftig nach Knoblauch. Vorsicht: Seine Blätter werden leicht mit giftigen Maiglöckchen verwechselt.',
    needs: { water: 3, nutrients: 3 },
    forms: [
      form('baerenkraut', 'Bärenkraut', 'Durch Wachstumstraining ein dichter Teppich voller Sternblüten.', train('wachstum', 20), 'bluete', { wachstum: 1.2 }),
      form('tauteppich', 'Tauteppich', 'Im Regen gereift, voller Tropfen.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
    ],
  }),
  sp({
    id: 'teichrose', sci: 'Nuphar lutea', de: 'Gelbe Teichrose', family: 'Seerosengewächse', habitats: ['gewaesser'], type: 'wasserpflanze', rl: '*', bestand: 'mh', color: '#f2c200', art: true,
    description: 'Ihre Blüten riechen nach Alkohol – im Volksmund heißt sie deshalb „Mummel“ oder „Schnapsblume“.',
    forms: [
      form('goldmummel', 'Goldmummel', 'In der Sonne trainiert, die Blüte glänzt wie Gold.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
      form('mondmummel', 'Mondmummel', 'Nachts trainiert, spiegelt den Mond im Wasser.', cond('nacht', 8), 'mond', { anpassung: 1.2 }),
    ],
  }),
  sp({
    id: 'strandhafer', sci: 'Ammophila arenaria', de: 'Strandhafer', family: 'Süßgräser', habitats: ['kueste'], type: 'gras', rl: '*', bestand: 's', color: '#d9c27a', art: true,
    description: 'Baumeister der Dünen: Seine Wurzeln halten den Sand fest. Wird er übersandet, wächst er einfach nach oben weiter.',
    abilities: ['salztoleranz', 'tiefenwurzler', 'abwehrkraft'],
    forms: [
      form('duenenwaechter', 'Dünenwächter', 'Durch Wurzeltraining unerschütterlich.', train('wurzel', 20), 'wurzel', { resistenz: 1.25 }),
      form('sturmhafer', 'Sturmhafer', 'Im Regen gewachsen, trotzt jedem Sturm.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
    ],
  }),
  sp({
    id: 'siebenstern', sci: 'Trientalis europaea', de: 'Siebenstern', family: 'Primelgewächse', habitats: ['wald', 'moor'], type: 'kraut', rl: '*', bestand: 's', color: '#ffffff', art: true,
    synonyms: ['Lysimachia europaea'],
    description: 'Hat meist genau sieben Blütenblätter – bei Blütenpflanzen eine echte Seltenheit.',
    needs: { nutrients: 1 }, abilities: ['nachtbluete', 'schattenkuenstler', 'nebelkind'],
    forms: [
      form('sternenlicht', 'Sternenlicht', 'Nachts trainiert, leuchtet wie ein Stern.', cond('nacht', 8), 'mond', { anpassung: 1.2, energie: 1.1 }),
      form('nebelstern', 'Nebelstern', 'Im Nebel gereift.', cond('nebel', 6), 'nebel', { anpassung: 1.15 }),
    ],
  }),
  sp({
    id: 'tuerkenbund', sci: 'Lilium martagon', de: 'Türkenbund-Lilie', family: 'Liliengewächse', habitats: ['wald', 'gebirge'], type: 'zwiebel', rl: '*', bestand: 's', color: '#c46a9a', art: true,
    description: 'Die Blütenblätter sind nach hinten gerollt wie ein Turban. Nachtfalter bestäuben sie in der Dämmerung.',
    needs: { light: 2 }, abilities: ['nachtbluete', 'photosynthese', 'regeneration'],
    forms: [
      form('daemmerlilie', 'Dämmerlilie', 'Nachts trainiert, lockt Nachtfalter mit Leuchten.', cond('nacht', 8), 'mond', { energie: 1.2 }),
      form('bergturban', 'Bergturban', 'In der Höhenkammer gereift.', cond('hoehe', 10), 'gipfel', { resistenz: 1.2 }),
    ],
  }),
  sp({
    id: 'schluesselblume', sci: 'Primula veris', de: 'Echte Schlüsselblume', family: 'Primelgewächse', habitats: ['wiese'], type: 'kraut', rl: 'V', bestand: 'mh', color: '#f3c623', art: true,
    description: 'Die nickenden Blüten erinnern an einen Schlüsselbund. Sie riecht nach Honig und braucht magere Wiesen.',
    needs: { nutrients: 1 }, abilities: ['duftlockstoff', 'sonnenanbeter', 'regeneration'],
    forms: [
      form('himmelsschluessel', 'Himmelsschlüssel', 'In der Sonne trainiert, golden leuchtend.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
      form('fruehlingsschluessel', 'Frühlingsschlüssel', 'Durch Wachstumstraining überreich blühend.', train('wachstum', 20), 'bluete', { wachstum: 1.2 }),
    ],
  }),
  sp({
    id: 'glockenheide', sci: 'Erica tetralix', de: 'Glockenheide', family: 'Heidekrautgewächse', habitats: ['moor', 'heide'], type: 'zwergstrauch', rl: 'V', bestand: 's', color: '#f08bb0', art: true,
    description: 'Ihre rosa Glöckchen hängen in Köpfchen zu viert. Sie wächst in feuchten Heiden und am Moorrand.',
    forms: [
      form('tauglocke', 'Tauglocke', 'Im Regen gereift, jede Glocke trägt einen Tropfen.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
      form('nebelglocke', 'Nebelglocke', 'Im Nebel gereift.', cond('nebel', 6), 'nebel', { anpassung: 1.2 }),
    ],
  }),
  sp({
    id: 'akelei', sci: 'Aquilegia vulgaris', de: 'Gewöhnliche Akelei', family: 'Hahnenfußgewächse', habitats: ['wald', 'wiese'], type: 'kraut', rl: 'V', bestand: 's', color: '#5b4bb7', art: true,
    description: 'Ihre Blüten tragen lange Sporne voller Nektar, an den nur Hummeln mit langem Rüssel herankommen.',
    needs: { light: 2 }, abilities: ['bluetenmagnet', 'nebelkind', 'duftlockstoff'],
    forms: [
      form('elfenschuh', 'Elfenschuh', 'Nachts trainiert, die Sporne glimmen.', cond('nacht', 8), 'mond', { anpassung: 1.2 }),
      form('sternsporn', 'Sternsporn', 'Durch Anpassungstraining verfeinert.', train('anpassung', 20), 'bluete', { anpassung: 1.25 }),
    ],
  }),
  sp({
    id: 'wollgras', sci: 'Eriophorum vaginatum', de: 'Scheiden-Wollgras', family: 'Sauergräser', habitats: ['moor'], type: 'gras', rl: 'V', bestand: 's', color: '#ffffff', art: true,
    description: 'Die weißen Wollschöpfe sind keine Blüten, sondern Fruchtstände. Ganze Moore sehen im Mai wie verschneit aus.',
    abilities: ['regentaenzer', 'tiefenwurzler', 'nebelkind'],
    forms: [
      form('wolkenwolle', 'Wolkenwolle', 'Im Nebel gereift, die Wolle schwebt wie Wolken.', cond('nebel', 6), 'nebel', { anpassung: 1.2 }),
      form('schneemoor', 'Schneemoor', 'Hat Frost überstanden.', cond('frost', 4), 'frost', { resistenz: 1.2 }),
    ],
  }),
  sp({
    id: 'sonnentau', sci: 'Drosera rotundifolia', de: 'Rundblättriger Sonnentau', family: 'Sonnentaugewächse', habitats: ['moor'], type: 'karnivore', rl: '3', bestand: 's', color: '#d6304a', art: true,
    description: 'Fleischfressend: Klebrige Tropfen an roten Drüsenhaaren fangen kleine Insekten – so gleicht er nährstoffarme Moorböden aus.',
    forms: [
      form('rubintau', 'Rubintau', 'Im Regen gereift, die Fangtropfen funkeln wie Rubine.', cond('regen', 8), 'tau', { vitalitaet: 1.2, anpassung: 1.1 }),
      form('mondfalle', 'Mondfalle', 'Nachts trainiert, die Tropfen leuchten im Dunkeln.', cond('nacht', 8), 'mond', { energie: 1.25 }),
    ],
  }),
  sp({
    id: 'arnika', sci: 'Arnica montana', de: 'Arnika', family: 'Korbblütler', habitats: ['gebirge', 'heide'], type: 'kraut', rl: '3', bestand: 's', color: '#f5a300', art: true,
    description: 'Alte Heilpflanze für Prellungen. Sie verträgt keinen Dünger und verschwindet, wenn Wiesen gedüngt werden.',
    abilities: ['regeneration', 'gipfelstuermer', 'sonnenanbeter'],
    forms: [
      form('bergsonne', 'Bergsonne', 'In der Höhenkammer gereift.', cond('hoehe', 10), 'gipfel', { resistenz: 1.15, energie: 1.15 }),
      form('heilstern', 'Heilstern', 'In der Sonne trainiert, strahlt Heilkraft aus.', cond('sonne', 8), 'sonne', { vitalitaet: 1.25 }),
    ],
  }),
  sp({
    id: 'frauenschuh', sci: 'Cypripedium calceolus', de: 'Frauenschuh', family: 'Orchideen', habitats: ['wald', 'gebirge'], type: 'orchidee', rl: '3', bestand: 'ss', color: '#f2d21b', art: true,
    description: 'Unsere größte heimische Orchidee. Ihre Schuh-Lippe ist eine Kesselfalle für Bienen. Bis zur ersten Blüte vergehen über zehn Jahre.',
    needs: { light: 2, nutrients: 1 },
    forms: [
      form('goldschuh', 'Goldschuh', 'In der Sonne trainiert, der Schuh glänzt wie Gold.', cond('sonne', 8), 'sonne', { energie: 1.2, anpassung: 1.1 }),
      form('waldfee', 'Waldfee', 'Im Nebel gereift.', cond('nebel', 6), 'nebel', { anpassung: 1.25 }),
    ],
  }),
  sp({
    id: 'fliegenragwurz', sci: 'Ophrys insectifera', de: 'Fliegen-Ragwurz', family: 'Orchideen', habitats: ['wiese'], type: 'orchidee', rl: '3', bestand: 's', color: '#5a2a1e', art: true,
    description: 'Ihre Blüte sieht aus wie ein Insekt und duftet wie ein Grabwespen-Weibchen. Die Männchen fallen darauf herein und bestäuben sie.',
    needs: { nutrients: 1 },
    forms: [
      form('trugbild', 'Trugbild', 'Durch Anpassungstraining eine perfekte Täuschung.', train('anpassung', 20), 'nebel', { anpassung: 1.3 }),
      form('sonnenfliege', 'Sonnenfliege', 'In der Sonne trainiert.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
    ],
  }),
  sp({
    id: 'krebsschere', sci: 'Stratiotes aloides', de: 'Krebsschere', family: 'Froschbissgewächse', habitats: ['gewaesser'], type: 'wasserpflanze', rl: '3', bestand: 's', color: '#ffffff', art: true,
    description: 'Taucht im Herbst auf den Gewässergrund ab und steigt im Frühling wieder auf. Libellen legen gern ihre Eier hinein.',
    forms: [
      form('tiefentaucher', 'Tiefentaucher', 'Durch Wurzeltraining gestärkt.', train('wurzel', 20), 'wurzel', { resistenz: 1.2 }),
      form('libellenhort', 'Libellenhort', 'Im Regen gereift.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
    ],
  }),
  sp({
    id: 'moorlilie', sci: 'Narthecium ossifragum', de: 'Moorlilie', family: 'Moorliliengewächse', habitats: ['moor', 'heide'], type: 'kraut', rl: '3', bestand: 's', color: '#f6c10a', art: true,
    description: 'Ihr alter Name „Beinbrech“ kommt vom Aberglauben, Weidetiere bekämen davon brüchige Knochen. Im Herbst färbt sie sich orange.',
    abilities: ['regentaenzer', 'nebelkind', 'sonnenanbeter'],
    forms: [
      form('goldfackel', 'Goldfackel', 'In der Sonne trainiert.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
      form('moorlicht', 'Moorlicht', 'Im Nebel gereift, leuchtet wie ein Irrlicht.', cond('nebel', 6), 'nebel', { anpassung: 1.2 }),
    ],
  }),
  sp({
    id: 'stranddistel', sci: 'Eryngium maritimum', de: 'Stranddistel', family: 'Doldenblütler', habitats: ['kueste'], type: 'distel', rl: '2', bestand: 'ss', color: '#8fb3d9', art: true,
    description: 'Silberblau, stachelig und streng geschützt. Eine Wachsschicht schützt sie vor Salz und Austrocknung in den Dünen.',
    forms: [
      form('silbersturm', 'Silbersturm', 'Durch Anpassungstraining salz- und sturmfest.', train('anpassung', 20), 'frost', { resistenz: 1.2, anpassung: 1.15 }),
      form('meerkristall', 'Meerkristall', 'Im Regen gereift.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
    ],
  }),
  sp({
    id: 'schachblume', sci: 'Fritillaria meleagris', de: 'Schachblume', family: 'Liliengewächse', habitats: ['wiese', 'gewaesser'], type: 'zwiebel', rl: '2', bestand: 'ss', color: '#8a3a6b', art: true,
    description: 'Ihre nickenden Glocken tragen ein Schachbrettmuster. Sie wächst nur auf Feuchtwiesen, die im Winter überschwemmt werden.',
    needs: { water: 3 }, abilities: ['regentaenzer', 'photosynthese', 'nachtbluete'],
    forms: [
      form('koenigsglocke', 'Königsglocke', 'Im Regen gereift, das Muster schimmert.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
      form('mondschach', 'Mondschach', 'Nachts trainiert.', cond('nacht', 8), 'mond', { energie: 1.2 }),
    ],
  }),
  sp({
    id: 'glanzkraut', sci: 'Liparis loeselii', de: 'Sumpf-Glanzkraut', family: 'Orchideen', habitats: ['moor'], type: 'orchidee', rl: '2', bestand: 'ss', color: '#c9d86a', art: true,
    description: 'Winzige gelbgrüne Orchidee mit glänzenden Blättern. Sie ist in der ganzen EU streng geschützt (FFH-Anhang II).',
    forms: [
      form('irrlicht', 'Irrlicht', 'Im Nebel gereift, glänzt geheimnisvoll.', cond('nebel', 6), 'nebel', { anpassung: 1.25 }),
      form('tauperle', 'Tauperle', 'Im Regen gereift.', cond('regen', 8), 'tau', { vitalitaet: 1.2 }),
    ],
  }),
  sp({
    id: 'edelweiss', sci: 'Leontopodium nivale', de: 'Edelweiß', family: 'Korbblütler', habitats: ['gebirge'], type: 'kraut', rl: 'R', bestand: 'es', color: '#f4f4ec', art: true,
    synonyms: ['Leontopodium alpinum', 'Leontopodium nivale subsp. alpinum'],
    description: 'Der weiße Filz schützt vor UV-Strahlung und Kälte. In Deutschland wächst es nur in wenigen Felswänden der Alpen.',
    abilities: ['frostschutz', 'gipfelstuermer', 'abwehrkraft'],
    forms: [
      form('gipfelstern', 'Gipfelstern', 'In der Höhenkammer gereift.', cond('hoehe', 10), 'gipfel', { resistenz: 1.2, anpassung: 1.15 }),
      form('eisstern', 'Eisstern', 'Hat Frost überstanden.', cond('frost', 4), 'frost', { resistenz: 1.3 }),
    ],
  }),
  sp({
    id: 'lungenenzian', sci: 'Gentiana pneumonanthe', de: 'Lungen-Enzian', family: 'Enziangewächse', habitats: ['moor', 'heide'], type: 'kraut', rl: '2', bestand: 'ss', color: '#2c5fd1', art: true,
    description: 'Tiefblaue Trichterblüten im Spätsommer. Ein seltener Bläuling legt nur hier seine Eier ab – die Raupen werden dann von Ameisen großgezogen.',
    abilities: ['nebelkind', 'regentaenzer', 'bluetenmagnet'],
    forms: [
      form('azurtrichter', 'Azurtrichter', 'In der Sonne trainiert.', cond('sonne', 8), 'sonne', { energie: 1.2 }),
      form('falterhort', 'Falterhort', 'Durch Anpassungstraining eng mit Faltern verbunden.', train('anpassung', 20), 'bluete', { anpassung: 1.25 }),
    ],
  }),
  sp({
    id: 'wasserfenchel', sci: 'Oenanthe conioides', de: 'Schierlings-Wasserfenchel', family: 'Doldenblütler', habitats: ['gewaesser'], type: 'kraut', rl: '1', bestand: 'es', color: '#ffffff', art: true,
    description: 'Gibt es weltweit nur am Süßwasser-Tideufer der Elbe bei Hamburg. Zweimal täglich steht er bei Flut unter Wasser.',
    needs: { water: 3, nutrients: 2 }, abilities: ['schwimmblatt', 'regentaenzer', 'regeneration'],
    forms: [
      form('gezeitenwaechter', 'Gezeitenwächter', 'Durch Wurzeltraining gegen jede Flut gewappnet.', train('wurzel', 20), 'wurzel', { resistenz: 1.3 }),
      form('elbmond', 'Elbmond', 'Nachts trainiert, folgt dem Mond wie die Gezeiten.', cond('nacht', 8), 'mond', { anpassung: 1.3 }),
    ],
  }),
  sp({
    id: 'boehmischer_enzian', sci: 'Gentianella bohemica', de: 'Böhmischer Enzian', family: 'Enziangewächse', habitats: ['wiese', 'gebirge'], type: 'kraut', rl: '1', bestand: 'es', color: '#8b4fc4', art: true,
    description: 'Wächst nur in Mitteleuropa und ist in Deutschland fast verschwunden. Die Pflanze lebt zwei Jahre, blüht einmal und stirbt dann.',
    needs: { nutrients: 1 }, abilities: ['gipfelstuermer', 'frostschutz', 'bluetenmagnet'],
    forms: [
      form('kronjuwel', 'Kronjuwel', 'In der Höhenkammer gereift.', cond('hoehe', 10), 'gipfel', { potenzial: 1.2, resistenz: 1.15 }),
      form('violettfrost', 'Violettfrost', 'Hat Frost überstanden.', cond('frost', 4), 'frost', { resistenz: 1.3 }),
    ],
  }),
  sp({
    id: 'bodensee_vergissmeinnicht', sci: 'Myosotis rehsteineri', de: 'Bodensee-Vergissmeinnicht', family: 'Raublattgewächse', habitats: ['gewaesser'], type: 'kraut', rl: '1', bestand: 'es', color: '#5fa8f0', art: true,
    description: 'Bildet himmelblaue Polster auf Kiesufern, die im Sommer überflutet werden. Fast nur am Bodensee zu finden.',
    needs: { water: 3, nutrients: 1 }, abilities: ['schwimmblatt', 'nebelkind', 'regeneration'],
    forms: [
      form('seeblau', 'Seeblau', 'Im Regen gereift, blau wie der See.', cond('regen', 8), 'tau', { vitalitaet: 1.3 }),
      form('uferstern', 'Uferstern', 'Durch Wachstumstraining zu einem dichten Polster geworden.', train('wachstum', 20), 'bluete', { wachstum: 1.3 }),
    ],
  }),
  sp({
    id: 'wasserschlauch', sci: 'Utricularia vulgaris', de: 'Gewöhnlicher Wasserschlauch', family: 'Wasserschlauchgewächse', habitats: ['gewaesser', 'moor'], type: 'karnivore', rl: '3', bestand: 's', color: '#f2c41a', art: true,
    description: 'Hat keine Wurzeln und schwebt frei im Wasser. Winzige Fangblasen saugen in einer Hundertstelsekunde Wasserflöhe ein – eine der schnellsten Bewegungen im Pflanzenreich.',
    needs: { water: 3, light: 3, nutrients: 1 }, abilities: ['fallensteller', 'schwimmblatt', 'sonnenanbeter'],
    forms: [
      form('blitzfalle', 'Blitzfalle', 'Durch Anpassungstraining fangen die Blasen noch schneller.', train('anpassung', 20), 'tau', { anpassung: 1.3 }),
      form('goldspiegel', 'Goldspiegel', 'In der Sonne trainiert, die Blüten leuchten über dem Wasser.', cond('sonne', 8), 'sonne', { energie: 1.25 }),
    ],
  }),

  // ---------- Weitere Arten (Zeichnung nach Pflanzentyp) ----------
  sp({ id: 'brennnessel', sci: 'Urtica dioica', de: 'Große Brennnessel', family: 'Brennnesselgewächse', habitats: ['wald', 'stadt'], type: 'kraut', rl: '*', bestand: 'sh', color: '#6d8a3a', needs: { nutrients: 3 }, description: 'Brennhaare wie winzige Glasnadeln. Futterpflanze für Raupen von Tagpfauenauge und Kleinem Fuchs.' }),
  sp({ id: 'kamille', sci: 'Matricaria chamomilla', de: 'Echte Kamille', family: 'Korbblütler', habitats: ['acker'], type: 'kraut', rl: '*', bestand: 'h', color: '#ffffff', synonyms: ['Matricaria recutita'], description: 'Erkennbar am hohlen Blütenboden. Seit Jahrhunderten als Tee gegen Entzündungen genutzt.' }),
  sp({ id: 'spitzwegerich', sci: 'Plantago lanceolata', de: 'Spitzwegerich', family: 'Wegerichgewächse', habitats: ['wiese', 'acker'], type: 'kraut', rl: '*', bestand: 'sh', color: '#8a7a55', description: 'Zerriebene Blätter helfen gegen juckende Mückenstiche.' }),
  sp({ id: 'rotklee', sci: 'Trifolium pratense', de: 'Rotklee', family: 'Hülsenfrüchtler', habitats: ['wiese'], type: 'kraut', rl: '*', bestand: 'sh', color: '#d0507a', description: 'Bindet mit Knöllchenbakterien Stickstoff aus der Luft und düngt so den Boden.' }),
  sp({ id: 'scharbockskraut', sci: 'Ficaria verna', de: 'Scharbockskraut', family: 'Hahnenfußgewächse', habitats: ['wald'], type: 'kraut', rl: '*', bestand: 'h', color: '#f7d21b', synonyms: ['Ranunculus ficaria'], description: 'Glänzend gelbe Sterne im Vorfrühling. Seeleute aßen die Blätter früher gegen Skorbut.' }),
  sp({ id: 'hahnenfuss', sci: 'Ranunculus acris', de: 'Scharfer Hahnenfuß', family: 'Hahnenfußgewächse', habitats: ['wiese'], type: 'kraut', rl: '*', bestand: 'sh', color: '#f5d000', description: 'Frisch giftig, getrocknet im Heu harmlos. Die Blüten glänzen wie lackiert.' }),
  sp({ id: 'wiesenschaumkraut', sci: 'Cardamine pratensis', de: 'Wiesen-Schaumkraut', family: 'Kreuzblütler', habitats: ['wiese', 'gewaesser'], type: 'kraut', rl: '*', bestand: 'h', color: '#e6c8ea', needs: { water: 3 }, description: 'Lieblingspflanze des Aurorafalters. Färbt feuchte Wiesen im April zartlila.' }),
  sp({ id: 'schafgarbe', sci: 'Achillea millefolium', de: 'Gewöhnliche Schafgarbe', family: 'Korbblütler', habitats: ['wiese', 'stadt'], type: 'kraut', rl: '*', bestand: 'sh', color: '#f2ece0', description: 'Ihre Blätter sind fein gefiedert wie tausend kleine Blättchen – daher „millefolium“.' }),
  sp({ id: 'rainfarn', sci: 'Tanacetum vulgare', de: 'Rainfarn', family: 'Korbblütler', habitats: ['acker', 'stadt'], type: 'kraut', rl: '*', bestand: 'h', color: '#e5b800', description: 'Gelbe Knöpfe ohne Blütenblätter. Riecht stark und hält manche Insekten fern.' }),
  sp({ id: 'vogelmiere', sci: 'Stellaria media', de: 'Vogelmiere', family: 'Nelkengewächse', habitats: ['acker', 'stadt'], type: 'kraut', rl: '*', bestand: 'sh', color: '#ffffff', description: 'Blüht selbst im Winter. Ihr Stängel hat eine einzelne Haarleiste, die die Seite wechselt.' }),
  sp({ id: 'guensel', sci: 'Ajuga reptans', de: 'Kriechender Günsel', family: 'Lippenblütler', habitats: ['wald', 'wiese'], type: 'kraut', rl: '*', bestand: 'h', color: '#4b4fc8', description: 'Breitet sich mit Ausläufern aus und bildet blaue Blütenkerzen.' }),
  sp({ id: 'gundermann', sci: 'Glechoma hederacea', de: 'Gundermann', family: 'Lippenblütler', habitats: ['wald', 'stadt'], type: 'kraut', rl: '*', bestand: 'sh', color: '#8a70c8', description: 'Kriecht am Boden entlang und duftet würzig, wenn man darauf tritt.' }),
  sp({ id: 'taubnessel', sci: 'Lamium album', de: 'Weiße Taubnessel', family: 'Lippenblütler', habitats: ['stadt', 'acker'], type: 'kraut', rl: '*', bestand: 'h', color: '#f8f6ea', description: 'Sieht aus wie eine Brennnessel, brennt aber nicht. Die Blüten schmecken süß nach Nektar.' }),
  sp({ id: 'walderdbeere', sci: 'Fragaria vesca', de: 'Wald-Erdbeere', family: 'Rosengewächse', habitats: ['wald'], type: 'kraut', rl: '*', bestand: 'h', color: '#ffffff', needs: { light: 2 }, description: 'Die „Beere“ ist eigentlich eine Sammelnussfrucht: Die echten Früchte sind die kleinen Körnchen außen.' }),
  sp({ id: 'heidelbeere', sci: 'Vaccinium myrtillus', de: 'Heidelbeere', family: 'Heidekrautgewächse', habitats: ['wald', 'heide'], type: 'zwergstrauch', rl: '*', bestand: 'h', color: '#3b4f9a', needs: { nutrients: 1 }, description: 'Färbt Mund und Zunge blau, weil das Fruchtfleisch – anders als bei Zuchtheidelbeeren – durchgefärbt ist.' }),
  sp({ id: 'preiselbeere', sci: 'Vaccinium vitis-idaea', de: 'Preiselbeere', family: 'Heidekrautgewächse', habitats: ['heide', 'wald'], type: 'zwergstrauch', rl: '*', bestand: 'mh', color: '#e04040', description: 'Immergrüne, ledrige Blätter und rote, herb-saure Beeren.' }),
  sp({ id: 'moosbeere', sci: 'Vaccinium oxycoccos', de: 'Gewöhnliche Moosbeere', family: 'Heidekrautgewächse', habitats: ['moor'], type: 'zwergstrauch', rl: '3', bestand: 's', color: '#e2607a', description: 'Fadendünne Triebe kriechen über Torfmoos. Wilde Verwandte der Cranberry.' }),
  sp({ id: 'sumpfporst', sci: 'Rhododendron tomentosum', de: 'Sumpfporst', family: 'Heidekrautgewächse', habitats: ['moor'], type: 'zwergstrauch', rl: '3', bestand: 's', color: '#ffffff', synonyms: ['Ledum palustre'], description: 'Riecht stark harzig und ist giftig. Wurde früher gegen Motten in Kleiderschränke gelegt.' }),
  sp({ id: 'maedesuess', sci: 'Filipendula ulmaria', de: 'Echtes Mädesüß', family: 'Rosengewächse', habitats: ['gewaesser', 'moor'], type: 'kraut', rl: '*', bestand: 'h', color: '#f6f0dc', needs: { nutrients: 3 }, description: 'Aus ihm wurde erstmals Salicylsäure gewonnen – der Name „Aspirin“ erinnert an seinen alten Namen Spiraea.' }),
  sp({ id: 'blutweiderich', sci: 'Lythrum salicaria', de: 'Blut-Weiderich', family: 'Weiderichgewächse', habitats: ['gewaesser'], type: 'kraut', rl: '*', bestand: 'h', color: '#c03a95', description: 'Leuchtend purpurne Blütenkerzen am Ufer, ein Magnet für Wildbienen.' }),
  sp({ id: 'schwertlilie', sci: 'Iris pseudacorus', de: 'Sumpf-Schwertlilie', family: 'Schwertliliengewächse', habitats: ['gewaesser'], type: 'zwiebel', rl: '*', bestand: 'h', color: '#f2c400', description: 'Ihre Wurzeln reinigen Wasser. Vorbild für die Lilie im französischen Königswappen.' }),
  sp({ id: 'froschloeffel', sci: 'Alisma plantago-aquatica', de: 'Gewöhnlicher Froschlöffel', family: 'Froschlöffelgewächse', habitats: ['gewaesser'], type: 'wasserpflanze', rl: '*', bestand: 'h', color: '#f1e6ef', description: 'Löffelförmige Blätter im Flachwasser. Die zarten Blüten öffnen sich erst am Nachmittag.' }),
  sp({ id: 'wasserminze', sci: 'Mentha aquatica', de: 'Wasser-Minze', family: 'Lippenblütler', habitats: ['gewaesser'], type: 'kraut', rl: '*', bestand: 'h', color: '#b48ad0', needs: { water: 3 }, description: 'Eine Elternart der Pfefferminze. Duftet beim Darüberstreifen intensiv.' }),
  sp({ id: 'rohrkolben', sci: 'Typha latifolia', de: 'Breitblättriger Rohrkolben', family: 'Rohrkolbengewächse', habitats: ['gewaesser'], type: 'gras', rl: '*', bestand: 'h', color: '#6b4a2b', needs: { water: 3 }, description: 'Ein „Kolben“ enthält bis zu 200.000 Samen mit Flughaaren.' }),
  sp({ id: 'strandaster', sci: 'Tripolium pannonicum', de: 'Strand-Aster', family: 'Korbblütler', habitats: ['kueste'], type: 'kraut', rl: '*', bestand: 'mh', color: '#9a86d8', synonyms: ['Aster tripolium'], description: 'Wächst in Salzwiesen, die bei Sturmflut überschwemmt werden.' }),
  sp({ id: 'queller', sci: 'Salicornia europaea', de: 'Europäischer Queller', family: 'Fuchsschwanzgewächse', habitats: ['kueste'], type: 'kraut', rl: '*', bestand: 'mh', color: '#6f9a3a', description: 'Erste Pflanze, die im Watt Fuß fasst. Schmeckt salzig und wird als „Meeresspargel“ gegessen.' }),
  sp({ id: 'meerkohl', sci: 'Crambe maritima', de: 'Echter Meerkohl', family: 'Kreuzblütler', habitats: ['kueste'], type: 'kraut', rl: 'V', bestand: 's', color: '#ffffff', description: 'Blaugrüne, wachsige Blätter auf Kiesstränden. Bildet große weiße Blütenwolken.' }),
  sp({ id: 'margerite', sci: 'Leucanthemum vulgare', de: 'Wiesen-Margerite', family: 'Korbblütler', habitats: ['wiese'], type: 'kraut', rl: '*', bestand: 'h', color: '#ffffff', description: 'Jede „Blüte“ besteht aus Hunderten Einzelblüten: weiße Zungen außen, gelbe Röhren innen.' }),
  sp({ id: 'flockenblume', sci: 'Centaurea jacea', de: 'Wiesen-Flockenblume', family: 'Korbblütler', habitats: ['wiese'], type: 'distel', rl: '*', bestand: 'h', color: '#b05bc0', description: 'Ihre Randblüten sind vergrößert und locken Insekten an, ohne selbst Samen zu bilden.' }),
  sp({ id: 'kornblume', sci: 'Centaurea cyanus', de: 'Kornblume', family: 'Korbblütler', habitats: ['acker'], type: 'distel', rl: '*', bestand: 'h', color: '#3a6fe0', description: 'War fast aus den Feldern verschwunden und kehrt mit Blühstreifen zurück.' }),
  sp({ id: 'ackerrittersporn', sci: 'Consolida regalis', de: 'Acker-Rittersporn', family: 'Hahnenfußgewächse', habitats: ['acker'], type: 'kraut', rl: '3', bestand: 's', color: '#4a3fc0', synonyms: ['Delphinium consolida'], description: 'Seltenes Ackerwildkraut mit gespornten Blüten. Braucht Felder ohne Herbizide.' }),
  sp({ id: 'johanniskraut', sci: 'Hypericum perforatum', de: 'Echtes Johanniskraut', family: 'Johanniskrautgewächse', habitats: ['wiese', 'acker'], type: 'kraut', rl: '*', bestand: 'h', color: '#f5c400', description: 'Hält man ein Blatt gegen das Licht, sieht man winzige „Löcher“: durchscheinende Öldrüsen.' }),
  sp({ id: 'zittergras', sci: 'Briza media', de: 'Mittleres Zittergras', family: 'Süßgräser', habitats: ['wiese'], type: 'gras', rl: '*', bestand: 'mh', color: '#a88a55', needs: { nutrients: 1 }, description: 'Die herzförmigen Ährchen zittern beim leisesten Windhauch. Zeigt magere Wiesen an.' }),
  sp({ id: 'katzenpfoetchen', sci: 'Antennaria dioica', de: 'Gewöhnliches Katzenpfötchen', family: 'Korbblütler', habitats: ['heide', 'wiese'], type: 'kraut', rl: '3', bestand: 's', color: '#f2b6c6', needs: { nutrients: 1 }, description: 'Die filzigen Blütenköpfchen fühlen sich an wie Katzenpfoten.' }),
  sp({ id: 'alpenrose', sci: 'Rhododendron ferrugineum', de: 'Rostblättrige Alpenrose', family: 'Heidekrautgewächse', habitats: ['gebirge'], type: 'zwergstrauch', rl: '*', bestand: 's', color: '#d63b6a', description: 'Die Blattunterseiten sind rostbraun. Wächst oberhalb der Waldgrenze.' }),
  sp({ id: 'silberwurz', sci: 'Dryas octopetala', de: 'Weiße Silberwurz', family: 'Rosengewächse', habitats: ['gebirge'], type: 'zwergstrauch', rl: '*', bestand: 's', color: '#ffffff', description: 'Eiszeitrelikt mit acht Blütenblättern. Eine ganze Klimaepoche, die „Dryaszeit“, ist nach ihr benannt.' }),
  sp({ id: 'zwergbirke', sci: 'Betula nana', de: 'Zwerg-Birke', family: 'Birkengewächse', habitats: ['moor', 'gebirge'], type: 'zwergstrauch', rl: '2', bestand: 'es', color: '#7a8a3a', description: 'Ein Baum, der selten höher als kniehoch wird. Überbleibsel aus der Eiszeit in wenigen Hochmooren.' }),
  sp({ id: 'herzblatt', sci: 'Parnassia palustris', de: 'Sumpf-Herzblatt', family: 'Spindelbaumgewächse', habitats: ['moor', 'wiese'], type: 'kraut', rl: '3', bestand: 's', color: '#ffffff', description: 'Glänzende Scheinnektarien locken Fliegen an, die nur glitzernde Tropfen vorfinden.' }),
  sp({ id: 'adonisroeschen', sci: 'Adonis vernalis', de: 'Frühlings-Adonisröschen', family: 'Hahnenfußgewächse', habitats: ['wiese'], type: 'kraut', rl: '3', bestand: 'ss', color: '#f6d000', needs: { water: 1, nutrients: 1 }, description: 'Steppenpflanze mit großen gelben Sternblüten. Wächst nur auf trockenen, warmen Hängen.' }),
  sp({ id: 'wasserfeder', sci: 'Hottonia palustris', de: 'Wasserfeder', family: 'Primelgewächse', habitats: ['gewaesser'], type: 'wasserpflanze', rl: '3', bestand: 's', color: '#f4e8f2', description: 'Die gefiederten Blätter bleiben unter Wasser, nur der Blütenstand ragt heraus.' }),
  sp({ id: 'knabenkraut', sci: 'Dactylorhiza majalis', de: 'Breitblättriges Knabenkraut', family: 'Orchideen', habitats: ['wiese', 'moor'], type: 'orchidee', rl: '3', bestand: 's', color: '#c04fa0', needs: { water: 3, nutrients: 1 }, description: 'Orchidee der Feuchtwiesen mit gefleckten Blättern. Verschwindet, wenn Wiesen entwässert werden.' }),
  sp({ id: 'bienenragwurz', sci: 'Ophrys apifera', de: 'Bienen-Ragwurz', family: 'Orchideen', habitats: ['wiese'], type: 'orchidee', rl: '*', bestand: 's', color: '#c78fb0', needs: { nutrients: 1 }, description: 'Ahmt eine Biene nach, bestäubt sich in Mitteleuropa aber meistens selbst.' }),
];
