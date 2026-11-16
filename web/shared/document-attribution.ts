import type {ChatSource} from './api-types';

export const DOCUMENT_REVIEW_NOTICE = 'Material generat cu asistență AI. Verifică enunțurile, soluțiile, adecvarea la clasă și sursele înainte de a-l folosi sau distribui.';
const NO_SOURCES = 'Pentru acest document nu sunt consemnate surse verificabile.';

function sourceUrl(source: ChatSource): string {
  if (source.kind === 'document' || source.shared) return '';
  try {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    for (const key of [...url.searchParams.keys()]) {
      if (/token|signature|credential|password|authorization|api[_-]?key/i.test(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch { return ''; }
}

export function documentCredits(sources: readonly ChatSource[] = []): string[] {
  return sources.filter(source=>source&&Number.isSafeInteger(source.id)).map(source => {
    const label = source.shared ? 'Material partajat de un profesor ProfPlus'
      : source.kind === 'document' ? 'Document propriu încărcat în ProfPlus'
      : [source.title || 'Sursă externă',source.author && 'autor: '+source.author,source.publisher && 'editor: '+source.publisher,
        source.page && 'pagina '+source.page,source.license && 'licență: '+source.license].filter(Boolean).join(' · ');
    const url = sourceUrl(source);
    return '['+source.id+'] '+label.replace(/[\r\n\t]/g,' ')+(url?'\n'+url:'');
  });
}

export function documentAttribution(sources: readonly ChatSource[] = []): string {
  const credits = documentCredits(sources);
  return '## Surse și verificare\n\n'+DOCUMENT_REVIEW_NOTICE+'\n\n'+(credits.length?'Consultă condițiile de licență la sursă înainte de redistribuire.\n\n'+credits.join('\n\n'):NO_SOURCES);
}
