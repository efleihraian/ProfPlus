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

/** A reversible student view: statements stay saved with their evidence. */
export function withoutProvenance(content:string,sourceIds:number[]=[]):string{
 const ids=new Set(sourceIds),lines=content.split('\n'),kept:string[]=[];let referenceLevel:number|null=null;
 for(const line of lines){
  const heading=/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
  if(heading&&/^(?:Referințe(?: pentru exerciții)?|Surse(?: consultate)?|Bibliografie)\s*$/i.test(heading[2])){referenceLevel=heading[1].length;continue;}
  if(referenceLevel!==null){if(!heading||heading[1].length>referenceLevel){for(const m of line.matchAll(/\[(\d+)\]/g))ids.add(Number(m[1]));continue;}referenceLevel=null;}
  if(/^\s*(?:>\s*)?(?:[-*+]\s+)?(?:\*\*|\*)?(?:Proveniență|Sursă|Referință conceptuală)(?:\*\*|\*)?\s*:/i.test(line)){for(const m of line.matchAll(/\[(\d+)\]/g))ids.add(Number(m[1]));continue;}
  kept.push(line.replace(/\s*\((?:Proveniență|Sursă):[^)\n]*\)/gi,''));
 }
 // Preserve bracketed values inside formulas/code and remove only known citation IDs.
 return kept.join('\n').split(/(```[\s\S]*?```|`[^`\n]+`|\$\$[\s\S]*?\$\$|\$[^\n$]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g).map((part,i)=>i%2?part:part.replace(/\[(\d+)\](?:\([^\n)]*\))?/g,(marker,id)=>ids.has(Number(id))?'':marker)).join('').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
