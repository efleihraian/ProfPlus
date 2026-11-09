// Intrarea în cont (P-195): e-mail și parolă sau Google, cont nou și recuperarea parolei (Supabase, ca pe site).
// După conectare ecranul se închide și fila Cont arată contul.
import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { PASSWORD_MIN, useAuth, type Outcome } from '@/lib/auth';
import { useAccount } from '@/lib/use-account';

type Mode = 'login' | 'register' | 'forgot';
const TITLES: Record<Mode, string> = { login: 'Intră în cont', register: 'Creează un cont', forgot: 'Ai uitat parola?' };

export default function SignInScreen() {
  const router = useRouter();
  const { session, configured, signInWithPassword, signInWithGoogle, register, resendConfirmation, resetPassword } = useAuth();
  const { account } = useAccount();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  // Serverul spune dacă e-mailul și conturile noi sunt pornite; până răspunde, rămâne doar intrarea.
  const emailEnabled = !!account?.emailEnabled;
  const registration = !!account?.registration;

  useEffect(() => {
    if (session) router.back();
  }, [session, router]);

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

  return (
    <Screen title={TITLES[mode]} intro={mode === 'login' ? 'Același cont ca pe profplus.ro: conversațiile, documentele și clasele te așteaptă și aici.' : undefined} back>
      <Card>
        {mode !== 'forgot' ? (
          <>
            <Button variant="secondary" onPress={() => run('google', signInWithGoogle)} loading={busy === 'google'} disabled={busy !== null}>
              Continuă cu Google
            </Button>
            <ThemedText type="small" themeColor="subtle" style={styles.center}>
              sau cu e-mail
            </ThemedText>
          </>
        ) : (
          <ThemedText themeColor="muted">Îți trimitem un link de recuperare. Parola nouă o alegi pe profplus.ro, apoi intri cu ea și aici.</ThemedText>
        )}
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="nume@scoala.ro"
          maxLength={254}
        />
        {mode !== 'forgot' ? (
          <TextField
            label="Parolă"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            textContentType={mode === 'login' ? 'password' : 'newPassword'}
            maxLength={128}
            onSubmitEditing={mode === 'login' ? () => run('password', () => signInWithPassword(email, password)) : undefined}
          />
        ) : null}
        {mode === 'register' ? (
          <>
            <TextField label="Confirmă parola" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={128} />
            <ThemedText type="small" themeColor="muted">
              Cel puțin {PASSWORD_MIN} caractere. Confirmarea e-mailului este necesară înainte de prima conectare. Numărul de telefon nu este solicitat.
            </ThemedText>
          </>
        ) : null}
        <Notice outcome={outcome} />
        {mode === 'login' ? (
          <Button onPress={() => run('password', () => signInWithPassword(email, password))} loading={busy === 'password'} disabled={!email || !password || busy !== null}>
            Intră în cont
          </Button>
        ) : mode === 'register' ? (
          <Button
            onPress={() => (password === confirm ? run('register', () => register(email, password)) : setOutcome({ error: 'Parolele nu coincid.' }))}
            loading={busy === 'register'}
            disabled={!email || !password || !confirm || busy !== null}>
            Creează cont
          </Button>
        ) : (
          <Button onPress={() => run('forgot', () => resetPassword(email))} loading={busy === 'forgot'} disabled={!email || busy !== null}>
            Trimite linkul de recuperare
          </Button>
        )}
        {mode !== 'forgot' ? (
          <View style={styles.legal}>
            <ThemedText type="small" themeColor="muted">
              {mode === 'register' ? 'Prin crearea contului confirmi că ai cel puțin 18 ani și accepți Termenii de utilizare.' : 'Prin conectare accepți Termenii de utilizare.'}
            </ThemedText>
            <View style={styles.links}>
              <Button variant="secondary" onPress={() => openBrowserAsync(SITE_URL + '/termeni')}>
                Termenii de utilizare
              </Button>
            </View>
          </View>
        ) : null}
      </Card>
      {emailEnabled ? (
        <Card>
          {mode !== 'login' ? (
            <Button variant="secondary" onPress={() => switchTo('login')} disabled={busy !== null}>
              Am deja cont
            </Button>
          ) : null}
          {mode !== 'register' && registration ? (
            <Button variant="secondary" onPress={() => switchTo('register')} disabled={busy !== null}>
              Cont nou
            </Button>
          ) : null}
          {mode !== 'forgot' ? (
            <Button variant="secondary" onPress={() => switchTo('forgot')} disabled={busy !== null}>
              Am uitat parola
            </Button>
          ) : null}
          {mode !== 'forgot' ? (
            <Button variant="secondary" onPress={() => run('resend', () => resendConfirmation(email))} loading={busy === 'resend'} disabled={!email || busy !== null}>
              Retrimite confirmarea e-mailului
            </Button>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  legal: { gap: Spacing.two },
  links: { flexDirection: 'row', gap: Spacing.two },
});
