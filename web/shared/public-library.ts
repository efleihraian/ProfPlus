export const PUBLIC_LIBRARY_TYPES = [
  {id:'manual',label:'Manuale școlare'},
  {id:'evaluare',label:'Evaluare Națională'},
  {id:'bac',label:'Bacalaureat'},
  {id:'concurs',label:'Olimpiade și concursuri'},
  {id:'resursa',label:'Fișe și resurse didactice'},
  {id:'prescolar',label:'Educație timpurie'},
  {id:'site',label:'Site-uri educaționale'},
] as const;
export type PublicLibraryType = (typeof PUBLIC_LIBRARY_TYPES)[number]['id'];
export const PUBLIC_LIBRARY_GRADES = ['Pregătitoare','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII'] as const;
export const PUBLIC_LIBRARY_QUERY_LIMIT = 120;

export type PublicLibraryItem = {
  id:string; title:string; kind:PublicLibraryType; url:string; publisher:string;
  subject?:string; grade?:string; description?:string;
};
export type LibrarySearch = {q?:string; type?:string; grade?:string; page?:string};
/** `counts`: numărul de materiale pe tip din tot catalogul (P-307), pentru filtrele pe tip. */
export type PublicLibraryResults = {items:PublicLibraryItem[]; total:number; page:number; pages:number; counts?:Record<PublicLibraryType,number>};

export function librarySearchParams(filters:LibrarySearch):URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ['q','type','grade','page'] as const) {
    const value = filters[key];
    if (value) params.set(key,value);
  }
  return params;
}

const number = new Intl.NumberFormat('ro-RO');
/** „1.529 de manuale”, dar „14 materiale” și „2.108 materiale” (ultimele două cifre între 01 și 19). */
export const formatCount = (n:number,one:string,many:string) => n===1?'1 '+one:number.format(n)+(n>0&&(n%100===0||n%100>=20)?' de ':' ')+many;
export const formatNumber = (n:number) => number.format(n);
/** Numele scurt al sitului sursă, arătat lângă link. */
export function sourceHost(url:string){try{return new URL(url).hostname.replace(/^www\./,'');}catch{return '';}}
/** Eticheta tipului pe card (un singur material). */
export const itemTypeLabel=(kind:PublicLibraryType)=>kind==='manual'?'Manual':kind==='site'?'Site educațional':PUBLIC_LIBRARY_TYPES.find(type=>type.id===kind)?.label;
/** Ce se întâmplă la deschidere: PDF, arhivă descărcată, site sau pagina sursei. */
export function openLabel(url:string,kind?:PublicLibraryType){
  if(kind==='site')return 'Deschide site-ul';
  if(/\.pdf(?:$|[?#])/i.test(url))return 'Deschide PDF';
  if(/\.(?:zip|rar|7z)(?:$|[?#&])|[?&]file=[^&]+\.(?:zip|rar|7z)/i.test(url))return 'Descarcă arhiva';
  return 'Deschide sursa';
}
