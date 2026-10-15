'use client';
import {useCallback,useEffect,useState} from 'react';
import {formatLabel,levelLabel,priceLabel,type OwnTutoringAd} from '../../lib/tutoring';
type Queued=OwnTutoringAd&{reports:string[]};
/** Moderare: anunțurile raportate sau ascunse automat; administratorul le ascunde sau le restabilește. */
export default function TutoringModeration(){
 const [ads,setAds]=useState<Queued[]|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState('');
 const load=useCallback(async()=>{const r=await fetch('/api/admin/tutoring',{cache:'no-store'});const d=await r.json() as {ads?:Queued[];error?:string};if(!r.ok)throw new Error(d.error||'Lista nu poate fi încărcată.');setAds(d.ads||[]);},[]);
 useEffect(()=>{void Promise.resolve().then(load).catch(e=>setError(e.message));},[load]);
 async function act(id:string,action:'hide'|'restore'){setBusy(id);setError('');try{const r=await fetch('/api/admin/tutoring',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action})});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error||'Operația a eșuat.');await load();}catch(e){setError(e instanceof Error?e.message:'Operația a eșuat.');}finally{setBusy('');}}
 return <section className="admin-panel"><h2>Anunțuri de meditații de verificat</h2><p className="admin-caption">Apar aici anunțurile raportate de utilizatori. După trei raportări, anunțul este ascuns automat până decizi. Restabilirea șterge raportările.</p>
  {error&&<p role="alert" className="account-error">{error}</p>}{!ads&&!error&&<p role="status">Se încarcă…</p>}{ads&&!ads.length&&<p className="admin-caption">Nu sunt anunțuri raportate.</p>}
  {ads?.map(ad=><article key={ad.id} className="admin-tutoring-item"><div><strong>{ad.title}</strong><p>{ad.subject} · {ad.levels.map(levelLabel).join(', ')} · {ad.formats.map(formatLabel).join(', ')}{ad.city?' · '+ad.city:''} · {priceLabel(ad.price)}</p><p>{ad.description}</p><p className="admin-caption">De la {ad.displayName} · stare: {ad.status==='hidden'?'ascuns':ad.status==='paused'?'pe pauză':'publicat'} · {ad.reports.length} motive: {ad.reports.join('; ')||'fără detalii'}</p></div><div className="admin-tutoring-actions">{ad.status!=='hidden'?<button className="admin-secondary" disabled={!!busy} onClick={()=>void act(ad.id,'hide')}>Ascunde</button>:<button className="admin-secondary" disabled={!!busy} onClick={()=>void act(ad.id,'restore')}>Restabilește</button>}</div></article>)}
 </section>;
}
