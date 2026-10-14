'use client';
import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {newsDate,newsExcerpt,type NewsArticle} from '../lib/news';
export function NewsImage({url}:{url:string}){const [failed,setFailed]=useState(false);return url&&!failed?<img src={url} alt="" referrerPolicy="no-referrer" loading="lazy" onError={()=>setFailed(true)}/>:null;}
export default function NewsCard({article,featured=false,preview=false}:{article:NewsArticle;featured?:boolean;preview?:boolean}){
 const content=<><NewsImage key={article.image_url} url={article.image_url}/><div className="news-card-copy"><div className="news-meta"><span>{article.category||'Educație'}</span>{article.published_at&&<time dateTime={article.published_at}>{newsDate(article)}</time>}</div><h3>{article.title||'Titlul articolului'}</h3><p>{newsExcerpt(article)||'Rezumatul apare aici, sub titlu.'}</p><span className="news-card-link">Citește articolul <ArrowUpRight size={17} aria-hidden="true"/></span></div></>;
 return <article className={'news-card'+(featured?' news-feature':'')+(article.image_url?' has-image':'')}>{preview?<div>{content}</div>:<a href={'/news?id='+article.id}>{content}</a>}</article>;
}
