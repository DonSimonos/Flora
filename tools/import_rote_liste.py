"""Übernimmt die Rote Liste der Farn- und Blütenpflanzen Deutschlands (Metzing et al. 2018)
in die App (src/data/rote-liste-2018.json).

Lizenz der Daten: CC BY-ND 4.0 – die Werte werden NICHT verändert, nur ausgewählte Spalten
(Name, deutscher Name, RL-Kategorie, aktuelle Bestandssituation, Endemit) unverändert übernommen.

Aufruf (Datei vom Rote-Liste-Zentrum, Download Pflanzen, entpackt):
    pip install openpyxl
    python3 tools/import_rote_liste.py 02_Datentabelle_RL_Farn-_und_Bluetenpflanzen_2018_Deutschland_*.xlsx
"""
import json
import pathlib
import sys

import openpyxl

# Arten, Kleinarten und Artengruppen; keine Unterarten, Varietäten oder Verweise.
KEEP = {'S', 'M', 'K', 'T', 'A', 'O'}
RANKS = {'subsp.', 'var.', 'f.'}
GROUPS = {'sect.', 'subsect.', 'ser.', 'subgen.'}


def plain_name(full: str) -> str:
    """Wissenschaftlicher Name ohne Autor, z. B. 'Drosera rotundifolia L.' -> 'Drosera rotundifolia'."""
    t = full.split()
    out = [t[0]]
    i = 1
    if i < len(t) and t[i] == '×':
        out.append(t[i]); i += 1
    if i < len(t) and t[i] in GROUPS:
        out += t[i:i + 2]; i += 2
    elif i < len(t):
        out.append(t[i]); i += 1
    if i < len(t) and t[i] == 'agg.':
        out.append('agg.'); i += 1
    if i + 1 < len(t) and t[i] in RANKS:
        out += t[i:i + 2]
    return ' '.join(out)


def main(path: str) -> None:
    wb = openpyxl.load_workbook(path, read_only=True)
    rows = list(wb.worksheets[0].iter_rows(values_only=True))
    ix = {name: i for i, name in enumerate(rows[0])}
    out = []
    for r in rows[1:]:
        if (r[ix['Auswertung']] or '') not in KEEP:
            continue
        entry = {
            'n': plain_name(r[ix['Name']]),
            'd': r[ix['Deutscher Name']] or '',
            'k': r[ix['RL Kat.']] or '',
            'b': r[ix['aktuelle Bestandssituation']] or '',
        }
        if (r[ix['Endemit']] or '') == 'E':
            entry['e'] = 1
        out.append(entry)
    target = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'data' / 'rote-liste-2018.json'
    target.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'{len(out)} Einträge nach {target} geschrieben')


if __name__ == '__main__':
    main(sys.argv[1])
