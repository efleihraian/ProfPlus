# CLAUDE.md — ProfPlus

Acest fișier doar trimite la regulile existente; nu le înlocuiește. Sursa de adevăr este [AGENTS.md](AGENTS.md), comună pentru Claude și Codex.

## Înainte de orice sarcină

1. [AGENTS.md](AGENTS.md), [README.md](README.md), [STATUS.md](STATUS.md), [BACKLOG.md](BACKLOG.md), [CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md), [docs/WORKLOG.md](docs/WORKLOG.md).
2. [docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md), [docs/SECURITY_REQUIREMENTS.md](docs/SECURITY_REQUIREMENTS.md), [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md), [docs/DPIA.md](docs/DPIA.md).
3. Documentația funcției atinse (de ex. [docs/MANUAL_IMPORT.md](docs/MANUAL_IMPORT.md), [docs/LIBRARY.md](docs/LIBRARY.md), [docs/HYBRID_CHAT.md](docs/HYBRID_CHAT.md), [docs/DECISIONS.md](docs/DECISIONS.md)).

## Reguli scurte de colaborare

- Lucrul alternează cu Codex în același folder; pentru lucru simultan folosește branch/worktree separat. Un worktree nu are `web/.dev.vars`, `.venv` sau `data/rag/`.
- Nu implementa nimic fără o sarcină explicită; folosește un ID din BACKLOG.md și actualizează STATUS, BACKLOG, CHANGELOG, WORKLOG (și DECISIONS/DPIA/SECURITY_REVIEW când e cazul).
- Comite numai fișierele sarcinii; păstrează modificările necomise ale altora. Fără `reset --hard`, `clean`, force-push, merge, publicare sau redeploy necerute.
- Secretele rămân numai pe server, în fișiere ignorate; verifică existența lor fără a afișa valori. Rulează scannerul din CONTRIBUTING.md înainte de commit.
- Importul manualelor: nu opri, nu duplica și nu porni alt importer pentru verificare; citește doar starea (`data/rag/progress.json`, `run.json`) și procesele existente. Nu afișa texte extrase sau identificatori de furnizor. Fără scheduled tasks.
- `sources/` din proiectul ChatGPT (în afara acestui repository) este read-only.
- Nu declara teste, conformitate GDPR/DPIA sau audituri neexecutate.
