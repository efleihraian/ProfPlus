/** Only attribution notes change; the saved document and exercise statements stay intact. */
export function sourceOnlyProvenance(content:string):string {
 return content.split('\n').map(line=>{
  const match=/^\s*(?:[-*+]\s+)?(?:\*\*|\*)?(?:Proveniență|Sursă)(?:\*\*|\*)?\s*:\s*(?:\*\*|\*)?\s*(.*?)\s*$/i.exec(line);
  if(!match)return line;
  let source=match[1].replace(/\*+$/,'').trim();
  if(/^(?:Exercițiu\s+)?original(?:\s+generat)?(?:\s+de\s+ProfPlus)?[.\s]*$/i.test(source))return '';
  source=source.replace(/^(?:Preluat integral|Copiat(?: integral)?|Adaptat\s*\/\s*inspirat|Adaptat|Inspirat)(?:\s*\([^)]*\))?\s+din\s+/i,'');
  source=source.replace(/\s*\((?:100\s*%|preluat integral|adaptat|inspirat)\)\s*/gi,' ');
  source=source.replace(/[,;]\s*(?:(?:pagina(?: PDF| tipărită)?|numărul exercițiului|exercițiul|anul|ediția|etapa)\s+)?neprecizat[ăe]? în sursa disponibilă/gi,'');
  return source?`Sursă: ${source.trim()}`:'';
 }).join('\n').replace(/\n{3,}/g,'\n\n');
}
