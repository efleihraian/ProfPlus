// Conectare și securitate, ca pe site: metodele asociate contului, parola și adresa de e-mail. P-310: fără texte explicative în plus.
// P-326: fiecare acțiune are un titlu scurt și o propoziție despre ce face; butoanele spun doar acțiunea.
// Adresa cere autentificare recentă. Schimbarea parolei pornește cu un link trimis pe e-mail.
// Deconectarea (de pe telefon sau de pe toate dispozitivele) e în meniul Cont.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccountMfa } from '@/components/account/account-mfa';
import { Notice } from '@/components/account/notice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { AccountResponse } from '@/lib/api';
import { useAuth, type Outcome } from '@/lib/auth';

type Open = 'password' | 'email' | null;

export function SecurityCard({ account }: { account: AccountResponse }) {
  const { requestPasswordChange, resetPassword, changeEmail, mfaEnrolled } = useAuth();
  const linked = account.user?.linkedProviders ?? [];
  const passwordAccount = account.emailEnabled && linked.includes('email');
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<Open>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function toggleEmail() {
    setOpen(!open);
    setCurrent('');
    setOutcome(null);
  }

  async function run(kind: Open, action: () => Promise<Outcome>) {
    setBusy(kind);
    setOutcome(null);
    const result = await action();
    setBusy(null);
    setOutcome(result);
    if ('message' in result) {
      setOpen(false);
      setCurrent('');
      setEmail('');
    }
  }

  const methods = [
    ['E-mail și parolă', linked.includes('email')],
    ['Google', linked.includes('google')],
    ['Apple', linked.includes('apple')],
  ] as const;
  const currentField = mfaEnrolled ? <ThemedText type="small">Pentru această operație, conectarea cu autentificatorul trebuie să fie recentă.</ThemedText> : (
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
      {account.accountMfaEnrollment || account.admin || mfaEnrolled ? <AccountMfa canEnroll={!!account.accountMfaEnrollment || account.admin} /> : null}
      {account.emailEnabled && account.user?.email ? (
        <View style={styles.group}>
          <ThemedText type="smallBold">Schimbă parola</ThemedText>
          <ThemedText type="small" themeColor="muted">
            Îți trimitem pe e-mail un link pentru parola nouă{mfaEnrolled ? ', care cere și codul de autentificare' : ''}.
          </ThemedText>
          <Button variant="secondary" onPress={() => void run('password', account.emailActionConfirmations ? requestPasswordChange : () => resetPassword(account.user!.email))} loading={busy === 'password'} disabled={busy !== null}>
            Trimite linkul
          </Button>
        </View>
      ) : null}
      {passwordAccount ? (
        <>
          <View style={styles.group}>
            <ThemedText type="smallBold">Adresa de e-mail</ThemedText>
            {account.user?.email ? (
              <ThemedText type="small" themeColor="muted" selectable>
                {account.user.email}
              </ThemedText>
            ) : null}
            <Button variant="secondary" onPress={toggleEmail} disabled={busy !== null}>
              {open ? 'Renunță' : 'Schimbă adresa'}
            </Button>
          </View>
          {open ? (
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
              <Button onPress={() => run('email', () => changeEmail(current, email))} loading={busy === 'email'} disabled={!email || (!mfaEnrolled&&!current) || busy !== null}>
                Trimite confirmarea
              </Button>
            </View>
          ) : null}
        </>
      ) : (
        <ThemedText type="small" themeColor="muted">
          Poți schimba adresa asociată conectării cu Google din contul Google.
        </ThemedText>
      )}
      <Notice outcome={outcome} />
    </Card>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.two },
  group: { gap: Spacing.one },
  method: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
});
