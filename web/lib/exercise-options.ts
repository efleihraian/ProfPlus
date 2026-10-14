import type {Evidence} from './rag';
export type ExerciseCounts={original:number;copied:number;numbers:number};
export type SubpointRule={exercise:number;count:number};
export type ExerciseOptions={total?:number;counts?:ExerciseCounts;subpoints?:SubpointRule[];details?:string};
export type ExerciseOrigin={kind:keyof ExerciseCounts|'adapted';sourceId:number|null;sourceText:string;exerciseText:string;subpoints:number};
export const exerciseLabels={original:'Originale ProfPlus',copied:'Preluate exact din surse',numbers:'Din surse, cu numere schimbate'} as const;
export function resizeExerciseCounts(counts:ExerciseCounts,total:number):ExerciseCounts{
 const keys=Object.keys(exerciseLabels) as (keyof ExerciseCounts)[],sum=keys.reduce((n,k)=>n+(Number.isFinite(counts[k])&&counts[k]>0?counts[k]:0),0);
 const shares=keys.map(k=>({k,value:total*(sum?Math.max(0,Number.isFinite(counts[k])?counts[k]:0)/sum:1/3)}));
 const result={original:0,copied:0,numbers:0};for(const s of shares)result[s.k]=Math.floor(s.value);
 const remaining=total-Object.values(result).reduce((a,b)=>a+b,0);shares.sort((a,b)=>(b.value%1)-(a.value%1));
 for(let i=0;i<remaining;i++)result[shares[i].k]++;return result;
}
export function validExerciseOptions(value:unknown):value is ExerciseOptions{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;const o=value as ExerciseOptions;
 if(Object.keys(o).some(k=>!['total','counts','subpoints','details'].includes(k))||(o.details!==undefined&&(typeof o.details!=='string'||o.details.length>800)))return false;
 if(o.total!==undefined&&(!Number.isInteger(o.total)||o.total<1||o.total>30))return false;
 let total=o.total;
 if(o.counts!==undefined){
  if(!o.counts||typeof o.counts!=='object'||Array.isArray(o.counts)||Object.keys(o.counts).length!==3)return false;
  if(!Object.keys(exerciseLabels).every(k=>Number.isInteger(o.counts![k as keyof ExerciseCounts])&&o.counts![k as keyof ExerciseCounts]>=0&&o.counts![k as keyof ExerciseCounts]<=30))return false;
  const sum=Object.values(o.counts).reduce((a,b)=>a+b,0);if(sum<1||sum>30||(total!==undefined&&total!==sum))return false;total=sum;
 }
 if(o.subpoints!==undefined){
  if(!total||!Array.isArray(o.subpoints)||o.subpoints.length>total||new Set(o.subpoints.map(r=>r?.exercise)).size!==o.subpoints.length)return false;
  if(!o.subpoints.every(r=>r&&typeof r==='object'&&Object.keys(r).length===2&&Number.isInteger(r.exercise)&&r.exercise>=1&&r.exercise<=total!&&Number.isInteger(r.count)&&r.count>=1&&r.count<=10))return false;
 }
 return !!total||!!o.details?.trim();
}
export function exerciseInstructions(o:ExerciseOptions|undefined):string{
 if(!o)return '';const total=o.total||(o.counts?Object.values(o.counts).reduce((a,b)=>a+b,0):undefined);
 return '\nCERINȚELE PROFESORULUI PENTRU EXERCIȚII: '+(o.details?JSON.stringify(o.details):'Tipul și dificultatea sunt precizate în mesaj.')+
 (total?'\nNUMĂR TOTAL OBLIGATORIU: '+total+' exerciții principale numerotate consecutiv de la 1 la '+total+', fără reluarea numerotării la fiecare secțiune. Fiecare are o singură linie Proveniență:. Subpunctele, opțiunile grilei și baremul nu sunt exerciții suplimentare. Nu adăuga bonusuri peste total. Repartizează exercițiile și punctajul în structura modelului, ajustând numărul de itemi la totalul cerut.\n':'')+
 (o.counts?'COMPOZIȚIE OBLIGATORIE: '+Object.entries(o.counts).map(([k,n])=>n+' '+exerciseLabels[k as keyof ExerciseCounts]).join('; ')+'. Total '+total+' exerciții principale. Nu înlocui preluările cu originale fără acordul profesorului.\n':'')+
 (o.subpoints!==undefined?'SUBPUNCTE OBLIGATORII: '+(o.subpoints.length?o.subpoints.map(r=>'Exercițiul '+r.exercise+': exact '+r.count+' subpuncte').join('; ')+'. Exercițiile care nu sunt enumerate NU au subpuncte.':'Niciun exercițiu nu are subpuncte.')+' Subpunctele sunt cerințe distincte pe rânduri a), b), c) etc. Opțiunile grilei se scriu A., B., C., D. și nu se numără ca subpuncte. Nu transforma două subpuncte în două exerciții principale. Pentru preluări exacte și variante numerice, alege un exercițiu-sursă care are deja numărul cerut de subpuncte; nu elimina ori adăuga cerințe și nu pretinde că ai păstrat enunțul integral.\n':'')+
 (total?'PLAN OBLIGATORIU: În exercisePlan include exact o intrare pentru fiecare exercițiu, în ordinea din document: exerciseText este enunțul complet din reply, cu toate subpunctele, fără numărul principal, punctajul adăugat ori proveniență; subpoints este numărul cerințelor a), b) etc., 0 dacă nu există. sourceText este enunțul complet textual din pasaj; sourceId este citarea reală. Pentru originale, sourceId=null și sourceText gol. Nu include baremul în plan.\nPentru preluare exactă, folosește un enunț COMPLET identificabil în pasajele curente și păstrează-l. Categoria numere schimbate păstrează integral formularea și structura, schimbând NUMAI valorile numerice; rezolvă și verifică datele noi. Schimbarea contextului/reformularea/adăugarea de subpuncte nu intră aici. Eticheta acestei categorii este «Adaptat prin schimbarea numerelor din ...». Celelalte sunt «Preluat integral din ...» și «Exercițiu original generat de ProfPlus». Citează sursa [ID] pentru ambele categorii din surse. Categoria internă adapted și eticheta «Adaptat / inspirat din ...» sunt permise numai când profesorul NU a ales numere pe categorie, pentru adaptări mai ample susținute de un exercițiu-sursă identificabil. Nu folosi rezumate web ca enunțuri complete. Respectă drepturile și limitele preluării; nu reproduce colecții întregi. Dacă nu există suficiente enunțuri complete potrivite, explică limita cu isDocument=false. Revizia păstrează totalul, compoziția și subpunctele cerute; pentru un enunț-sursă greșit alege altul, fără substituție tăcută.\n':'Aplică detaliile cererilor de teste/fișe/exerciții, fără a modifica accesul la surse sau proveniența.\n');
}
export function exerciseFormat(base:{schema:{properties:object;required:string[]};[key:string]:unknown}){
 return {...base,name:'exercise_composition',schema:{...base.schema,properties:{...base.schema.properties,exercisePlan:{type:'array',items:{type:'object',additionalProperties:false,properties:{kind:{type:'string',enum:['original','copied','numbers','adapted']},sourceId:{type:['integer','null']},sourceText:{type:'string'},exerciseText:{type:'string'},subpoints:{type:'integer'}},required:['kind','sourceId','sourceText','exerciseText','subpoints']}}},required:[...base.schema.required,'exercisePlan']}};
}
const canonical=(s:string)=>s.normalize('NFC').replace(/^\s*[-*+]\s+(?=[a-jA-D][.)]\s)/gm,'').replace(/\*\*|(?<!\\)\$/g,'').replace(/\s+/g,' ').trim();
export function verifyExercisePlan(reply:string,value:unknown,preferences:ExerciseOptions|ExerciseCounts,evidence:Evidence[]):{ok:boolean;reason?:string}{
 const o:ExerciseOptions='original'in preferences?{counts:preferences}:preferences,total=o.total||(o.counts?Object.values(o.counts).reduce((a,b)=>a+b,0):undefined);
 const fail=(reason:string)=>({ok:false,reason});
 if(!Array.isArray(value)||!value.length||value.length>30||total!==undefined&&value.length!==total)return fail('Numărul exercițiilor nu corespunde totalului ales.');
 const clean=reply.replace(/\*\*/g,'').split(/^#{1,6}\s+(?:Barem|Rezolvări|Soluții|Răspunsuri)\b/mi)[0],labels=[...clean.matchAll(/^\s*Proveniență:\s*(.+)$/gm)];
 if(labels.length!==value.length)return fail('Proveniența fiecărui exercițiu trebuie să fie explicită.');
 const actual={original:0,copied:0,numbers:0,adapted:0},seen=new Set<string>();let previous=0;
 for(let i=0;i<value.length;i++){
  const entry=value[i] as ExerciseOrigin;
  if(!entry||!Object.hasOwn(actual,entry.kind)||typeof entry.exerciseText!=='string'||typeof entry.sourceText!=='string'||entry.exerciseText.length>2400||entry.sourceText.length>2400||!Number.isInteger(entry.subpoints)||entry.subpoints<0||entry.subpoints>10)return fail('Planul exercițiilor este invalid.');
  const segment=clean.slice(previous,labels[i].index),starts=[...segment.matchAll(/^\s*(\d+)[.)]\s+/gm)];previous=labels[i].index!+labels[i][0].length;
  if(starts.length!==1||Number(starts[0][1])!==i+1)return fail('Exercițiile trebuie numerotate consecutiv și legate de propria proveniență.');
  const rawStatement=segment.slice(starts[0].index!+starts[0][0].length),letters=[...rawStatement.matchAll(/^\s*(?:[-*]\s*)?([a-j])[.)]\s+/gm)].map(m=>m[1]);
  if(letters.length!==entry.subpoints||letters.some((l,n)=>l!==String.fromCharCode(97+n)))return fail('Subpunctele nu corespund cerințelor enumerate a), b), c).');
  if(o.subpoints!==undefined&&entry.subpoints!==(o.subpoints.find(r=>r.exercise===i+1)?.count||0))return fail('Numărul subpunctelor exercițiului '+(i+1)+' nu respectă opțiunile alese.');
  const withoutScore=(v:string)=>v.replace(/\(\d+\s*(?:p\.?|puncte)\)/gi,'');
  const text=canonical(withoutScore(entry.exerciseText));
  if(text.length<8||canonical(withoutScore(rawStatement))!==text||seen.has(text))return fail('Planul nu corespunde enunțurilor distincte din document.');seen.add(text);actual[entry.kind]++;
  const label=labels[i][1];
  if(entry.kind==='original'){if(entry.sourceId!==null||entry.sourceText.trim()||!/^Exercițiu original generat de ProfPlus\b/.test(label))return fail('Un exercițiu original este etichetat greșit.');continue;}
  const source=evidence.find(e=>e.source.id===entry.sourceId&&e.source.kind!=='web'),sourceText=canonical(entry.sourceText);
  if(!source||sourceText.length<12||!canonical(source.text).includes(sourceText)||!label.includes('['+entry.sourceId+']'))return fail('Un enunț-sursă nu este susținut de pasajele selectate.');
  if(entry.kind==='copied'&&(text!==sourceText||!/^Preluat integral din\b/.test(label)))return fail('Un exercițiu cerut ca preluare exactă a fost schimbat.');
  if(entry.kind==='numbers'){
   const withoutNumbers=(v:string)=>v.replace(/\d+(?:[.,]\d+)?/g,'#');
   if(text===sourceText||!/[0-9]/.test(sourceText)||withoutNumbers(text)!==withoutNumbers(sourceText)||!/^Adaptat prin schimbarea numerelor din\b/.test(label))return fail('Un exercițiu schimbă și altceva decât numerele.');
  }
  if(entry.kind==='adapted'&&(o.counts||!/^Adaptat\s*\/\s*inspirat din\b/.test(label)))return fail('Compoziția aleasă nu permite adaptări cu alte schimbări.');
 }
 if(/^\s*\d+[.)]\s+/m.test(clean.slice(previous)))return fail('Documentul conține exerciții fără proveniență.');
 return !o.counts||(Object.keys(exerciseLabels) as (keyof ExerciseCounts)[]).every(k=>actual[k]===o.counts![k])?{ok:true}:fail('Tipurile exercițiilor nu respectă numerele alese.');
}
