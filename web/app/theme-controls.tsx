'use client';
import {useSyncExternalStore} from 'react';
import {ThemeProvider,useTheme} from 'next-themes';
import {Moon,Sun} from 'lucide-react';
const subscribe=()=>()=>{};
export function ProfosThemeProvider({children}:{children:React.ReactNode}) {
 return <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="profos-theme" disableTransitionOnChange>{children}</ThemeProvider>;
}
export function ThemeToggle(){
 const {resolvedTheme,setTheme}=useTheme();
 const mounted=useSyncExternalStore(subscribe,()=>true,()=>false);
 const dark=mounted&&resolvedTheme==='dark';
 return <button className="theme-toggle" type="button" disabled={!mounted} aria-label={dark?'Activează modul luminos':'Activează modul întunecat'} aria-pressed={dark} title={dark?'Mod luminos':'Mod întunecat'} onClick={()=>{setTheme(dark?'light':'dark');try{if(localStorage.getItem('profos-remember-preferences')==='false')localStorage.removeItem('profos-theme');}catch{}}}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Mod luminos':'Mod întunecat'}</span></button>;
}
