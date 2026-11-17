import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { SITE_URL } from '@/components/ui/coming-soon';
import { api, ApiError, appOAuthEntry } from '@/lib/api';
import { log } from '@/lib/log';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { PASSWORD_MAX, PASSWORD_MIN, weakPassword } from '../../../web/shared/password-rules';

WebBrowser.maybeCompleteAuthSession();

const EMAIL_CALLBACK = SITE_URL + '/auth/callback';
export { PASSWORD_MAX, PASSWORD_MIN };
const LOCAL_KEYS = { async: ['profplus-portfolio-extra'], secure: ['profplus-photo-notice-v1'] };

export type Outcome = { error: string } | { message: string };

type Auth = {
  session: Session | null | undefined;
  configured: boolean;
  mfaEnrolled: boolean;
  mfaState: "checking" | "verified" | "challenge" | "unavailable";
  checkMfa: () => void;
  notice: string | null;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  register: (email: string, password: string) => Promise<Outcome>;
  resendConfirmation: (email: string) => Promise<Outcome>;
  resetPassword: (email: string) => Promise<Outcome>;
  requestPasswordChange: () => Promise<Outcome>;
  changeEmail: (current: string, email: string) => Promise<Outcome>;
  signOutEverywhere: () => Promise<Outcome>;
  requestDeletionCode: () => Promise<Outcome>;
  deleteAccount: (code: string) => Promise<Outcome>;
};

const AuthContext = createContext<Auth | null>(null);

function message(error: { message?: string; code?: string } | null) {
  if (!error) return null;
  if (error.code === 'invalid_credentials') return 'Email sau parolă greșite.';
  if (error.code === 'email_not_confirmed') return 'Confirmă adresa de email din mesajul primit, apoi încearcă din nou.';
  if (error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') return 'Prea multe încercări. Așteaptă puțin și încearcă din nou.';
  return 'Nu te-am putut conecta. Verifică internetul și încearcă din nou.';
}

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
const passwordProblem = (password: string) =>
  password.length < PASSWORD_MIN || password.length > PASSWORD_MAX ? `Parola nouă trebuie să aibă între ${PASSWORD_MIN} și ${PASSWORD_MAX} de caractere.`
  : weakPassword(password) ? 'Parola este ușor de ghicit. Folosește o frază mai lungă, cu cel puțin 5 caractere diferite.' : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
  const [mfaCheck, setMfaCheck] = useState(0);
  const [mfa, setMfa] = useState<{token:string; state:Auth["mfaState"]; enrolled:boolean}>();
  const token = session?.access_token;
  const mfaState = !token ? "verified" : mfa?.token === token ? mfa.state : "checking";
  const mfaEnrolled = !!token && mfa?.token === token && mfa.enrolled;

  useEffect(() => {
    if (!token) return;
    let current = true;
    async function read(accessToken:string) {
      try {
        const {data,error} = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(accessToken);
        if (error) throw error;
        if (current) setMfa({token:accessToken,state:data.currentLevel!=="aal2"&&data.nextLevel==="aal2"?"challenge":"verified",enrolled:data.nextLevel==="aal2"});
      } catch {
        if (current) setMfa({token:accessToken,state:"unavailable",enrolled:false});
      }
    }
    void read(token);
    return () => { current = false; };
  },[token,mfaCheck]);

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
    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      log('warn', 'auth_google_start_failed', { code: error?.code ?? null });
      return message(error ?? {});
    }
    const start = appOAuthEntry(SITE_URL, data.url) ?? data.url;
    const result = await WebBrowser.openAuthSessionAsync(start, redirectTo);
    if (result.type !== 'success') {
      log('info', 'auth_google_closed', { result: result.type });
      return 'Conectarea cu Google nu s-a încheiat.';
    }
    const code = new URL(result.url).searchParams.get('code');
    if (!code) {
      log('warn', 'auth_google_no_code', { reason: new URL(result.url).searchParams.get('error_description') });
      return 'Conectarea cu Google nu s-a încheiat. Încearcă din nou.';
    }
    const exchanged = await supabase.auth.exchangeCodeForSession(code);
    if (exchanged.error) log('warn', 'auth_google_exchange_failed', { code: exchanged.error.code ?? null });
    return message(exchanged.error);
  }

  async function confirmIdentity(password: string): Promise<string | null> {
    if (mfaEnrolled) {
      const {data,error} = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const current = Date.now()/1000;
      const recent = !error && data.currentLevel === 'aal2' && data.currentAuthenticationMethods.some(method=>
        typeof method === 'object' && method.method === 'totp' && method.timestamp <= current+60 && current-method.timestamp <= 900);
      return recent ? null : 'Reconectează-te și confirmă codul din autentificator, apoi revino la această operație.';
    }
    const email = session?.user.email;
    if (!email) return 'Contul nu are o adresă de e-mail.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) log('warn', 'auth_reauth_failed', { code: error.code ?? null });
    return error ? (error.code === 'invalid_credentials' ? 'Parola actuală nu este corectă.' : message(error)) : null;
  }

  async function emailConfirmation(action: 'password-link' | 'delete-code'): Promise<Outcome> {
    try {
      const result = await api.account.update({ action });
      return { message: result.message || 'Verifică e-mailul contului, inclusiv folderul Spam.' };
    } catch (error) {
      return { error: error instanceof ApiError ? error.message : 'E-mailul nu a putut fi trimis. Încearcă din nou.' };
    }
  }

  const auth: Auth = {
    session,
    configured: supabaseConfigured,
    mfaEnrolled,mfaState,
    checkMfa() { setMfa(undefined); setMfaCheck(check=>check+1); },
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
      if (data.session) {
        log('error', 'auth_register_without_confirmation');
        await supabase.auth.signOut({ scope: 'local' });
        return { error: 'Înregistrarea nu este disponibilă momentan. Încearcă mai târziu.' };
      }
      if (error && error.code !== 'user_already_exists') {
        log('warn', 'auth_register_failed', { code: error.code ?? null, status: error.status ?? null });
        return { error: error.status === 429 ? 'Prea multe încercări. Așteaptă înainte să reîncerci.' : 'Înregistrarea nu a putut fi procesată. Reîncearcă mai târziu.' };
      }
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
        : { message: 'Dacă adresa are cont, vei primi un e-mail cu linkul de recuperare. Parola nouă o alegi pe profplus.ro, apoi intri cu ea și aici. Dacă ai 2FA, pregătește și autentificatorul.' };
    },
    async requestPasswordChange() {
      return emailConfirmation('password-link');
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
      setNotice('Te-ai deconectat de pe toate dispozitivele.');
      return { message: 'Te-ai deconectat de pe toate dispozitivele.' };
    },
    async requestDeletionCode() {
      return emailConfirmation('delete-code');
    },
    async deleteAccount(code) {
      try {
        await api.account.update({ action: 'delete', confirmation: 'STERGE', code });
      } catch (e) {
        log('error', 'account_delete_failed', { status: e instanceof ApiError ? e.status : 0 });
        return { error: e instanceof ApiError ? e.message : 'Ștergerea nu a putut fi pornită. Verifică internetul și reîncearcă.' };
      }
      await Promise.all([
        ...LOCAL_KEYS.async.map((key) => AsyncStorage.removeItem(key).catch(() => undefined)),
        ...LOCAL_KEYS.secure.map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)),
      ]);
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
