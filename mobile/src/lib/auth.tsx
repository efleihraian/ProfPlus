// Starea contului în aplicație: sesiunea Supabase curentă și acțiunile de cont.
// P-195: înregistrarea, recuperarea parolei, schimbarea parolei/e-mailului se fac direct cu Supabase, ca pe site:
// linkurile din e-mailuri se deschid pe profplus.ro. Profilul și ștergerea trec prin serverul ProfPlus (POST /api/account).
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { SITE_URL } from '@/components/ui/coming-soon';
import { api, ApiError } from '@/lib/api';
import { log } from '@/lib/log';
import { supabase, supabaseConfigured } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

/** Unde duc linkurile din e-mailurile de confirmare și recuperare: pagina de cont a site-ului. */
const EMAIL_CALLBACK = SITE_URL + '/auth/callback';
/** Aceeași regulă ca serverul (POST /api/account). */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;
/** Ce ține aplicația pe telefon în afara sesiunii; se șterge odată cu contul. */
const LOCAL_KEYS = { async: ['profplus-portfolio-extra'], secure: ['profplus-photo-notice-v1'] };

export type Outcome = { error: string } | { message: string };

type Auth = {
  /** undefined cât timp se citește sesiunea salvată pe telefon. */
  session: Session | null | undefined;
  configured: boolean;
  /** Mesajul afișat după o acțiune care a închis sesiunea (de ex. contul șters). */
  notice: string | null;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  register: (email: string, password: string) => Promise<Outcome>;
  resendConfirmation: (email: string) => Promise<Outcome>;
  resetPassword: (email: string) => Promise<Outcome>;
  changePassword: (current: string, next: string) => Promise<Outcome>;
  changeEmail: (current: string, email: string) => Promise<Outcome>;
  signOutEverywhere: () => Promise<Outcome>;
  /** Ștergerea cere o conectare recentă (15 minute pe server): parola sau din nou Google. */
  deleteAccount: (password: string | null) => Promise<Outcome | null>;
};

const AuthContext = createContext<Auth | null>(null);

// Mesajele Supabase sunt în engleză; le traducem pe cele pe care le vede profesorul des.
function message(error: { message?: string; code?: string } | null) {
  if (!error) return null;
  if (error.code === 'invalid_credentials') return 'Email sau parolă greșite.';
  if (error.code === 'email_not_confirmed') return 'Confirmă adresa de email din mesajul primit, apoi încearcă din nou.';
  if (error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') return 'Prea multe încercări. Așteaptă puțin și încearcă din nou.';
  return 'Nu te-am putut conecta. Verifică internetul și încearcă din nou.';
}

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
const passwordProblem = (password: string) =>
  password.length < PASSWORD_MIN || password.length > PASSWORD_MAX ? `Parola nouă trebuie să aibă între ${PASSWORD_MIN} și ${PASSWORD_MAX} de caractere.` : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) setNotice(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) log('warn', 'auth_sign_in_failed', { method: 'password', code: error.code ?? null, status: error.status ?? null });
    return message(error);
  }

  async function signInWithGoogle() {
    // Supabase trebuie să aibă adresa profplus://auth/callback în Redirect URLs.
    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      log('warn', 'auth_google_start_failed', { code: error?.code ?? null });
      return message(error ?? {});
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') {
      log('info', 'auth_google_closed', { result: result.type });
      return 'Conectarea cu Google nu s-a încheiat.';
    }
    const code = new URL(result.url).searchParams.get('code');
    if (!code) {
      // Fără cod, Supabase a refuzat întoarcerea (de ex. adresa lipsește din Redirect URLs); motivul vine în URL.
      log('warn', 'auth_google_no_code', { reason: new URL(result.url).searchParams.get('error_description') });
      return 'Conectarea cu Google nu s-a încheiat. Încearcă din nou.';
    }
    const exchanged = await supabase.auth.exchangeCodeForSession(code);
    if (exchanged.error) log('warn', 'auth_google_exchange_failed', { code: exchanged.error.code ?? null });
    return message(exchanged.error);
  }

  /** Confirmă din nou identitatea: o conectare nouă dă tokenului o oră de autentificare recentă. */
  async function confirmIdentity(password: string | null): Promise<string | null> {
    const before = session?.user.id;
    if (password === null) {
      const problem = await signInWithGoogle();
      if (problem) return problem;
      // Altă adresă Google ar deschide alt cont; acțiunea se oprește, iar telefonul rămâne în contul ales acum.
      const { data } = await supabase.auth.getSession();
      return data.session?.user.id === before ? null : 'Ai ales alt cont Google. Acum ești conectat în acel cont; acțiunea nu a fost făcută.';
    }
    const email = session?.user.email;
    if (!email) return 'Contul nu are o adresă de e-mail.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) log('warn', 'auth_reauth_failed', { code: error.code ?? null });
    return error ? (error.code === 'invalid_credentials' ? 'Parola actuală nu este corectă.' : message(error)) : null;
  }

  const auth: Auth = {
    session,
    configured: supabaseConfigured,
    notice,
    signInWithPassword,
    async signInWithGoogle() {
      const problem = await signInWithGoogle();
      return problem === 'Conectarea cu Google nu s-a încheiat.' ? null : problem;
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async register(email, password) {
      email = email.trim();
      if (!validEmail(email)) return { error: 'Introdu o adresă de e-mail validă.' };
      const weak = passwordProblem(password);
      if (weak) return { error: weak };
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: EMAIL_CALLBACK } });
      // Ca pe server: fără confirmarea adresei nu se intră în cont, chiar dacă furnizorul ar fi configurat greșit.
      if (data.session) {
        log('error', 'auth_register_without_confirmation');
        await supabase.auth.signOut({ scope: 'local' });
        return { error: 'Înregistrarea nu este disponibilă momentan. Încearcă mai târziu.' };
      }
      if (error && error.code !== 'user_already_exists') {
        log('warn', 'auth_register_failed', { code: error.code ?? null, status: error.status ?? null });
        return { error: error.status === 429 ? 'Prea multe încercări. Așteaptă înainte să reîncerci.' : 'Înregistrarea nu a putut fi procesată. Reîncearcă mai târziu.' };
      }
      // Același mesaj și când adresa există deja: nu spunem cine are cont.
      return { message: 'Dacă adresa poate fi înregistrată, vei primi un e-mail de confirmare. Deschide linkul din el, apoi intră în cont aici. Verifică și folderul Spam.' };
    },
    async resendConfirmation(email) {
      email = email.trim();
      if (!validEmail(email)) return { error: 'Introdu o adresă de e-mail validă.' };
      const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: EMAIL_CALLBACK } });
      if (error) log('warn', 'auth_resend_failed', { code: error.code ?? null });
      return error ? { error: 'Solicitarea nu a putut fi procesată acum. Așteaptă și reîncearcă.' } : { message: 'Dacă adresa este eligibilă, vei primi din nou e-mailul de confirmare. Verifică și folderul Spam.' };
    },
    async resetPassword(email) {
      email = email.trim();
      if (!validEmail(email)) return { error: 'Introdu o adresă de e-mail validă.' };
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: EMAIL_CALLBACK });
      if (error) log('warn', 'auth_reset_failed', { code: error.code ?? null });
      return error
        ? { error: 'Solicitarea nu a putut fi procesată acum. Așteaptă și reîncearcă.' }
        : { message: 'Dacă adresa are cont, vei primi un e-mail cu linkul de recuperare. Parola nouă o alegi pe profplus.ro, apoi intri cu ea și aici.' };
    },
    async changePassword(current, next) {
      const weak = passwordProblem(next);
      if (weak) return { error: weak };
      const problem = await confirmIdentity(current);
      if (problem) return { error: problem };
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) {
        log('warn', 'auth_password_change_failed', { code: error.code ?? null });
        return { error: error.code === 'same_password' ? 'Parola nouă trebuie să fie diferită de cea actuală.' : 'Parola nu a putut fi schimbată. Încearcă din nou.' };
      }
      // Ca pe site, parola nouă închide celelalte sesiuni; telefonul rămâne conectat.
      await supabase.auth.signOut({ scope: 'others' });
      return { message: 'Parola a fost schimbată. Celelalte dispozitive au fost deconectate.' };
    },
    async changeEmail(current, email) {
      email = email.trim();
      if (!validEmail(email)) return { error: 'Introdu o adresă de e-mail validă.' };
      const problem = await confirmIdentity(current);
      if (problem) return { error: problem };
      const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: EMAIL_CALLBACK });
      if (error) log('warn', 'auth_email_change_failed', { code: error.code ?? null });
      return error ? { error: 'Schimbarea e-mailului nu a putut fi solicitată.' } : { message: 'Verifică mesajele de confirmare trimise pe adresele de e-mail implicate.' };
    },
    async signOutEverywhere() {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        log('warn', 'auth_global_sign_out_failed', { code: error.code ?? null });
        return { error: 'Deconectarea a eșuat. Reîncearcă.' };
      }
      // Și telefonul iese din cont; mesajul apare pe ecranul de intrare.
      setNotice('Te-ai deconectat de pe toate dispozitivele.');
      return { message: 'Te-ai deconectat de pe toate dispozitivele.' };
    },
    async deleteAccount(password) {
      const problem = await confirmIdentity(password);
      if (problem === 'Conectarea cu Google nu s-a încheiat.') return null;
      if (problem) return { error: problem };
      try {
        await api.account.update({ action: 'delete', confirmation: 'STERGE' });
      } catch (e) {
        log('error', 'account_delete_failed', { status: e instanceof ApiError ? e.status : 0 });
        return { error: e instanceof ApiError ? e.message : 'Ștergerea nu a putut fi pornită. Verifică internetul și reîncearcă.' };
      }
      await Promise.all([
        ...LOCAL_KEYS.async.map((key) => AsyncStorage.removeItem(key).catch(() => undefined)),
        ...LOCAL_KEYS.secure.map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)),
      ]);
      // Contul nu mai există pe server; închidem doar sesiunea de pe telefon.
      await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
      setSession(null);
      setNotice('Contul ProfPlus și datele active asociate au fost șterse.');
      return { message: 'Contul a fost șters.' };
    },
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth needs AuthProvider');
  return auth;
}
