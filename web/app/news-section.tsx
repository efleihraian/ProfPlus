'use client';
import {useEffect,useState} from 'react';
import {defaultNewsSettings,type NewsArticle,type NewsSettings} from '../lib/news';
import './news.css';
export default function NewsSection(){
 const [articles,setArticles]=useState<NewsArticle[]>([]),[settings,setSettings]=useState<NewsSettings>(defaultNewsSettings),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();void fetch('/api/news',{cache:'no-store',signal:controller.signal}).then(async r=>{const data=await r.json() as {articles:NewsArticle[];settings:NewsSettings;error?:string};if(!r.ok)throw new Error(data.error);setArticles(data.articles);setSettings(data.settings);}).catch(e=>{if(e.name!=='AbortError')setError('Știrile nu sunt disponibile momentan.');}).finally(()=>setLoading(false));return()=>controller.abort();},[]);
 const feature=articles.find(n=>n.slot===0),secondary=articles.filter(n=>n.slot!==0);
 const image=(n:NewsArticle)=>n.image_url?<img src={n.image_url} alt="" referrerPolicy="no-referrer" loading="lazy"/>:<div className="news-image-fallback" aria-hidden="true">ProfPlus</div>;
 const date=(n:NewsArticle)=>n.published_at?new Date(n.published_at).toLocaleDateString('ro-RO'):'';
 return <section id="stiri" aria-labelledby="stiri-titlu" className="news-section"><h2 id="stiri-titlu">{settings.title}</h2><p>{settings.intro}</p>{loading&&<p role="status">Se încarcă știrile…</p>}{error&&<p role="status">{error}</p>}{!loading&&!error&&!articles.length&&<p>Nu sunt știri publicate încă.</p>}<div className="news-grid">{feature&&<article className="news-feature">{image(feature)}<div><small>{feature.category} · {date(feature)}</small><h3>{feature.title}</h3><p>{feature.summary}</p><a href={'/news?id='+feature.id}>Citește articolul →</a></div></article>}<div className="news-secondary">{secondary.map(n=><article key={n.id}>{image(n)}<div><small>{n.category} · {date(n)}</small><h3>{n.title}</h3><a href={'/news?id='+n.id}>Citește →</a></div></article>)}{articles.length>0&&<a className="news-all" href="/news">Citește toate știrile →</a>}</div></div></section>;
}
