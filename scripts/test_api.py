"""Send one small, fixed connectivity request; never print credentials."""
import json
import os
from pathlib import Path
import sys
import ssl
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def load_config():
    values = {}
    path = Path(__file__).resolve().parents[1] / '.env'
    if path.exists():
        for line in path.read_text().splitlines():
            if line.strip() and not line.lstrip().startswith('#') and '=' in line:
                name, value = line.split('=', 1)
                values[name.strip()] = value.strip()
    return {name: os.environ.get(name, values.get(name, ''))
            for name in ('OPENAI_API_KEY', 'OPENAI_MODEL')}


def main():
    config = load_config()
    if not config['OPENAI_API_KEY']:
        sys.exit('Cheia lipsește. Rulează mai întâi scripts/setup_api.py în Terminal.')
    payload = {'model': config['OPENAI_MODEL'] or 'gpt-4.1-mini',
               'input': 'Răspunde exact: Conexiunea ProfPlus funcționează.',
               'max_output_tokens': 64, 'store': False}
    request = Request('https://api.openai.com/v1/responses',
                      data=json.dumps(payload).encode(),
                      headers={'Authorization': 'Bearer ' + config['OPENAI_API_KEY'],
                               'Content-Type': 'application/json'})
    context = ssl.create_default_context()
    # Some python.org macOS installs have no default certificate bundle.
    system_ca = Path('/etc/ssl/cert.pem')
    if sys.platform == 'darwin' and not ssl.get_default_verify_paths().cafile and system_ca.is_file():
        context.load_verify_locations(cafile=str(system_ca))
    try:
        with urlopen(request, timeout=30, context=context) as response:
            result = json.load(response)
    except HTTPError as error:
        messages = {401: 'Cheie invalidă sau revocată.',
                    403: 'Acces refuzat. Verifică permisiunile proiectului.',
                    404: 'Model indisponibil. Verifică OPENAI_MODEL.',
                    429: 'Cotă sau limită depășită. Verifică billing și limitele.'}
        sys.exit(f'HTTP {error.code}: ' + messages.get(error.code, 'Apelul API a eșuat.'))
    except (URLError, TimeoutError):
        sys.exit('Conexiunea a eșuat sau a expirat. Verifică rețeaua și reîncearcă.')
    except (ValueError, UnicodeError):
        sys.exit('Răspunsul API nu a putut fi citit.')
    text = '\n'.join(part.get('text', '') for item in result.get('output', [])
                     if item.get('type') == 'message'
                     for part in item.get('content', [])
                     if part.get('type') == 'output_text')
    if result.get('status') != 'completed' or not text:
        sys.exit('API-ul a răspuns, dar generarea nu s-a finalizat cu text.')
    print(text)
    print('Model:', payload['model'])
    print('Consum:', json.dumps(result.get('usage', {})))


if __name__ == '__main__':
    main()
