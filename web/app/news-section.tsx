'use client';
import {useEffect,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {defaultNewsSettings,type NewsArticle,type NewsSettings} from '../lib/news';
import NewsCard from './news-card';
import './news.css';
export default function NewsSection(){
 const [articles,setArticles]=useState<NewsArticle[]>([]),[settings,setSettings]=useState<NewsSettings>(defaultNewsSettings),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');void fetch('/api/news?home=1',{cache:'no-store',signal:c.signal}).then(async r=>{const d=await r.json() as {articles:NewsArticle[];settings:NewsSettings;error?:string};if(!r.ok)throw new Error(d.error);setArticles(d.articles);setSettings(d.settings);}).catch(e=>{if(e.name!=='AbortError')setError('Știrile nu pot fi încărcate momentan.');}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[reload]);
 const feature=articles.find(n=>n.slot===0),secondary=articles.filter(n=>n.slot>0&&n.slot<4);
 return <section id="stiri" aria-labelledby="stiri-titlu" className="news-section"><div className="news-section-heading"><div><h2 id="stiri-titlu">{settings.title}</h2><p>{settings.intro}</p></div><a className="news-all" href="/news">Toate știrile <ArrowRight size={18}/></a></div>{loading&&<p role="status">Se încarcă știrile…</p>}{error&&<div role="status">{error} <button onClick={()=>setReload(n=>n+1)}>Reîncearcă</button></div>}{!loading&&!error&&!articles.length&&<p className="news-empty">Noutățile pentru profesori vor apărea aici. Poți consulta și lista tuturor știrilor.</p>}<div className={'news-grid'+(!feature?' without-feature':'')}>{feature&&<NewsCard article={feature} featured/>}<div className="news-secondary">{secondary.map(n=><NewsCard key={n.id} article={n}/>)}</div></div></section>;
}
