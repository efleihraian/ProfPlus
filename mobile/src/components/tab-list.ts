// Filele de jos, comune variantei native (app-tabs.tsx) și celei pentru browser (app-tabs.web.tsx).
// Separat într-un fișier fără extensie de platformă: în browser, „@/components/app-tabs” se rezolvă chiar la
// app-tabs.web.tsx, deci importul circular lăsa TABS nedefinit și previzualizarea web cădea (P-169).
export const TABS = [
  { name: 'index', label: 'Acasă', sf: 'house', md: 'home' },
  { name: 'asistent', label: 'Asistent', sf: 'bubble.left.and.bubble.right', md: 'forum' },
  { name: 'documente', label: 'Documente', sf: 'folder', md: 'folder' },
  { name: 'clase', label: 'Clase', sf: 'graduationcap', md: 'school' },
  { name: 'cont', label: 'Cont', sf: 'person.crop.circle', md: 'account_circle' },
] as const;
