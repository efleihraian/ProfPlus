import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { supabase } from '@/lib/supabase';

export function AccountMfa({ challenge=false, canEnroll=false }: {challenge?:boolean; canEnroll?:boolean}) {
  type Mfa = Awaited<ReturnType<typeof supabase.auth.mfa.listFactors>>;
  const [factors,setFactors]=useState<NonNullable<Mfa["data"]>["totp"]>();
  const [id,setId]=useState(""),[proof,setProof]=useState("");
  const [enrolled,setEnrolled]=useState<{id:string;secret:string}>();
  const [code,setCode]=useState(""),[remove,setRemove]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const load=useCallback(async()=>{
    setError("");
    const {data,error}=await supabase.auth.mfa.listFactors();
    if(error){setError("Autentificatoarele nu au putut fi încărcate.");return;}
    setFactors(data.totp);
  },[]);
  useEffect(()=>{void load();},[load]);
  const selected=factors?.find(factor=>factor.id===id)??factors?.[0];
  const choices=factors?.map(factor=>({value:factor.id,label:factor.friendly_name||"Autentificator"}))??[];
  async function run(action:()=>Promise<void>){
    setBusy(true);setError("");
    try{await action();}catch(error){setError(error instanceof Error?error.message:"Cererea nu a reușit.");}
    finally{setBusy(false);}
  }
  async function enroll(){
    const {data:list,error}=await supabase.auth.mfa.listFactors();
    if(error)throw new Error("Autentificatoarele nu au putut fi încărcate.");
    if(list.totp.length>=2)throw new Error("Ai deja doi autentificatori verificați.");
    for(const factor of list.all)if(factor.factor_type==="totp"&&factor.status==="unverified")await supabase.auth.mfa.unenroll({factorId:factor.id});
    const friendlyName=list.totp.some(factor=>factor.friendly_name==="ProfPlus")?"ProfPlus — rezervă":"ProfPlus";
    const result=await supabase.auth.mfa.enroll({factorType:"totp",friendlyName});
    if(result.error)throw new Error("Activarea nu a putut fi pornită. Reîncearcă.");
    setEnrolled({id:result.data.id,secret:result.data.totp.secret});setCode("");
  }
  async function verify(){
    const factorId=enrolled?.id??(remove?proof:selected?.id);
    if(!factorId||!/^\d{6}$/.test(code))return;
    const {error}=await supabase.auth.mfa.challengeAndVerify({factorId,code});
    if(error)throw new Error("Codul nu a fost acceptat. Încearcă următorul cod din aplicație.");
    if(remove&&selected){
      const result=await supabase.auth.mfa.unenroll({factorId:selected.id});
      if(result.error)throw new Error("Autentificatorul nu a putut fi eliminat.");
      await supabase.auth.refreshSession();
    }
    setCode("");setEnrolled(undefined);setRemove(false);
    if(!challenge)await load();
  }

  return <View style={{gap:8}}>
    <ThemedText type="subtitle" accessibilityRole="header">Autentificare în doi pași</ThemedText>
    {!factors&&!error?<ThemedText>Se verifică…</ThemedText>:null}
    {!factors&&error?<Button variant="secondary" onPress={()=>void load()}>Reîncearcă</Button>:null}
    {factors?.length&&!challenge?<ThemedText>Autentificarea în doi pași este activă.</ThemedText>:null}
    {choices.length>1&&!enrolled&&!remove?<Select label="Autentificator" value={selected?.id??""} options={choices} disabled={busy} onChange={value=>{setId(value);setCode("");}}/>:null}
    {factors&&!challenge&&!enrolled&&!remove?<>
      {canEnroll&&factors.length<2?<Button variant="secondary" disabled={busy} onPress={()=>void run(enroll)}>{factors.length?"Adaugă un autentificator de rezervă":"Activează autentificarea în doi pași"}</Button>:null}
      {selected?<Button variant="secondary" disabled={busy} onPress={()=>{setRemove(true);setProof(selected.id);setCode("");}}>Elimină autentificatorul selectat</Button>:null}
    </>:null}
    {enrolled?<>
      <ThemedText>Introdu cheia în aplicația de autentificare și selectează coduri bazate pe timp.</ThemedText>
      <ThemedText selectable>{enrolled.secret}</ThemedText>
    </>:null}
    {remove&&choices.length>1?<Select label="Confirmă cu" value={proof} options={choices} disabled={busy} onChange={value=>{setProof(value);setCode("");}}/>:null}
    {enrolled||selected&&(challenge||remove)?<>
      <TextField label="Codul din aplicație" inputMode="numeric" maxLength={6} value={code} onChangeText={value=>setCode(value.replace(/\D/g,""))} editable={!busy}/>
      <Button loading={busy} disabled={code.length!==6} onPress={()=>void run(verify)}>{remove?"Confirmă eliminarea":enrolled?"Confirmă și activează":"Confirmă codul"}</Button>
      {!challenge?<Button variant="secondary" disabled={busy} onPress={()=>{setCode("");setEnrolled(undefined);setRemove(false);}}>Renunță</Button>:null}
    </>:null}
    {error?<ThemedText themeColor="dangerText" accessibilityLiveRegion="polite">{error}</ThemedText>:null}
    <ThemedText type="small">Păstrează un al doilea autentificator pe un dispozitiv separat. Linkul de resetare a parolei cere și codul aplicației când 2FA este activă.</ThemedText>
  </View>;
}
