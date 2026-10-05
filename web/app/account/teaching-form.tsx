'use client';
import {useState} from 'react';
import {subjects,stages,type TeachingProfile,type Stage} from '../../lib/teaching-profile';
export default function TeachingForm({initial,busy,onSave,name,onNameChange}:{name?:string;onNameChange?:(name:string)=>void;initial:TeachingProfile|null;busy:boolean;onSave:(profile:TeachingProfile)=>Promise<void>}){
 const [role,setRole]=useState(initial?.role||''),[subject,setSubject]=useState(initial?.role==='teacher'?initial.subject:''),[bands,setBands]=useState<Stage[]>(initial?.stages||[]);
 return <form className="teaching-form" onSubmit={e=>{e.preventDefault();void onSave(role==='primary'?{role:'primary',subject:'*',stages:['primary']}:{role:'teacher',subject,stages:bands});}}>
 {onNameChange&&<><label>Nume afișat <span>(opțional)</span><input value={name||''} maxLength={100} autoComplete="name" onChange={e=>onNameChange(e.target.value)} disabled={busy}/></label><h3>Activitatea didactică</h3></>}
 <fieldset><legend>Cum predai?</legend><label className="account-check"><input type="radio" name="teaching-role" value="primary" checked={role==='primary'} onChange={()=>setRole('primary')} required disabled={busy}/>Învățător — toate materiile, clasele 0–4</label><label className="account-check"><input type="radio" name="teaching-role" value="teacher" checked={role==='teacher'} onChange={()=>setRole('teacher')} disabled={busy}/>Profesor — aleg disciplina și clasele</label></fieldset>
 {role==='teacher'&&<><label>Disciplina<select aria-label="Disciplina" value={subject} onChange={e=>setSubject(e.target.value)} required disabled={busy}><option value="">Alege disciplina</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}</select></label><fieldset><legend>La ce clase predai? Poți alege mai multe cicluri.</legend>{stages.map(s=><label className="account-check" key={s.id}><input type="checkbox" checked={bands.includes(s.id)} onChange={e=>setBands(e.target.checked?[...bands,s.id]:bands.filter(b=>b!==s.id))} disabled={busy}/>{s.label}</label>)}</fieldset></>}
 <p className="account-help">Se selectează automat toate manualele, culegerile, olimpiadele, concursurile și documentele indexate potrivite materiei și claselor. Le poți modifica oricând. Nu solicităm școala, adresa sau date despre elevi.</p>
 <button className="account-primary" disabled={busy||!role||(role==='teacher'&&(!subject||!bands.length))}>{busy?'Se salvează…':initial?'Salvează profilul':'Salvează și continuă'}</button>
 </form>;
}
