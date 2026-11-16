// Intrarea în cont (P-195): e-mail și parolă sau Google, cont nou și recuperarea parolei (Supabase, ca pe site).
// P-310: e-mailul și parola sunt metoda principală, sus; Google dedesubt, după „sau”, cu sigla oficială.
// După conectare ecranul se închide și fila Cont arată contul.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GoogleButton } from '@/components/account/google-button';
import { PasswordRules } from '@/components/account/password-rules';
import { Notice } from '@/components/account/notice';
import { TeachingForm } from '@/components/account/teaching-form';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth, type Outcome } from '@/lib/auth';
import { useAccount } from '@/lib/use-account';

// P-310: „profil” e pasul 2 al contului nou (sau al primei intrări cu Google): ce fel de cadru didactic ești.
type Mode = 'login' | 'register' | 'forgot' | 'profil';
const TITLES: Record<Mode, string> = { login: 'Intră în cont', register: 'Creează-ți contul', forgot: 'Ai uitat parola?', profil: 'Spune-ne ce predai' };

export default function SignInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { session, configured, signInWithPassword, signInWithGoogle, register, resendConfirmation, resetPassword, signOut } = useAuth();
  const { account } = useAccount();
  const { mod } = useLocalSearchParams<{ mod?: string }>();
  const [mode, setMode] = useState<Mode>(mod === 'cont-nou' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [emailAgain, setEmailAgain] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  // Serverul spune dacă e-mailul și conturile noi sunt pornite; până răspunde, rămâne doar intrarea.
  const emailEnabled = !!account?.emailEnabled;
  // Formularul cu e-mail apare și cât timp contul se încarcă, ca ecranul să nu sară; serverul refuză oricum dacă e oprit.
  const showEmail = emailEnabled || !account;
  const registration = !!account?.registration;

  // După intrare: un cont fără profil didactic continuă cu pasul 2; celelalte închid ecranul.
  const needsProfile = !!session && account?.provider === 'supabase' && !!account.user && !account.user.teaching && !account.user.deleting;
  useEffect(() => {
    if (!session || !account?.user) return;
    if (needsProfile) setMode('profil');
    else router.back();
  }, [session, account, needsProfile, router]);

  if (!configured) {
    return (
      <Screen title="Intră în cont" back>
        <Card>
          <ThemedText>Aplicația nu are încă adresa serverului de autentificare (mobile/.env.local).</ThemedText>
        </Card>
      </Screen>
    );
  }

  function switchTo(next: Mode) {
    setMode(next);
    setPassword('');
    setEmailAgain('');
    setConfirm('');
    setOutcome(null);
  }

  async function run(kind: string, action: () => Promise<Outcome | string | null>) {
    setBusy(kind);
    setOutcome(null);
    const result = await action();
    setBusy(null);
    setOutcome(typeof result === 'string' ? { error: result } : result);
    if (result && typeof result !== 'string' && 'message' in result) {
      setPassword('');
      setConfirm('');
    }
  }

  // P-310: ca pe site: e-mailul și parola sus, apoi „Ai uitat parola?”, „sau” și butonul Google cu sigla oficială; jos, trecerea
  // între intrare și contul nou. Retrimiterea confirmării apare după un mesaj (eroare la intrare sau cont nou creat).
  const login = () => run('password', () => signInWithPassword(email, password));
  if (mode === 'profil' && account?.user) {
    return (
      <Screen title={TITLES.profil}>
        <Card>
          <ThemedText themeColor="muted">Profi alege manualele, exemplele și nivelul materialelor după ce predai. Poți modifica oricând aceste date din Cont → Profil.</ThemedText>
          <TeachingForm account={account} showName onSaved={() => router.back()} />
        </Card>
        <View style={styles.switch}>
          <ThemedText themeColor="muted">Nu ești tu?</ThemedText>
          <Button variant="ghost" onPress={() => { setMode('login'); void signOut(); }}>Ieși din cont</Button>
        </View>
      </Screen>
    );
  }
  return (
    <Screen title={TITLES[mode]} back>
      <Card>
        {mode === 'forgot' ? (
          <ThemedText themeColor="muted">Scrie adresa contului de două ori. Îți trimitem un link de recuperare; parola nouă o alegi pe profplus.ro.</ThemedText>
        ) : null}
        {showEmail ? (
          <>
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="nume@exemplu.com"
              maxLength={254}
            />
            {mode === 'forgot' ? (
              <TextField
                label="Confirmă e-mailul"
                value={emailAgain}
                onChangeText={setEmailAgain}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="nume@exemplu.com"
                maxLength={254}
              />
            ) : null}
            {mode !== 'forgot' ? (
              <TextField
                label="Parolă"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                textContentType={mode === 'login' ? 'password' : 'newPassword'}
                maxLength={128}
                onSubmitEditing={mode === 'login' ? login : undefined}
              />
            ) : null}
            {mode === 'register' ? (
              <>
                <TextField label="Confirmă parola" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={128} />
                <PasswordRules value={password} />
              </>
            ) : null}
            <Notice outcome={outcome} />
            {mode === 'login' ? (
              <Button onPress={login} loading={busy === 'password'} disabled={!email || !password || busy !== null}>
                Intră în cont
              </Button>
            ) : mode === 'register' ? (
              <Button
                onPress={() => (password === confirm ? run('register', () => register(email, password)) : setOutcome({ error: 'Parolele nu coincid.' }))}
                loading={busy === 'register'}
                disabled={!email || !password || !confirm || busy !== null}>
                Creează contul
              </Button>
            ) : (
              <Button
                onPress={() => (email.trim().toLowerCase() === emailAgain.trim().toLowerCase() ? run('forgot', () => resetPassword(email)) : setOutcome({ error: 'Adresele de e-mail nu coincid.' }))}
                loading={busy === 'forgot'}
                disabled={!email || !emailAgain || busy !== null}>
                Trimite linkul de recuperare
              </Button>
            )}
            {mode === 'login' ? (
              <Button variant="ghost" onPress={() => switchTo('forgot')} disabled={busy !== null}>
                Ai uitat parola?
              </Button>
            ) : null}
            {mode !== 'forgot' && outcome ? (
              <Button variant="ghost" onPress={() => run('resend', () => resendConfirmation(email))} loading={busy === 'resend'} disabled={!email || busy !== null}>
                Retrimite e-mailul de confirmare
              </Button>
            ) : null}
          </>
        ) : (
          <Notice outcome={outcome} />
        )}
        {mode !== 'forgot' ? (
          <>
            {showEmail ? (
              <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <View style={[styles.line, { backgroundColor: theme.border }]} />
                <ThemedText type="small" themeColor="subtle">sau</ThemedText>
                <View style={[styles.line, { backgroundColor: theme.border }]} />
              </View>
            ) : null}
            <GoogleButton label={mode === 'register' ? 'Creează cont cu Google' : 'Continuă cu Google'} onPress={() => run('google', signInWithGoogle)} loading={busy === 'google'} disabled={busy !== null} />
            <ThemedText type="small" themeColor="muted" style={styles.center}>
              {mode === 'register' ? 'Prin crearea contului accepți ' : 'Prin conectare accepți '}
              <ThemedText type="small" themeColor="accentText" accessibilityRole="link" onPress={() => openBrowserAsync(SITE_URL + '/termeni')}>Termenii de utilizare</ThemedText> și{' '}
              <ThemedText type="small" themeColor="accentText" accessibilityRole="link" onPress={() => openBrowserAsync(SITE_URL + '/confidentialitate')}>Politica de confidențialitate</ThemedText>.
            </ThemedText>
          </>
        ) : null}
      </Card>
      {emailEnabled ? (
        <View style={styles.switch}>
          {mode === 'login' ? (
            registration ? (
              <>
                <ThemedText themeColor="muted">Nu ai cont?</ThemedText>
                <Button variant="ghost" onPress={() => switchTo('register')} disabled={busy !== null}>Înregistrează-te</Button>
              </>
            ) : null
          ) : mode === 'register' ? (
            <>
              <ThemedText themeColor="muted">Ai deja cont?</ThemedText>
              <Button variant="ghost" onPress={() => switchTo('login')} disabled={busy !== null}>Intră în cont</Button>
            </>
          ) : (
            <Button variant="ghost" onPress={() => switchTo('login')} disabled={busy !== null}>Înapoi la intrarea în cont</Button>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  switch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.one },
});
