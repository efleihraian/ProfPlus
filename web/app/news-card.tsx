'use client';
import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {newsDate,newsExcerpt,type NewsArticle} from '../lib/news';
import {isAutoNews,sourceName} from '../lib/news-feed';
export function NewsImage({url}:{url:string}){const [failed,setFailed]=useState(false);return url&&!failed?<img src={url} alt="" referrerPolicy="no-referrer" loading="lazy" onError={()=>setFailed(true)}/>:null;}
export default function NewsCard({article,featured=false,preview=false}:{article:NewsArticle&{reason?:string};featured?:boolean;preview?:boolean}){
 const auto=isAutoNews(article.id)&&!!article.source_url;
 const content=<><NewsImage key={article.image_url} url={article.image_url}/><div className="news-card-copy">{article.reason&&<span className={'news-reason'+(article.reason==='Important'?' important':'')}>{article.reason}</span>}<div className="news-meta"><span>{article.category||'Educație'}</span>{article.published_at&&<time dateTime={article.published_at}>{newsDate(article)}</time>}{auto&&<span className="news-source-name">{sourceName(article.source_url)}</span>}</div><h3>{article.title||'Titlul articolului'}</h3><p>{newsExcerpt(article)||'Rezumatul apare aici, sub titlu.'}</p><span className="news-card-link">Citește articolul <ArrowUpRight size={17} aria-hidden="true"/></span></div></>;
 return <article className={'news-card'+(featured?' news-feature':'')+(article.image_url?' has-image':'')}>{preview?<div>{content}</div>:<a href={'/news?id='+article.id}>{content}</a>}</article>;
}
