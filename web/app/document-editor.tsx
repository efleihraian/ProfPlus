'use client';
import {useEffect,useRef,useState} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {X,Pencil,Download,Save,Bold,Italic,List,ListOrdered,Heading2,Undo2,Redo2,FileText,Check} from 'lucide-react';
import type {GeneratedDocument} from '../lib/generated-document';
import type {Source} from '../lib/rag';
import {sourceOnlyProvenance} from '../lib/export-provenance';
import {download,exportDocx,exportPdf} from '../lib/document-export';
function serialize(root:HTMLElement):string{
 const inline=(node:Node):string=>{
  if(node.nodeType===Node.TEXT_NODE)return node.textContent||'';
  const el=node as HTMLElement,body=Array.from(el.childNodes).map(inline).join('');
  if(['STRONG','B'].includes(el.tagName))return '**'+body+'**';
  if(['EM','I'].includes(el.tagName))return '*'+body+'*';
  if(el.tagName==='BR')return '\n';
  if(el.tagName==='A'){const href=el.getAttribute('href')||'';return /^(https?:\/\/|\/api\/)/.test(href)?`[${body}](${href})`:body;}
  if(/^H[1-6]$/.test(el.tagName))return '#'.repeat(Number(el.tagName[1]))+' '+body+'\n\n';
  if(el.tagName==='LI'){const number=Array.from(el.parentElement?.children||[]).indexOf(el)+1;return (el.parentElement?.tagName==='OL'?number+'. ':'- ')+body.trim()+'\n';}
  if(['UL','OL'].includes(el.tagName))return body+'\n';
  if(el.tagName==='TABLE'){const rows=Array.from(el.querySelectorAll('tr')).map(row=>Array.from(row.children).map(cell=>(cell.textContent||'').trim().replace(/\|/g,'/').replace(/\n/g,' ')));return rows.map((r,i)=>'| '+r.join(' | ')+' |\n'+(i===0?'| '+r.map(()=>'---').join(' | ')+' |\n':'')).join('')+'\n';}
  if(el.tagName==='HR')return '\n---\n';
  return ['P','DIV','BLOCKQUOTE'].includes(el.tagName)?body+'\n\n':body;
 };
 return Array.from(root.childNodes).map(inline).join('').replace(/\n{3,}/g,'\n\n').trim();
}
export default function DocumentEditor({document:initial,sources,onSave,onClose}:{document:GeneratedDocument;sources:Source[];onSave:(doc:GeneratedDocument)=>Promise<void>;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),preview=useRef<HTMLDivElement>(null),editor=useRef<HTMLDivElement>(null);
 const [title,setTitle]=useState(initial.title),[content,setContent]=useState(initial.content),[editing,setEditing]=useState(false),[saving,setSaving]=useState(false),[exporting,setExporting]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(initial);
 const [sourceOnly,setSourceOnly]=useState(false);
 const dirty=title!==saved.title||content!==saved.content;
 useEffect(()=>{dialog.current?.showModal();},[]);
 useEffect(()=>{if(editing&&editor.current&&preview.current){editor.current.innerHTML=preview.current.innerHTML;editor.current.focus();}},[editing]);
 async function save(){if(!title.trim()||!content.trim())throw new Error('Documentul trebuie să aibă un titlu și conținut.');const value={title:title.trim(),content};await onSave(value);setTitle(value.title);setSaved(value);}
 async function saveClick(){setSaving(true);setError('');try{await save();}catch(e){setError(e instanceof Error?e.message:'Salvarea a eșuat.');}finally{setSaving(false);}}
 function close(){if(saving||exporting)return;if(dirty){setError('Ai modificări nesalvate. Salvează documentul sau renunță explicit la editări.');return;}onClose();}
 async function exportFile(format:'pdf'|'docx'){setExporting(true);setError('');try{const value={title:title.trim(),content:sourceOnly?sourceOnlyProvenance(content):content};if(!value.title||!content.trim())throw new Error('Completează titlul și documentul.');const blob=format==='pdf'?await exportPdf(value,sources):await exportDocx(value,sources);download(blob,value.title,format);}catch(e){setError(e instanceof Error?e.message:'Exportul a eșuat.');}finally{setExporting(false);}}
 function format(command:string,value?:string){editor.current?.focus();window.document.execCommand(command,false,value);if(editor.current)setContent(serialize(editor.current));}
 return <dialog ref={dialog} className="document-editor-dialog" aria-label="Editor document educațional" onCancel={e=>{e.preventDefault();close();}}><header className="document-editor-header"><FileText size={22}/><input aria-label="Titlul documentului" maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/><div className="document-editor-actions"><button onClick={()=>setEditing(!editing)} disabled={saving||exporting}><Pencil size={17}/>{editing?'Previzualizare':'Editează'}</button><button onClick={()=>void saveClick()} disabled={!dirty||saving||exporting}><Save size={17}/>{saving?'Se salvează…':'Salvează'}</button><details className="document-export-menu"><summary><Download size={17}/>Export</summary><div><label className="export-source-option"><input type="checkbox" checked={sourceOnly} disabled={exporting} onChange={e=>setSourceOnly(e.target.checked)}/>Doar sursa, fără detalii de proveniență</label><button aria-label="Export PDF" disabled={exporting} onClick={()=>void exportFile('pdf')}>PDF</button><button aria-label="Export Word (.docx)" disabled={exporting} onClick={()=>void exportFile('docx')}>Word (.docx)</button></div></details><button aria-label="Închide documentul" onClick={close}><X size={21}/></button></div></header>{editing&&<div className="document-format-bar">{[{label:'Aldin',icon:Bold,cmd:'bold'},{label:'Cursiv',icon:Italic,cmd:'italic'},{label:'Titlu de secțiune',icon:Heading2,cmd:'formatBlock',value:'h2'},{label:'Listă',icon:List,cmd:'insertUnorderedList'},{label:'Listă numerotată',icon:ListOrdered,cmd:'insertOrderedList'},{label:'Anulează editarea',icon:Undo2,cmd:'undo'},{label:'Repetă editarea',icon:Redo2,cmd:'redo'}].map(item=><button key={item.cmd} title={item.label} aria-label={item.label} onMouseDown={e=>e.preventDefault()} onClick={()=>format(item.cmd,item.value)}><item.icon size={18}/></button>)}</div>}<div className="document-editor-status"><span>{dirty?'Modificări nesalvate':<><Check size={14}/>Salvat în conversație</>}</span>{exporting&&<span role="status">Se pregătește exportul…</span>}{error&&<span role="alert">{error}</span>}{dirty&&<button disabled={saving||exporting} onClick={onClose}>Renunță la editări și închide</button>}</div><div className="document-editor-body"><article className="document-paper"><h1>{title}</h1><div ref={preview} className="document-content" hidden={editing}><Markdown remarkPlugins={[remarkGfm]} components={{img:()=>null,a:({children,href})=><a href={href} target="_blank" rel="noopener noreferrer">{children}</a>}}>{content}</Markdown></div><div ref={editor} hidden={!editing} className="document-content document-editable" contentEditable={editing} suppressContentEditableWarning role="textbox" aria-label="Conținutul documentului" aria-multiline="true" onPaste={e=>{e.preventDefault();window.document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));if(editor.current)setContent(serialize(editor.current));}} onInput={()=>{if(editor.current)setContent(serialize(editor.current));}}/>{!!sources.length&&<div className="document-source-note"><strong>Surse consultate</strong>{sources.map(s=><p key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">[{s.id}] {s.title}</a></p>)}</div>}</article></div></dialog>;
}
