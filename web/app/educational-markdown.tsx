'use client';
import 'katex/dist/katex.min.css';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type {Source} from '../lib/rag';
import type {Root} from 'mdast';
type CitationNode={type:string;value?:string;children?:CitationNode[];url?:string};
import {normalizeMath} from '../lib/math-format';
const nodeText=(node:CitationNode):string=>node.value??node.children?.map(nodeText).join('')??'';
export default function EducationalMarkdown({content,sources=[]}:{content:string;sources?:Source[]}){
 function citations(){return (tree:Root)=>{
  const visit=(node:CitationNode)=>{
   if(!node.children||node.type==='link')return;
   node.children=node.children.flatMap(child=>{
    if(child.type!=='text'||child.value===undefined){visit(child);return [child];}
    const parts:CitationNode[]=[];let end=0;
    for(const match of child.value.matchAll(/\[(\d+)\]/g)){
     const source=sources.find(s=>s.id===Number(match[1]));if(!source)continue;
     if(match.index!>end)parts.push({type:'text',value:child.value.slice(end,match.index)});
     parts.push({type:'link',url:source.url,children:[{type:'text',value:match[0]}]});end=match.index!+match[0].length;
    }
    parts.push({type:'text',value:child.value.slice(end)});return parts;
   });
  };visit(tree);
 };}

 // No raw HTML, no trusted TeX HTML/URL commands, bounded expansions/sizes.
 return <Markdown remarkPlugins={[remarkGfm,remarkMath,citations]} rehypePlugins={[[rehypeKatex,{trust:false,strict:'warn',maxExpand:200,maxSize:10}]]} components={{li:({node,children})=><li className={node&&/^[a-z]\)/i.test(nodeText(node).trim())?'exercise-choice':undefined}>{children}</li>,img:()=>null,a:({children,href})=><a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,p:({children})=><p>{children}</p>}}>{normalizeMath(content)}</Markdown>;
}
