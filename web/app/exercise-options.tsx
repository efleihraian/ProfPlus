"use client";
import {useEffect,useRef,useState} from 'react';
import {Plus,X} from 'lucide-react';
import {exerciseLabels,resizeExerciseCounts,validExerciseOptions,type ExerciseCounts,type ExerciseOptions,type SubpointRule} from '../lib/exercise-options';
export default function ExerciseOptionsDialog({value,disabled,onApply,onClose}:{value?:ExerciseOptions;disabled:boolean;onApply:(value:ExerciseOptions|undefined)=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [enabled,setEnabled]=useState(value?.counts!==undefined||!value);
 const [counts,setCounts]=useState<Record<keyof ExerciseCounts,string>>(()=>{const c=value?.counts||{original:3,copied:4,numbers:3};return {original:String(c.original),copied:String(c.copied),numbers:String(c.numbers)};});
 const [total,setTotal]=useState(value?.total!==undefined?String(value.total):value?.counts?String(Object.values(value.counts).reduce((a,b)=>a+b,0)):value?'':'10');
 const [details,setDetails]=useState(value?.details||''),[specific,setSpecific]=useState(value?.subpoints!==undefined),[subpoints,setSubpoints]=useState<SubpointRule[]>(value?.subpoints||[]);
 useEffect(()=>{dialog.current?.showModal();},[]);
 const parsed={original:Number(counts.original),copied:Number(counts.copied),numbers:Number(counts.numbers)},totalNumber=Number(total),totalValid=/^\d+$/.test(total)&&totalNumber>=1&&totalNumber<=30;
 const options:ExerciseOptions={...(total?{total:totalNumber}:{}),...(enabled?{counts:parsed}:{}),...(specific?{subpoints}:{}),...(details.trim()?{details:details.trim()}:{})};
 const empty=!enabled&&!total&&!specific&&!details.trim(),valid=empty||validExerciseOptions(options)&&(!enabled||totalValid&&Object.values(counts).every(v=>/^\d+$/.test(v)))&&(!specific||totalValid);
 function distribute(n:number){const c=resizeExerciseCounts(parsed,n);setCounts({original:String(c.original),copied:String(c.copied),numbers:String(c.numbers)});}
 function changeTotal(v:string){setTotal(v);const n=Number(v);if(enabled&&/^\d+$/.test(v)&&n>=1&&n<=30)distribute(n);}
 function changeCount(k:keyof ExerciseCounts,v:string){const c={...counts,[k]:v};setCounts(c);if(Object.values(c).every(n=>/^\d+$/.test(n)))setTotal(String(Object.values(c).reduce((a,b)=>a+Number(b),0)));}
 function reset(){setEnabled(false);setTotal('');setDetails('');setSpecific(false);setSubpoints([]);}
 return <dialog ref={dialog} className="exercise-dialog" onCancel={e=>{e.preventDefault();onClose();}} aria-labelledby="exercise-options-title">
  <header><div><h2 id="exercise-options-title">Ce exerciții vrei?</h2><p>Alege numărul, proveniența și structura următorului test sau a următoarei fișe.</p></div><button type="button" onClick={onClose} aria-label="Închide opțiunile exercițiilor"><X size={20}/></button></header>
  <form onSubmit={e=>{e.preventDefault();if(valid&&!disabled){onApply(empty?undefined:options);onClose();}}}>
   <label className="exercise-total-control">Număr total de exerciții<input type="number" inputMode="numeric" min={1} max={30} step={1} value={total} disabled={disabled} onChange={e=>changeTotal(e.target.value)} placeholder="După prompt"/></label>
   <p className="exercise-help">Total între 1 și 30 de exerciții principale; subpunctele și baremul nu se numără separat.</p>
   <label className="exercise-enable"><input type="checkbox" checked={enabled} onChange={e=>{setEnabled(e.target.checked);if(e.target.checked){const n=totalValid?totalNumber:10;setTotal(String(n));distribute(n);}}} disabled={disabled}/>Stabilește numărul pe categorie</label>
   <fieldset disabled={!enabled||disabled} className="exercise-counts"><legend className="sr-only">Numărul de exerciții din fiecare categorie</legend>{(Object.keys(exerciseLabels) as (keyof ExerciseCounts)[]).map(k=><label key={k}><span>{exerciseLabels[k]}</span><input type="number" inputMode="numeric" min={0} max={30} step={1} value={counts[k]} onChange={e=>changeCount(k,e.target.value)}/></label>)}</fieldset>
   {enabled&&<p className="exercise-help">Schimbarea totalului ajustează proporțional categoriile. Poți modifica apoi fiecare categorie; totalul se recalculează.</p>}
   <section className="exercise-subpoints" aria-label="Structura subpunctelor"><label className="exercise-enable"><input type="checkbox" checked={specific} disabled={disabled} onChange={e=>setSpecific(e.target.checked)}/>Specifică exercițiile cu subpuncte</label>
    {specific&&<><p className="exercise-help">Alege exercițiul și numărul de cerințe a), b), c). Cele neenumerate nu au subpuncte. Opțiunile A–D de la grilă nu se numără aici.</p>
     {subpoints.map((r,i)=><div className="exercise-subpoint-row" key={i}><label><span className="sr-only">Exercițiul pentru regula {i+1}</span><select aria-label={`Exercițiul pentru regula ${i+1}`} value={r.exercise} disabled={disabled} onChange={e=>setSubpoints(rows=>rows.map((v,j)=>j===i?{...v,exercise:Number(e.target.value)}:v))}>{Array.from({length:totalValid?totalNumber:0},(_,n)=><option key={n+1} value={n+1}>Exercițiul {n+1}</option>)}{(!totalValid||r.exercise>totalNumber)&&<option value={r.exercise}>Exercițiul {r.exercise} (peste total)</option>}</select></label><label><span>Subpuncte</span><input type="number" aria-label={`Subpuncte pentru regula ${i+1}`} min={1} max={10} step={1} value={r.count||''} disabled={disabled} onChange={e=>setSubpoints(rows=>rows.map((v,j)=>j===i?{...v,count:Number(e.target.value)}:v))}/></label><button type="button" disabled={disabled} aria-label={`Elimină regula pentru exercițiul ${r.exercise}`} onClick={()=>setSubpoints(rows=>rows.filter((_,j)=>j!==i))}><X size={18}/></button></div>)}
     <div className="exercise-subpoint-actions"><button type="button" disabled={disabled||!totalValid||subpoints.length>=totalNumber} onClick={()=>{const n=Array.from({length:totalNumber},(_,i)=>i+1).find(n=>!subpoints.some(r=>r.exercise===n));if(n)setSubpoints(rows=>[...rows,{exercise:n,count:2}]);}}><Plus size={16}/>Adaugă exercițiu cu subpuncte</button><button type="button" disabled={disabled} onClick={()=>setSubpoints([])}>Fără subpuncte la toate</button></div>
     {!subpoints.length&&<p role="status" className="exercise-help">Niciun exercițiu nu va avea subpuncte.</p>}<p className="exercise-help">Numerotarea este de la 1 la total, fără reluare în fiecare secțiune. Pentru preluări exacte și numere schimbate se aleg surse care au deja structura cerută.</p></>}
   </section>
   <label className="exercise-details" htmlFor="exercise-details">Ce fel de exerciții vrei?<textarea id="exercise-details" value={details} maxLength={800} disabled={disabled} onChange={e=>setDetails(e.target.value)} placeholder="Ex.: probleme cu resturi, calcule cu puteri, dificultate medie, fără geometrie." rows={3}/></label>
   <p className="exercise-help">Poți scrie aceste cerințe și direct în prompt. Numărul total, categoriile și subpunctele alese aici se aplică la generare.</p>
   <p className="exercise-help">Dacă sursele nu oferă suficiente enunțuri complete cu structura cerută, primești un mesaj, fără înlocuire automată cu exerciții originale.</p>
   {!valid&&<p role="alert" className="document-error">Verifică totalul (1–30), categoriile și regulile de subpuncte: exerciții distincte din total, cu 1–10 subpuncte fiecare.</p>}
   <footer><button type="button" onClick={reset}>Urmează doar promptul</button><button type="submit" disabled={disabled||!valid}>Aplică</button></footer>
  </form>
 </dialog>;
}
