# ProfPlus — aplicația mobilă

Aplicația Android și iOS pentru ProfPlus, făcută cu Expo și React Native. Folosește același cont și același server ca site-ul profplus.ro.

Codul se adaugă în etape. Aplicația completă poate fi pornită după ultima etapă.

## Pornire

1. Instalează pachetele:

   ```bash
   npm install
   ```

2. Copiază `.env.example` în `.env.local` și completează valorile.

3. Pornește aplicația:

   ```bash
   npx expo start
   ```

## Structură

- `src/app`: ecranele aplicației
- `src/components`: componentele reutilizabile
- `src/constants`: tema
- `src/hooks`: funcții comune pentru ecrane
- `src/lib`: contul (Supabase), legătura cu serverul ProfPlus, jurnalul de erori și tema
- `../web/shared`: cod comun cu site-ul
