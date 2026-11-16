"""Ökologische Zeigerwerte (EIVE 1.0) für die Arten der Roten Liste Deutschlands.

Quelle: Dengler, J., Jansen, F., Chusova, O. et al. (2023): Ecological Indicator Values for Europe
(EIVE) 1.0. Vegetation Classification and Survey 4: 7–29. https://doi.org/10.3897/VCS.98324
Supplementary material 8 (https://binary.pensoft.net/file/795359). Lizenz CC BY 4.0.

EIVE sind europäische, Ellenberg-artige Zeigerwerte auf einer Skala von 0 bis 10:
M Feuchte, N Nährstoffe (Stickstoff), R Bodenreaktion, L Licht, T Temperatur;
zu jedem Wert die Nischenbreite nw3 (wie tolerant die Art ist).

Supplementary material 2 (https://binary.pensoft.net/file/795353, ebenfalls CC BY 4.0) ordnet die
Namen der 31 Quellsysteme den EIVE-Namen zu und enthält die Originalwerte – darunter die
Ellenberg-Zeigerwerte für Deutschland (Quelle „Germany“: Ellenberg et al. 2001).

Für jede Art der Roten Liste (Metzing et al. 2018) wird der passende EIVE-Eintrag gesucht:
gleicher Name, Synonyme aus der Roten Liste, Namenszuordnung aus Supplement 2, dann Artengruppe/Art.
Alle Werte werden unverändert übernommen (nur auf eine Nachkommastelle gerundet).

Aufruf:
    pip install openpyxl
    python3 tools/import_eive.py <EIVE-Suppl-8.xlsx> <EIVE-Suppl-2.xlsx> <Rote-Liste-Datentabelle.xlsx>
Ergebnis: src/data/eive-1.0.json
    {"Drosera rotundifolia": {"e": [M, N, R, L, T, Mb, Nb, Rb, Lb, Tb], "g": [F, N, R, L, T]}, ...}
    e = EIVE-Lage und -Nischenbreite (0–10), g = Ellenberg Deutschland (F 1–12, sonst 1–9, "x" = indifferent)
"""
import json
import pathlib
import sys

import openpyxl

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from import_rote_liste import KEEP, plain_name  # noqa: E402

DIMS = ['M', 'N', 'R', 'L', 'T']


def norm(name: str) -> str:
    n = ' '.join(name.replace('aggr.', 'agg.').split()).lower()
    return n.replace(' s. l.', '').replace(' s.l.', '')


def load_eive(path):
    rows = list(openpyxl.load_workbook(path, read_only=True)['mainTable'].iter_rows(values_only=True))
    h = rows[0]
    pos = [h.index(f'EIVEres-{d}') for d in DIMS]
    wid = [h.index(f'EIVEres-{d}.nw3') for d in DIMS]
    out = {}
    for r in rows[1:]:
        vals = [r[i] for i in pos] + [r[i] for i in wid]
        out[norm(r[0])] = [round(v, 1) if isinstance(v, (int, float)) else None for v in vals]
    return out


def load_names_and_ellenberg(path):
    """Name map (all source systems) -> EIVE concept, and the original German Ellenberg values."""
    rows = openpyxl.load_workbook(path, read_only=True)['longTable'].iter_rows(values_only=True)
    h = next(rows)
    ix = {n: i for i, n in enumerate(h)}
    names, ellenberg = {}, {}
    for r in rows:
        concept = norm(r[ix['TaxonConcept']] or '')
        if not concept:
            continue
        for col in ('OriginalNameHarmonised', 'OriginalName'):
            if r[ix[col]]:
                names.setdefault(norm(plain_name(r[ix[col]])), concept)
        if r[ix['Source']] == 'Germany':
            vals = []
            for d in DIMS:
                v = r[ix[f'{d}.o']]
                try:
                    vals.append(round(float(v), 1) if v not in (None, '', 'x', 'X', '?') else (str(v).lower() if v else None))
                except ValueError:
                    vals.append(str(v))
            ellenberg[concept] = vals
    return names, ellenberg


def main(eive_path, suppl2_path, rl_path):
    eive = load_eive(eive_path)
    names, ellenberg = load_names_and_ellenberg(suppl2_path)
    rows = list(openpyxl.load_workbook(rl_path, read_only=True).worksheets[0].iter_rows(values_only=True))
    ix = {n: i for i, n in enumerate(rows[0])}
    result, how = {}, {'Name': 0, 'Synonym': 0, 'Namenstabelle': 0, 'Art/Gruppe': 0, 'fehlt': 0}
    for r in rows[1:]:
        if (r[ix['Auswertung']] or '') not in KEEP:
            continue
        name = plain_name(r[ix['Name']])
        tries = [('Name', norm(name))]
        for syn in (r[ix['Synonyme']] or '').split(';'):
            if syn.strip():
                tries.append(('Synonym', norm(plain_name(syn.strip()))))
        tries += [('Namenstabelle', names[k]) for _, k in list(tries) if k in names]
        bare = norm(name).replace(' agg.', '')
        tries += [('Art/Gruppe', bare), ('Art/Gruppe', bare + ' agg.')]
        for kind, key in tries:
            if key in eive:
                entry = {'e': eive[key]}
                if key in ellenberg:
                    entry['g'] = ellenberg[key]
                result[name] = entry
                how[kind] += 1
                break
        else:
            how['fehlt'] += 1
    target = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'data' / 'eive-1.0.json'
    target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    with_g = sum(1 for v in result.values() if 'g' in v)
    print(f'{len(result)} Arten mit EIVE-Werten ({with_g} auch mit Ellenberg Deutschland) nach {target}; Zuordnung: {how}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
