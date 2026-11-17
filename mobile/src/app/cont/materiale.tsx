import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchPublicLibrary } from '@/lib/api';
import {
  PUBLIC_LIBRARY_GRADES, PUBLIC_LIBRARY_QUERY_LIMIT, PUBLIC_LIBRARY_TYPES, formatCount, formatNumber, itemTypeLabel, openLabel, sourceHost,
  type LibrarySearch, type PublicLibraryItem, type PublicLibraryResults,
} from '../../../../web/shared/public-library';

const grades=[{value:'',label:'Toate clasele'},...PUBLIC_LIBRARY_GRADES.map((label,index)=>({value:String(index),label:index===0?label:'Clasa '+label}))];

function TypeChip({label,count,selected,onPress}:{label:string;count?:number;selected:boolean;onPress:()=>void}){
  const theme=useTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{selected}}
    accessibilityLabel={label+(count!==undefined?', '+formatCount(count,'material','materiale'):'')}
    style={({pressed})=>[styles.chip,{borderColor:selected?theme.accentText:theme.border,backgroundColor:selected?theme.soft:theme.surface,opacity:pressed?0.8:1}]}>
    <ThemedText type="smallBold">{label}</ThemedText>
    {count!==undefined?<ThemedText type="small" themeColor={selected?'text':'muted'} style={styles.count}>{formatNumber(count)}</ThemedText>:null}
  </Pressable>;
}

function ResultCard({item,onOpen}:{item:PublicLibraryItem;onOpen:(url:string)=>void}){
  const host=sourceHost(item.url);
  return <Card eyebrow={[itemTypeLabel(item.kind),item.grade&&'Clasa '+item.grade,item.subject].filter(Boolean).join(' · ')} title={item.title}>
    {item.kind!=='site'?<ThemedText type="small">{item.publisher}</ThemedText>:null}
    {item.description?<ThemedText type="small" themeColor="muted">{item.description}</ThemedText>:null}
    <Button variant="secondary" onPress={()=>onOpen(item.url)} accessibilityHint={host?'Se deschide în browser, pe '+host:undefined}>{openLabel(item.url,item.kind)}</Button>
    {host?<ThemedText type="small" themeColor="muted">{host}</ThemedText>:null}
  </Card>;
}

export default function PublicMaterialsScreen(){
  const [q,setQuery]=useState(''),[grade,setGrade]=useState('');
  const [filters,setFilters]=useState<LibrarySearch>({});
  const [results,setResults]=useState<PublicLibraryResults>();
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[linkError,setLinkError]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    void searchPublicLibrary(filters,controller.signal).then(setResults).catch(()=>{
      if(!controller.signal.aborted)setError('Căutarea nu a reușit. Încearcă din nou.');
    }).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[filters]);

  function request(next:LibrarySearch){
    setLoading(true);setLinkError('');setError('');setFilters(next);
  }
  async function open(url:string){
    setLinkError('');
    try{
      const external=new URL(url);
      if(external.protocol!=='https:'||external.username||external.password)throw new Error('Invalid source');
      await openBrowserAsync(external.href);
    }catch{setLinkError('Sursa nu s-a putut deschide în browser.');}
  }
  const counts=results?.counts;
  const total=counts?Object.values(counts).reduce((a,b)=>a+b,0):undefined;
  const sites=counts?.site||0;
  const intro=total?formatCount(total-sites,'material','materiale')+' publice: manuale, examene, olimpiade și fișe'+(sites?', din '+formatCount(sites,'site educațional','site-uri educaționale'):'')+'. Le deschizi direct la sursă.':'Manuale, examene, olimpiade și fișe, deschise direct la sursă.';

  return <Screen back title="Bibliotecă de materiale didactice" intro={intro}>
    <TextField label="Caută materiale" maxLength={PUBLIC_LIBRARY_QUERY_LIMIT} value={q} onChangeText={setQuery}
      placeholder="Ex. barem olimpiadă matematică clasa a VII-a" returnKeyType="search" onSubmitEditing={()=>request({q,type:filters.type,grade})}/>
    <Select label="Clasă" value={grade} options={grades} onChange={setGrade}/>
    <Button onPress={()=>request({q,type:filters.type,grade})}>Caută</Button>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel="Tipuri de materiale">
      <TypeChip label="Toate" count={total} selected={!filters.type} onPress={()=>request({...filters,type:undefined,page:undefined})}/>
      {PUBLIC_LIBRARY_TYPES.filter(type=>!counts||counts[type.id]).map(type=><TypeChip key={type.id} label={type.label} count={counts?.[type.id]}
        selected={filters.type===type.id} onPress={()=>request({...filters,type:type.id,page:undefined})}/>)}
    </ScrollView>
    {loading?<ThemedText accessibilityLiveRegion="polite">Se caută…</ThemedText>:null}
    {error?<>
      <ThemedText themeColor="dangerText" accessibilityLiveRegion="polite">{error}</ThemedText>
      <Button variant="secondary" onPress={()=>request({...filters})}>Reîncearcă</Button>
    </>:null}
    {linkError?<ThemedText themeColor="dangerText" accessibilityLiveRegion="polite">{linkError}</ThemedText>:null}
    {!loading&&!error&&results?<>
      <ThemedText type="subtitle" accessibilityRole="header">{filters.type==='site'?formatCount(results.total,'site','site-uri'):formatCount(results.total,'material','materiale')}</ThemedText>
      {!results.total?<ThemedText>Nu am găsit materiale. Încearcă un titlu mai scurt, alt tip sau toate clasele.</ThemedText>:null}
      {results.items.map(item=><ResultCard key={item.id} item={item} onOpen={url=>void open(url)}/>)}
      {results.pages>1?<View style={styles.pages}>
        {results.page>1?<Button variant="secondary" onPress={()=>request({...filters,page:String(results.page-1)})}>Înapoi</Button>:null}
        <ThemedText type="small" style={styles.count}>Pagina {formatNumber(results.page)} din {formatNumber(results.pages)}</ThemedText>
        {results.page<results.pages?<Button variant="secondary" onPress={()=>request({...filters,page:String(results.page+1)})}>Următoarea</Button>:null}
      </View>:null}
    </>:null}
  </Screen>;
}

const styles=StyleSheet.create({
  chips:{gap:Spacing.two,paddingVertical:Spacing.one},
  chip:{flexDirection:'row',alignItems:'center',gap:Spacing.two,minHeight:44,paddingHorizontal:Spacing.three-2,borderWidth:1,borderRadius:999},
  count:{fontVariant:['tabular-nums']},
  pages:{gap:Spacing.two},
});
