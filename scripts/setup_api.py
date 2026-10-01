"""Save an API key locally without echoing it or putting it in shell history."""
import getpass
import os
from pathlib import Path
import sys


def main():
    target = Path(__file__).resolve().parents[1] / '.env'
    if target.exists():
        sys.exit('Configurarea .env există deja. Nu a fost modificată.')
    if not sys.stdin.isatty():
        sys.exit('Rulează acest program într-un Terminal interactiv.')
    key = getpass.getpass('Lipește cheia OpenAI (nu se va afișa), apoi Enter: ').strip()
    if not key.startswith('sk-') or any(c.isspace() for c in key):
        sys.exit('Cheia nu are formatul așteptat. Nu s-a salvat nimic.')
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as handle:
        handle.write(f'OPENAI_API_KEY={key}\nOPENAI_MODEL=gpt-4.1-mini\n')
    print('Cheia a fost salvată local în .env, exclus din GitHub. Niciun apel API efectuat.')


if __name__ == '__main__':
    main()
