"""One PDF per isolated process. Stdout contains counts, never textbook text."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import os

import pymupdf


def extract(options):
    row = options['row']
    pdf = Path(options['pdf'])
    target = Path(options['output'])
    sections, readable = [], 0
    with pymupdf.open(pdf) as document:
        pages = len(document)
        for page_no, page in enumerate(document, 1):
            text = '' if options.get('force_ocr') else page.get_text(sort=True).strip()
            if len(text) < 60 and options.get('ocr'):
                image = page.get_pixmap(dpi=160).tobytes('png')
                result = subprocess.run([shutil.which('tesseract') or '/opt/homebrew/bin/tesseract', 'stdin', 'stdout', '--tessdata-dir', options['tessdata'], '-l', options['languages']], input=image, capture_output=True, timeout=90, env={**os.environ, 'OMP_THREAD_LIMIT': '1'})
                if result.returncode:
                    raise RuntimeError('OCR_FAILED')
                text = result.stdout.decode('utf8').strip()
            if len(text) < 60:
                continue
            readable += 1
            words, block, length = text.split(), [], 0
            for word in words:
                block.append(word)
                length += len(word) + 1
                if length >= 900:
                    sections.append(f'[[PAGE:{page_no}]]\n' + ' '.join(block))
                    block, length = [], 0
            if block:
                sections.append(f'[[PAGE:{page_no}]]\n' + ' '.join(block))
    if readable >= max(1, pages * options['min_coverage']):
        temporary = target.with_suffix('.tmp')
        temporary.write_text(f'Manual: {row["title"]}\nClasă: {row["class"]}\nDisciplina: {row["subject"]}\nEditura: {row["publisher"]}\nSursa: {row["pdf_url"]}\nPagini indicate: poziția în fișierul PDF, nu numerotarea tipărită.\n\n' + '\n\n'.join(sections))
        temporary.replace(target)
    return {'pages': pages, 'readable_pages': readable}


if __name__ == '__main__':
    try:
        print(json.dumps(extract(json.loads(sys.stdin.read()))))
    except Exception as error:
        print(json.dumps({'error': str(error) if isinstance(error, RuntimeError) and str(error) == 'OCR_FAILED' else type(error).__name__}))
        raise SystemExit(1)
