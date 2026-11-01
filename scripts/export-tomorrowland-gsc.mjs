import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const workbook = 'travel4life.net-Performance-on-Search-2026-11-01.xlsx';
const outputDir = 'docs/seo/tomorrowland-growth-program';
fs.mkdirSync(outputDir, { recursive: true });

const python = String.raw`import csv, openpyxl
from pathlib import Path
p='travel4life.net-Performance-on-Search-2026-11-01.xlsx'
out=Path('docs/seo/tomorrowland-growth-program')
w=openpyxl.load_workbook(p, data_only=True)
def write(name, rows):
    with (out/name).open('w', newline='', encoding='utf-8') as f:
        csv.writer(f).writerows(rows)
for sheet, file in [('Queries','gsc-queries.csv'), ('Pages','gsc-pages.csv'), ('Countries','gsc-countries.csv'), ('Devices','gsc-devices.csv')]:
    write(file, list(w[sheet].iter_rows(values_only=True)))`;

execFileSync('.venv/Scripts/python.exe', ['-c', python], { stdio: 'inherit', windowsHide: true });
