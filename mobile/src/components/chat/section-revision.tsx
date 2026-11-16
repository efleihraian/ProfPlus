import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { MarkdownText } from '@/components/chat/markdown-text';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { api, type GeneratedDocument } from '@/lib/api';
import { applySectionRevision, documentSections, MAX_REVISION_INSTRUCTION, sectionPreview } from '../../../../web/shared/document-sections';

export function SectionRevision({document, onSave}: {document:GeneratedDocument; onSave:(document:GeneratedDocument)=>Promise<void>}) {
  const sections=documentSections(document);
  const [expanded,setExpanded]=useState(false);
  const [id,setId]=useState(''),[instruction,setInstruction]=useState(''),[error,setError]=useState('');
  const [proposal,setProposal]=useState<{id:string;original:string;text:string}|null>(null);
  const [pending,setPending]=useState(false),[saving,setSaving]=useState(false);
  const request=useRef<AbortController|null>(null);
  const section=sections.find(item=>item.id===id);
  const draft=proposal?.id===id&&proposal.original===section?.fragment?proposal.text:null;
  useEffect(()=>()=>request.current?.abort(),[]);
  async function suggest(){
    if(!section||!instruction.trim()||request.current)return;
    const controller=new AbortController();
    request.current=controller;setPending(true);setError('');setProposal(null);
    try{
      const result=await api.documents.reviseSection({format:section.format,fragment:section.fragment,instruction:instruction.trim()},controller.signal);
      if(!controller.signal.aborted)setProposal({id:section.id,original:section.fragment,text:result.replacement});
    }catch(caught){
      if(!controller.signal.aborted)setError(caught instanceof Error?caught.message:'Propunerea nu este disponibilă.');
    }finally{
      request.current=null;
      if(!controller.signal.aborted)setPending(false);
    }
  }
  async function save(){
    if(!section||draft===null||saving)return;
    setSaving(true);setError('');
    try{
      await onSave(applySectionRevision(document,section,draft));
      setProposal(null);setId('');setInstruction('');setExpanded(false);
    }catch(caught){
      setError(caught instanceof Error?caught.message:'Propunerea nu poate fi salvată.');
    }finally{setSaving(false);}
  }
  if(!sections.length)return null;
  return <View style={{gap:8}}>
    <Button variant="secondary" disabled={pending||saving} onPress={()=>setExpanded(!expanded)}>{expanded?'Închide editarea cu Profi':'Editează o secțiune cu Profi'}</Button>
    {expanded&&<>
      <Select label="Secțiune" value={id} options={[{value:'',label:'Alege secțiunea'},...sections.map((item,index)=>({value:item.id,label:(index+1)+'. '+item.label}))]}
        disabled={pending||saving} onChange={value=>{setId(value);setProposal(null);setError('');}}/>
      {section&&<>
        <ThemedText type="smallBold">Secțiunea selectată</ThemedText>
        <MarkdownText content={sectionPreview(section.fragment,section.format)}/>
        <TextField label="Ce vrei să schimbe Profi?" value={instruction} editable={!pending&&!saving} multiline maxLength={MAX_REVISION_INSTRUCTION} onChangeText={value=>{setInstruction(value);setProposal(null);}}/>
        <ThemedText type="small">Evită datele personale ale elevilor în secțiune și în instrucțiune.</ThemedText>
        <Button loading={pending} disabled={saving||!instruction.trim()} onPress={()=>void suggest()}>Cere o propunere</Button>
      </>}
      {draft!==null&&<>
        <ThemedText type="smallBold">Propunere</ThemedText>
        {section&&<MarkdownText content={sectionPreview(draft,section.format)}/>}
        <Button loading={saving} onPress={()=>void save()}>Aplică și salvează</Button>
        <Button variant="secondary" disabled={saving} onPress={()=>setProposal(null)}>Renunță la propunere</Button>
      </>}
      {error?<ThemedText accessibilityLiveRegion="polite" themeColor="dangerText">{error}</ThemedText>:null}
    </>}
  </View>;
}
