// Conectare și securitate, ca pe site: metodele asociate contului, parola și adresa de e-mail.
// Parola și e-mailul cer parola actuală: o conectare nouă înseamnă autentificare recentă, ca regula de 15 minute a serverului.
// Deconectarea (de pe telefon sau de pe toate dispozitivele) e în meniul Cont.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { AccountResponse } from '@/lib/api';
import { PASSWORD_MIN, useAuth, type Outcome } from '@/lib/auth';

type Open = 'password' | 'email' | null;

export function SecurityCard({ account }: { account: AccountResponse }) {
  const { changePassword, changeEmail } = useAuth();
  const linked = account.user?.linkedProviders ?? [];
  const passwordAccount = account.emailEnabled && linked.includes('email');
  const [open, setOpen] = useState<Open>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<Open>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function toggle(section: Open) {
    setOpen(open === section ? null : section);
    setCurrent('');
    setNext('');
    setConfirm('');
    setOutcome(null);
  }

  async function run(kind: Open, action: () => Promise<Outcome>) {
    setBusy(kind);
    setOutcome(null);
    const result = await action();
    setBusy(null);
    setOutcome(result);
    if ('message' in result) {
      setOpen(null);
      setCurrent('');
      setNext('');
      setConfirm('');
      setEmail('');
    }
  }

  const methods = [
    ['E-mail și parolă', linked.includes('email')],
    ['Google', linked.includes('google')],
    ['Apple', linked.includes('apple')],
  ] as const;
  const currentField = (
    <TextField label="Parola actuală" value={current} onChangeText={setCurrent} secureTextEntry autoComplete="current-password" textContentType="password" />
  );

  return (
    <Card eyebrow="Conectare și securitate">
      {methods
        .filter(([, on]) => on)
        .map(([label]) => (
          <View key={label} style={styles.method}>
            <ThemedText>{label}</ThemedText>
            <ThemedText type="small" themeColor="softText">
              Asociat contului
            </ThemedText>
          </View>
        ))}
      {passwordAccount ? (
        <>
          <Button variant="secondary" onPress={() => toggle('password')} disabled={busy !== null}>
            Schimbă parola
          </Button>
          {open === 'password' ? (
            <View style={styles.form}>
              {currentField}
              <TextField label="Parola nouă" value={next} onChangeText={setNext} secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={128} />
              <TextField label="Confirmă parola nouă" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" maxLength={128} />
              <ThemedText type="small" themeColor="muted">
                Cel puțin {PASSWORD_MIN} caractere. Celelalte dispozitive vor fi deconectate.
              </ThemedText>
              <Button
                onPress={() => (next === confirm ? run('password', () => changePassword(current, next)) : setOutcome({ error: 'Parolele nu coincid.' }))}
                loading={busy === 'password'}
                disabled={!current || !next || !confirm || busy !== null}>
                Salvează parola
              </Button>
            </View>
          ) : null}
          <Button variant="secondary" onPress={() => toggle('email')} disabled={busy !== null}>
            Schimbă adresa de e-mail
          </Button>
          {open === 'email' ? (
            <View style={styles.form}>
              <TextField
                label="Adresă nouă"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                maxLength={254}
              />
              {currentField}
              <ThemedText type="small" themeColor="muted">
                Schimbarea se confirmă din e-mailurile trimise pe adresa veche și pe cea nouă.
              </ThemedText>
              <Button onPress={() => run('email', () => changeEmail(current, email))} loading={busy === 'email'} disabled={!email || !current || busy !== null}>
                Trimite confirmarea
              </Button>
            </View>
          ) : null}
        </>
      ) : (
        <ThemedText type="small" themeColor="muted">
          Te conectezi cu Google. Parola și adresa se schimbă din contul Google.
        </ThemedText>
      )}
      <Notice outcome={outcome} />
    </Card>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.two },
  method: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
});
