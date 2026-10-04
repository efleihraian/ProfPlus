# ProfPlus web

Site de chat în română, cu API server-side OpenAI.

## Local

Node.js >=22.13. Instalează cu npm ci și pornește cu npm run dev. Configurarea secretă se păstrează în .dev.vars, exclus din Git.

## Verificări

npx tsc --noEmit verifică tipurile. npm run build generează Worker-ul pentru Sites.

## API

POST /api/chat primește messages și întoarce reply sau error. Contractul complet este în ../docs/CHAT_API.md. Cheia nu este disponibilă interfeței. Conversația se păstrează doar în memoria paginii.

Site-ul rămâne privat. RAG, istoric persistent și aplicații mobile: etape viitoare.
