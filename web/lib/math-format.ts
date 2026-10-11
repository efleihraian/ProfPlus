/** Repair legacy model delimiters before Markdown can consume the backslashes. */
export function normalizeMath(content:string):string{
 return content.split(/(```[\s\S]*?```|`[^`\n]+`)/g).map((part,i)=>i%2?part:part
  .replace(/\\\[([\s\S]*?)\\\]/g,(_,tex)=>'\n$$\n'+tex.trim()+'\n$$\n')
  .replace(/\\\(([\s\S]*?)\\\)/g,(_,tex)=>'$'+tex.trim()+'$')
  .split('\n').map(line=>{
   if(line.includes('$'))return line;
   const match=/^(\s*(?:[-*+]\s*)?(?:[a-z]\)\s*)?)\(\s*(.*)\s*\)\s*$/.exec(line);
   return match&&/(\\(?:cdot|frac|sqrt|times|div|leq|geq)|[\^_])/.test(match[2])?match[1]+'$'+match[2].trim()+'$':line;
  }).join('\n').replace(/\n(?=(?:\*\*)?(?:Proveniență|Sursă|Referință conceptuală)(?:\*\*)?:)/g,'\n\n')).join('');
}
export type MathPart={text:string;math?:boolean;display?:boolean};
export function mathParts(content:string):MathPart[]{
 const normalized=normalizeMath(content),pattern=/(?<!\\)(\$\$)([\s\S]*?)\$\$|(?<![\\$])\$([^\n$]+)\$/g,result:MathPart[]=[];let end=0;
 for(const match of normalized.matchAll(pattern)){
  if(match.index!>end)result.push({text:normalized.slice(end,match.index)});
  result.push({text:(match[2]??match[3]).trim(),math:true,display:!!match[1]});end=match.index!+match[0].length;
 }
 if(end<normalized.length)result.push({text:normalized.slice(end)});return result;
}
